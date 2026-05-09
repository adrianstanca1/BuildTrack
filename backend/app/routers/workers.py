"""Workers router."""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from ..services import get_supabase
from ..schemas import WorkerCreate, WorkerUpdate, WorkerResponse

router = APIRouter(prefix="/workers", tags=["workers"])


@router.get("", response_model=list[WorkerResponse])
async def list_workers(
    role: Optional[str] = None,
    status: Optional[str] = Query(None, pattern=r"^(active|off-duty|on-leave)$"),
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    supabase = get_supabase()
    query = supabase.table("workers").select("*").order("name")

    if role:
        query = query.eq("role", role)
    if status:
        query = query.eq("status", status)
    if search:
        query = query.ilike("name", f"%{search}%")

    query = query.range(offset, offset + limit - 1)
    result = query.execute()
    if not result.data:
        return []
    return [WorkerResponse(**r) for r in result.data]


@router.get("/{worker_id}", response_model=WorkerResponse)
async def get_worker(worker_id: UUID):
    result = get_supabase().table("workers").select("*").eq("id", str(worker_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    return WorkerResponse(**result.data)


@router.post("", response_model=WorkerResponse, status_code=201)
async def create_worker(worker: WorkerCreate):
    result = get_supabase().table("workers").insert(worker.model_dump(mode="json")).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create worker")
    return WorkerResponse(**result.data[0])


@router.put("/{worker_id}", response_model=WorkerResponse)
async def update_worker(worker_id: UUID, worker: WorkerUpdate):
    updates = worker.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = get_supabase().table("workers").update(updates).eq("id", str(worker_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    return WorkerResponse(**result.data[0])


@router.delete("/{worker_id}", status_code=204)
async def delete_worker(worker_id: UUID):
    result = get_supabase().table("workers").delete().eq("id", str(worker_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    return None
