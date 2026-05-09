"""Safety incidents and inspections router."""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from ..services import get_supabase
from ..schemas import (
    IncidentCreate, IncidentUpdate, IncidentResponse,
    InspectionCreate, InspectionUpdate, InspectionResponse,
    SafetyStats,
)

router = APIRouter(prefix="/safety", tags=["safety"])


# ─── Incidents ───────────────────────────────────────────────────────────────

@router.get("/incidents", response_model=list[IncidentResponse])
async def list_incidents(
    project_id: Optional[UUID] = None,
    severity: Optional[str] = Query(None, pattern=r"^(low|medium|high|critical)$"),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    supabase = get_supabase()
    query = supabase.table("incidents").select("*").order("incident_date", desc=True)

    if project_id:
        query = query.eq("project_id", str(project_id))
    if severity:
        query = query.eq("severity", severity)

    query = query.range(offset, offset + limit - 1)
    result = query.execute()
    if not result.data:
        return []
    return [IncidentResponse(**r) for r in result.data]


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: UUID):
    supabase = get_supabase()
    result = supabase.table("incidents").select("*").eq("id", str(incident_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse(**result.data)


@router.post("/incidents", response_model=IncidentResponse, status_code=201)
async def create_incident(incident: IncidentCreate):
    supabase = get_supabase()
    result = supabase.table("incidents").insert(incident.model_dump(mode="json")).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create incident")
    return IncidentResponse(**result.data[0])


@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
async def update_incident(incident_id: UUID, incident: IncidentUpdate):
    supabase = get_supabase()
    updates = incident.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("incidents").update(updates).eq("id", str(incident_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse(**result.data[0])


@router.delete("/incidents/{incident_id}", status_code=204)
async def delete_incident(incident_id: UUID):
    result = get_supabase().table("incidents").delete().eq("id", str(incident_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Incident not found")
    return None


# ─── Inspections ─────────────────────────────────────────────────────────────

@router.get("/inspections", response_model=list[InspectionResponse])
async def list_inspections(
    project_id: Optional[UUID] = None,
    status: Optional[str] = Query(None, pattern=r"^(pending|passed|failed)$"),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    supabase = get_supabase()
    query = supabase.table("inspections").select("*").order("inspection_date", desc=True)

    if project_id:
        query = query.eq("project_id", str(project_id))
    if status:
        query = query.eq("status", status)

    query = query.range(offset, offset + limit - 1)
    result = query.execute()
    if not result.data:
        return []
    return [InspectionResponse(**r) for r in result.data]


@router.get("/inspections/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(inspection_id: UUID):
    result = get_supabase().table("inspections").select("*").eq("id", str(inspection_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return InspectionResponse(**result.data)


@router.post("/inspections", response_model=InspectionResponse, status_code=201)
async def create_inspection(inspection: InspectionCreate):
    result = get_supabase().table("inspections").insert(inspection.model_dump(mode="json")).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create inspection")
    return InspectionResponse(**result.data[0])


@router.put("/inspections/{inspection_id}", response_model=InspectionResponse)
async def update_inspection(inspection_id: UUID, inspection: InspectionUpdate):
    updates = inspection.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = get_supabase().table("inspections").update(updates).eq("id", str(inspection_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return InspectionResponse(**result.data[0])


@router.delete("/inspections/{inspection_id}", status_code=204)
async def delete_inspection(inspection_id: UUID):
    result = get_supabase().table("inspections").delete().eq("id", str(inspection_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return None


# ─── Stats ───────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=SafetyStats)
async def get_safety_stats():
    supabase = get_supabase()
    from datetime import date, timedelta

    incidents_r = supabase.table("incidents").select("*").order("incident_date", desc=True).execute()
    inspections_r = supabase.table("inspections").select("*").order("inspection_date", desc=True).execute()

    incidents = incidents_r.data or []
    inspections = inspections_r.data or []

    # Severity breakdown
    severity_bd = {}
    for i in incidents:
        sev = i.get("severity", "low")
        severity_bd[sev] = severity_bd.get(sev, 0) + 1

    # Status breakdown
    status_bd = {}
    for ins in inspections:
        st = ins.get("status", "pending")
        status_bd[st] = status_bd.get(st, 0) + 1

    # Days since last incident
    days_since = 0
    if incidents:
        last_date = incidents[0].get("incident_date", "")
        try:
            ld = date.fromisoformat(str(last_date))
            days_since = (date.today() - ld).days
        except (ValueError, TypeError):
            pass

    # Last 30 days
    cutoff = date.today() - timedelta(days=30)
    recent_incidents = [
        i for i in incidents
        if str(i.get("incident_date", "")) >= cutoff.isoformat()
    ][:5]

    return SafetyStats(
        total_incidents=len(incidents),
        total_inspections=len(inspections),
        days_since_last_incident=days_since,
        incidents_by_severity=severity_bd,
        inspections_by_status=status_bd,
        recent_incidents=[IncidentResponse(**i) for i in recent_incidents],
        recent_inspections=[InspectionResponse(**ins) for ins in inspections[:5]],
    )
