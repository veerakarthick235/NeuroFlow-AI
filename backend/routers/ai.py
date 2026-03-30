from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from services import ai_service
import models
import schemas

router = APIRouter(tags=["ai"])


@router.post("/generate-tasks", response_model=schemas.GenerateTasksResponse)
async def generate_tasks(
    payload: schemas.GoalRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not payload.goal or len(payload.goal.strip()) < 5:
        raise HTTPException(status_code=400, detail="Goal must be at least 5 characters long")

    tasks = await ai_service.generate_tasks_with_ai(payload.goal)
    return schemas.GenerateTasksResponse(goal=payload.goal, tasks=tasks)


@router.get("/insights", response_model=schemas.InsightsResponse)
async def get_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    return await ai_service.get_insights_with_ai(tasks)


@router.get("/daily-summary", response_model=schemas.DailySummaryResponse)
async def get_daily_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    return await ai_service.get_daily_summary_with_ai(tasks)
