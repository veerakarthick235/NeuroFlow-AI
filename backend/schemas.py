from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ───────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ─── Tasks ──────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"   # low | medium | high
    status: Optional[str] = "pending"    # pending | in_progress | completed
    estimated_time: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    estimated_time: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    estimated_time: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── AI ─────────────────────────────────────────────────────────────────────

class GoalRequest(BaseModel):
    goal: str


class GeneratedTask(BaseModel):
    title: str
    description: str
    priority: str
    estimated_time: str


class GenerateTasksResponse(BaseModel):
    goal: str
    tasks: List[GeneratedTask]


class InsightItem(BaseModel):
    category: str        # focus | pace | momentum | pattern
    message: str
    severity: str        # info | warning | success


class InsightsResponse(BaseModel):
    productivity_score: int
    insights: List[InsightItem]


class DailySummaryResponse(BaseModel):
    date: str
    tasks_completed: int
    tasks_pending: int
    tasks_total: int
    productivity_score: int
    ai_summary: str
    suggestions: List[str]
