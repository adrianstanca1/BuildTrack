"""Project CRUD router."""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, Depends
from ..services import get_supabase
from ..schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    status: Optional[str] = Query(None, pattern=r"^(planning|active|on-hold|completed|cancelled)$"),
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    supabase = get_supabase()
    query = supabase.table("projects").select("*").order("created_at", desc=True)

    if status:
        query = query.eq("status", status)
    if search:
        query = query.ilike("name", f"%{search}%")

    query = query.range(offset, offset + limit - 1)
    result = query.execute()

    if not result.data:
        return []
    return [ProjectResponse(**r) for r in result.data]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID):
    supabase = get_supabase()
    try:
        result = supabase.table("projects").select("*").eq("id", str(project_id)).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectResponse(**result.data)
    except Exception as e:
        if "not found" in str(e).lower() or "None" in str(e):
            raise HTTPException(status_code=404, detail="Project not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(project: ProjectCreate):
    supabase = get_supabase()
    data = project.model_dump(mode="json")
    result = supabase.table("projects").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create project")
    return ProjectResponse(**result.data[0])


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: UUID, project: ProjectUpdate):
    supabase = get_supabase()
    updates = project.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("projects")
        .update(updates)
        .eq("id", str(project_id))
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**result.data[0])


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: UUID):
    supabase = get_supabase()
    result = supabase.table("projects").delete().eq("id", str(project_id)).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
