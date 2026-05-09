"""Dashboard stats router."""

from fastapi import APIRouter, HTTPException
from ..services import get_supabase
from ..schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    supabase = get_supabase()

    # Fetch all data in parallel
    projects_r = supabase.table("projects").select("id,status,budget,progress").execute()
    tasks_r = supabase.table("tasks").select("id,status,is_overdue").execute()
    workers_r = supabase.table("workers").select("id,status").execute()
    incidents_r = supabase.table("incidents").select("id,incident_date").execute()
    inspections_r = supabase.table("inspections").select("id,status").execute()

    projects = projects_r.data or []
    tasks = tasks_r.data or []
    workers = workers_r.data or []
    incidents = incidents_r.data or []
    inspections = inspections_r.data or []

    active = sum(1 for p in projects if p.get("status") == "active")
    completed = sum(1 for p in projects if p.get("status") == "completed")
    total_budget = sum(float(p.get("budget", 0)) for p in projects)
    active_workers = sum(1 for w in workers if w.get("status") == "active")
    overdue_tasks = sum(1 for t in tasks if t.get("is_overdue"))

    # Incidents in last 30 days
    from datetime import date, timedelta
    cutoff = date.today() - timedelta(days=30)
    recent = sum(
        1 for i in incidents
        if str(i.get("incident_date", "")) >= cutoff.isoformat()
    )

    pending_insp = sum(1 for ins in inspections if ins.get("status") == "pending")

    return DashboardStats(
        total_projects=len(projects),
        active_projects=active,
        completed_projects=completed,
        total_budget=total_budget,
        total_workers=len(workers),
        active_workers=active_workers,
        overdue_tasks=overdue_tasks,
        total_incidents=len(incidents),
        recent_incidents=recent,
        pending_inspections=pending_insp,
    )
