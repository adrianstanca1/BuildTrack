"""Task CRUD router."""

from typing import Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from ..services import get_supabase
from ..schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    project_id: Optional[UUID] = None,
    status: Optional[str] = Query(None, pattern=r"^(pending|in-progress|completed)$"),
    priority: Optional[str] = Query(None, pattern=r"^(low|medium|high|urgent)$"),
    overdue: Optional[bool] = None,
    assigned_to: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    supabase = get_supabase()
    query = supabase.table("tasks").select("*").order("due_date")

    if project_id:
        query = query.eq("project_id", str(project_id))
    if status:
        query = query.eq("status", status)
    if priority:
        query = query.eq("priority", priority)
    if overdue is not None:
        query = query.eq("is_overdue", overdue)
    if assigned_to:
        query = query.eq("assigned_to", assigned_to)
    if search:
        query = query.ilike("title", f"%{search}%")

    query = query.range(offset, offset + limit - 1)
    result = query.execute()

    if not result.data:
        return []
    return [TaskResponse(**r) for r in result.data]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID):
    supabase = get_supabase()
    result = supabase.table("tasks").select("*").eq("id", str(task_id)).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**result.data)


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate):
    supabase = get_supabase()
    data = task.model_dump(mode="json")

    # Auto-set overdue if due date has passed
    if not data.get("is_overdue"):
        from datetime import date
        try:
            due = date.fromisoformat(str(data["due_date"]))
            data["is_overdue"] = due < date.today() and data.get("status") != "completed"
        except (ValueError, KeyError):
            pass

    result = supabase.table("tasks").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return TaskResponse(**result.data[0])


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: UUID, task: TaskUpdate):
    supabase = get_supabase()
    updates = task.model_dump(exclude_unset=True, mode="json")

    # If marking completed, set completed_at
    if updates.get("status") == "completed":
        updates["completed_at"] = datetime.utcnow().isoformat()

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = supabase.table("tasks").update(updates).eq("id", str(task_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**result.data[0])


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: UUID):
    supabase = get_supabase()
    result = supabase.table("tasks").delete().eq("id", str(task_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
