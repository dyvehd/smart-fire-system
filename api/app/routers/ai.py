from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AIDetection
from app.schemas import AIDetectionOut

router = APIRouter(prefix="/api", tags=["ai"])


@router.get("/ai/detections", response_model=list[AIDetectionOut])
async def get_ai_detections(
    db: AsyncSession = Depends(get_db),
    start: datetime | None = Query(None, alias="from"),
    end: datetime | None = Query(None, alias="to"),
    only_positive: bool = Query(False, alias="onlyPositive"),
    limit: int = Query(200, ge=1, le=5000),
):
    stmt = select(AIDetection).order_by(AIDetection.timestamp.desc())
    if start:
        stmt = stmt.where(AIDetection.timestamp >= start)
    if end:
        stmt = stmt.where(AIDetection.timestamp <= end)
    if only_positive:
        stmt = stmt.where((AIDetection.fire == True) | (AIDetection.smoke == True))
    stmt = stmt.limit(limit)

    rows = (await db.execute(stmt)).scalars().all()
    return [AIDetectionOut.model_validate(r) for r in rows]
