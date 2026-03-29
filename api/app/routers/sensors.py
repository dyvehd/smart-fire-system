from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import SensorReading
from app.schemas import SensorReadingOut

router = APIRouter(prefix="/api", tags=["sensors"])


@router.get("/sensors", response_model=list[SensorReadingOut])
async def get_sensor_history(
    db: AsyncSession = Depends(get_db),
    start: datetime | None = Query(None, alias="from"),
    end: datetime | None = Query(None, alias="to"),
    limit: int = Query(200, ge=1, le=5000),
):
    stmt = select(SensorReading).order_by(SensorReading.timestamp.desc())
    if start:
        stmt = stmt.where(SensorReading.timestamp >= start)
    if end:
        stmt = stmt.where(SensorReading.timestamp <= end)
    stmt = stmt.limit(limit)

    rows = (await db.execute(stmt)).scalars().all()
    return [SensorReadingOut.model_validate(r) for r in rows]
