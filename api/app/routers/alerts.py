from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AlertEvent
from app.schemas import AlertEventOut

router = APIRouter(prefix="/api", tags=["alerts"])


@router.get("/alerts", response_model=list[AlertEventOut])
async def get_alerts(
    db: AsyncSession = Depends(get_db),
    start: datetime | None = Query(None, alias="from"),
    end: datetime | None = Query(None, alias="to"),
    limit: int = Query(200, ge=1, le=5000),
):
    stmt = select(AlertEvent).order_by(AlertEvent.timestamp.desc())
    if start:
        stmt = stmt.where(AlertEvent.timestamp >= start)
    if end:
        stmt = stmt.where(AlertEvent.timestamp <= end)
    stmt = stmt.limit(limit)

    rows = (await db.execute(stmt)).scalars().all()
    return [AlertEventOut.model_validate(r) for r in rows]
