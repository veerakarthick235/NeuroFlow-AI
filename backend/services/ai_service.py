import json
from datetime import date
from typing import List

from config import get_settings
import models
import schemas

settings = get_settings()


# ─────────────────────────────────────────────────────────────
# AI CLIENT (Bytez / OpenAI Compatible)
# ─────────────────────────────────────────────────────────────

def get_ai_client():
    from openai import AsyncOpenAI

    return AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=getattr(settings, "OPENAI_BASE_URL", None)
    )


# ─────────────────────────────────────────────────────────────
# SAFE JSON PARSER
# ─────────────────────────────────────────────────────────────

def safe_json_load(content: str):
    try:
        return json.loads(content)
    except Exception:
        return {}


# ─────────────────────────────────────────────────────────────
# DUMMY FALLBACK DATA
# ─────────────────────────────────────────────────────────────

DUMMY_TASKS = [
    {
        "title": "Define clear goal scope",
        "description": "Break the goal into measurable milestones.",
        "priority": "high",
        "estimated_time": "1 hour",
    },
    {
        "title": "Set up environment",
        "description": "Install dependencies and tools.",
        "priority": "high",
        "estimated_time": "2 hours",
    },
    {
        "title": "Research concepts",
        "description": "Understand required fundamentals.",
        "priority": "medium",
        "estimated_time": "1 day",
    },
    {
        "title": "Build MVP",
        "description": "Create initial working version.",
        "priority": "high",
        "estimated_time": "2 days",
    },
]


def _generate_dummy_tasks(goal: str):
    return [schemas.GeneratedTask(**t) for t in DUMMY_TASKS]


def _generate_dummy_insights(tasks: List[models.Task]):
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")
    score = int((completed / total) * 100) if total > 0 else 0

    insights = [
        schemas.InsightItem(
            category="focus",
            message="Start with high-priority tasks.",
            severity="info"
        )
    ]

    if completed > 0:
        insights.append(
            schemas.InsightItem(
                category="momentum",
                message=f"You completed {completed} tasks. Keep going.",
                severity="success"
            )
        )

    return schemas.InsightsResponse(productivity_score=score, insights=insights)


def _generate_dummy_summary(tasks: List[models.Task]):
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")
    pending = total - completed
    score = int((completed / total) * 100) if total > 0 else 0

    return schemas.DailySummaryResponse(
        date=date.today().isoformat(),
        tasks_completed=completed,
        tasks_pending=pending,
        tasks_total=total,
        productivity_score=score,
        ai_summary="Good progress today. Stay consistent.",
        suggestions=[
            "Focus on high-impact tasks",
            "Reduce distractions",
        ],
    )


# ─────────────────────────────────────────────────────────────
# AI: GENERATE TASKS
# ─────────────────────────────────────────────────────────────

async def generate_tasks_with_ai(goal: str):
    if not settings.OPENAI_API_KEY:
        return _generate_dummy_tasks(goal)

    try:
        client = get_ai_client()

        system_prompt = """Break the goal into actionable tasks.

Return JSON:
{
  "tasks": [
    {
      "title": "...",
      "description": "...",
      "priority": "high|medium|low",
      "estimated_time": "..."
    }
  ]
}"""

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": goal}
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content
        data = safe_json_load(content)

        tasks = data.get("tasks", [])
        return [schemas.GeneratedTask(**t) for t in tasks]

    except Exception as e:
        print("AI ERROR:", e)
        return _generate_dummy_tasks(goal)


# ─────────────────────────────────────────────────────────────
# AI: INSIGHTS
# ─────────────────────────────────────────────────────────────

async def get_insights_with_ai(tasks: List[models.Task]):
    if not settings.OPENAI_API_KEY:
        return _generate_dummy_insights(tasks)

    try:
        client = get_ai_client()

        task_data = [
            {"title": t.title, "priority": t.priority, "status": t.status}
            for t in tasks
        ]

        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        score = int((completed / total) * 100) if total > 0 else 0

        system_prompt = """Analyze productivity.

Return JSON:
{
  "insights": [
    {
      "category": "focus|momentum|pattern",
      "message": "...",
      "severity": "info|warning|success"
    }
  ]
}"""

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(task_data)}
            ],
            temperature=0.6,
        )

        content = response.choices[0].message.content
        data = safe_json_load(content)

        insights = [schemas.InsightItem(**i) for i in data.get("insights", [])]

        return schemas.InsightsResponse(
            productivity_score=score,
            insights=insights
        )

    except Exception as e:
        print("AI ERROR:", e)
        return _generate_dummy_insights(tasks)


# ─────────────────────────────────────────────────────────────
# AI: DAILY SUMMARY
# ─────────────────────────────────────────────────────────────

async def get_daily_summary_with_ai(tasks: List[models.Task]):
    if not settings.OPENAI_API_KEY:
        return _generate_dummy_summary(tasks)

    try:
        client = get_ai_client()

        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        pending = total - completed
        score = int((completed / total) * 100) if total > 0 else 0

        system_prompt = """Generate summary.

Return JSON:
{
  "ai_summary": "...",
  "suggestions": ["...", "..."]
}"""

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Completed {completed}/{total} tasks"}
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content
        data = safe_json_load(content)

        return schemas.DailySummaryResponse(
            date=date.today().isoformat(),
            tasks_completed=completed,
            tasks_pending=pending,
            tasks_total=total,
            productivity_score=score,
            ai_summary=data.get("ai_summary", ""),
            suggestions=data.get("suggestions", []),
        )

    except Exception as e:
        print("AI ERROR:", e)
        return _generate_dummy_summary(tasks)