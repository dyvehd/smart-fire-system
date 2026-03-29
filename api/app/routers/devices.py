from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import DeviceStatusLog
from app.schemas import DeviceStatusOut

router = APIRouter(prefix="/api", tags=["devices"])


@router.get("/devices/status", response_model=list[DeviceStatusOut])
async def get_device_status(db: AsyncSession = Depends(get_db)):
    """Return the latest status entry for each known device_id."""
    subq = (
        select(
            DeviceStatusLog.device_id,
            DeviceStatusLog.timestamp,
        )
        .distinct(DeviceStatusLog.device_id)
        .order_by(DeviceStatusLog.device_id, DeviceStatusLog.timestamp.desc())
        .subquery()
    )
    rows = (
        (
            await db.execute(
                select(DeviceStatusLog).join(
                    subq,
                    (DeviceStatusLog.device_id == subq.c.device_id)
                    & (DeviceStatusLog.timestamp == subq.c.timestamp),
                )
            )
        )
        .scalars()
        .all()
    )

    return [DeviceStatusOut.model_validate(r) for r in rows]
