from typing import Optional
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

# ─── Enums ──────────────────────────────────────────────────────────────────

ProjectStatus = str  # 'planning'|'active'|'on-hold'|'completed'|'cancelled'
TaskPriorityStr = str  # 'low'|'medium'|'high'|'urgent'
TaskStatusStr = str  # 'pending'|'in-progress'|'completed'
IncidentSeverityStr = str  # 'low'|'medium'|'high'|'critical'
InspectionStatusStr = str  # 'pending'|'passed'|'failed'
WorkerRoleStr = str  # 'foreman'|'electrician'|'plumber'|'carpenter'|'mason'|'laborer'|'engineer'|'safety-officer'
WorkerStatusStr = str  # 'active'|'off-duty'|'on-leave'

# ─── Project ──────────────────────────────────────────────────────────────────

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1)
    description: Optional[str] = None
    budget: float = Field(default=0, ge=0)
    progress: int = Field(default=0, ge=0, le=100)
    status: str = Field(default="planning", pattern=r"^(planning|active|on-hold|completed|cancelled)$")
    start_date: date
    end_date: date
    team_size: int = Field(default=0, ge=0)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    location: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = Field(default=None, ge=0)
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    status: Optional[str] = Field(default=None, pattern=r"^(planning|active|on-hold|completed|cancelled)$")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    team_size: Optional[int] = Field(default=None, ge=0)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)

class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# ─── Task ─────────────────────────────────────────────────────────────────────

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str = Field(default="medium", pattern=r"^(low|medium|high|urgent)$")
    status: str = Field(default="pending", pattern=r"^(pending|in-progress|completed)$")
    due_date: date
    is_overdue: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = Field(default=None, pattern=r"^(low|medium|high|urgent)$")
    status: Optional[str] = Field(default=None, pattern=r"^(pending|in-progress|completed)$")
    due_date: Optional[date] = None
    is_overdue: Optional[bool] = None
    completed_at: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: UUID
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# ─── Incident ──────────────────────────────────────────────────────────────────

class IncidentBase(BaseModel):
    title: str = Field(..., min_length=1)
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    description: Optional[str] = None
    severity: str = Field(default="low", pattern=r"^(low|medium|high|critical)$")
    incident_date: date
    injuries: int = Field(default=0, ge=0)
    witnesses: Optional[list[str]] = None
    reported_by: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = Field(default=None, pattern=r"^(low|medium|high|critical)$")
    incident_date: Optional[date] = None
    injuries: Optional[int] = Field(default=None, ge=0)
    witnesses: Optional[list[str]] = None
    reported_by: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: UUID
    photos: Optional[list[str]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# ─── Inspection ────────────────────────────────────────────────────────────────

class InspectionBase(BaseModel):
    title: str = Field(..., min_length=1)
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    description: Optional[str] = None
    status: str = Field(default="pending", pattern=r"^(pending|passed|failed)$")
    inspection_date: date
    inspector: Optional[str] = None
    findings: Optional[list[str]] = None

class InspectionCreate(InspectionBase):
    pass

class InspectionUpdate(BaseModel):
    title: Optional[str] = None
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern=r"^(pending|passed|failed)$")
    inspection_date: Optional[date] = None
    inspector: Optional[str] = None
    findings: Optional[list[str]] = None

class InspectionResponse(InspectionBase):
    id: UUID
    photos: Optional[list[str]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# ─── Worker ────────────────────────────────────────────────────────────────────

class WorkerBase(BaseModel):
    name: str = Field(..., min_length=1)
    role: str = Field(..., pattern=r"^(foreman|electrician|plumber|carpenter|mason|laborer|engineer|safety-officer)$")
    status: str = Field(default="active", pattern=r"^(active|off-duty|on-leave)$")
    phone: Optional[str] = None
    email: Optional[str] = None
    weekly_hours: int = Field(default=40, ge=0, le=168)
    certifications: Optional[list[str]] = None
    project_assignments: Optional[list[UUID]] = None
    hourly_rate: Optional[float] = Field(default=0, ge=0)

class WorkerCreate(WorkerBase):
    pass

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = Field(default=None, pattern=r"^(foreman|electrician|plumber|carpenter|mason|laborer|engineer|safety-officer)$")
    status: Optional[str] = Field(default=None, pattern=r"^(active|off-duty|on-leave)$")
    phone: Optional[str] = None
    email: Optional[str] = None
    weekly_hours: Optional[int] = Field(default=None, ge=0, le=168)
    certifications: Optional[list[str]] = None
    project_assignments: Optional[list[UUID]] = None
    hourly_rate: Optional[float] = Field(default=None, ge=0)

class WorkerResponse(WorkerBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# ─── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_budget: float
    total_workers: int
    active_workers: int
    overdue_tasks: int
    total_incidents: int
    recent_incidents: int  # Last 30 days
    pending_inspections: int

class SafetyStats(BaseModel):
    total_incidents: int
    total_inspections: int
    days_since_last_incident: int
    incidents_by_severity: dict
    inspections_by_status: dict
    recent_incidents: list[IncidentResponse]
    recent_inspections: list[InspectionResponse]

class TeamStats(BaseModel):
    total_workers: int
    active_workers: int
    total_weekly_hours: int
    role_breakdown: dict
    recent_workers: list[WorkerResponse]
