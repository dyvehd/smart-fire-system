from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    AIDetection,
    AlertEvent,
    CommandLog,
    DeviceStatusLog,
    SensorReading,
)
from app.schemas import (
    AIDetectionOut,
    AlertEventOut,
    CommandLogOut,
    DeviceStatusOut,
    SensorReadingOut,
    SystemState,
)

router = APIRouter(prefix="/api", tags=["state"])


@router.get("/state", response_model=SystemState)
async def get_system_state(db: AsyncSession = Depends(get_db)):
    """Return the latest row from each table as a single snapshot."""
    sensor = (
        await db.execute(
            select(SensorReading).order_by(SensorReading.timestamp.desc()).limit(1)
        )
    ).scalar_one_or_none()

    ai = (
        await db.execute(
            select(AIDetection).order_by(AIDetection.timestamp.desc()).limit(1)
        )
    ).scalar_one_or_none()

    alert = (
        await db.execute(
            select(AlertEvent).order_by(AlertEvent.timestamp.desc()).limit(1)
        )
    ).scalar_one_or_none()

    # Latest status per unique device_id
    subq = (
        select(
            DeviceStatusLog.device_id,
            DeviceStatusLog.timestamp,
        )
        .distinct(DeviceStatusLog.device_id)
        .order_by(DeviceStatusLog.device_id, DeviceStatusLog.timestamp.desc())
        .subquery()
    )
    device_rows = (
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

    last_cmd = (
        await db.execute(
            select(CommandLog).order_by(CommandLog.timestamp.desc()).limit(1)
        )
    ).scalar_one_or_none()

    return SystemState(
        sensor=SensorReadingOut.model_validate(sensor) if sensor else None,
        ai=AIDetectionOut.model_validate(ai) if ai else None,
        alert=AlertEventOut.model_validate(alert) if alert else None,
        device_status=[DeviceStatusOut.model_validate(d) for d in device_rows],
        last_command=CommandLogOut.model_validate(last_cmd) if last_cmd else None,
    )
