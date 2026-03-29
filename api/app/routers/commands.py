import json
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import CommandLog
from app.mqtt import mqtt_service
from app.schemas import (
    CommandLogOut,
    FanPumpCommandIn,
    SystemCommandIn,
    TestRunCommandIn,
)

router = APIRouter(prefix="/api", tags=["commands"])


# Query


@router.get("/commands", response_model=list[CommandLogOut])
async def get_command_history(
    db: AsyncSession = Depends(get_db),
    start: datetime | None = Query(None, alias="from"),
    end: datetime | None = Query(None, alias="to"),
    limit: int = Query(200, ge=1, le=5000),
):
    stmt = select(CommandLog).order_by(CommandLog.timestamp.desc())
    if start:
        stmt = stmt.where(CommandLog.timestamp >= start)
    if end:
        stmt = stmt.where(CommandLog.timestamp <= end)
    stmt = stmt.limit(limit)

    rows = (await db.execute(stmt)).scalars().all()
    return [CommandLogOut.model_validate(r) for r in rows]


# Control commands


async def _log_and_publish(
    db: AsyncSession,
    command_type: str,
    feed_key: str,
    mqtt_value: str,
    payload: dict,
) -> CommandLog:
    row = CommandLog(
        command_type=command_type,
        payload=payload,
        source="frontend",
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    mqtt_service.publish(feed_key, mqtt_value)
    return row


@router.post("/commands/system", response_model=CommandLogOut)
async def command_system(
    body: SystemCommandIn,
    db: AsyncSession = Depends(get_db),
):
    row = await _log_and_publish(
        db,
        command_type="system",
        feed_key=settings.feed_cmd_system,
        mqtt_value=body.action,
        payload=body.model_dump(),
    )
    return CommandLogOut.model_validate(row)


@router.post("/commands/fan-pump", response_model=CommandLogOut)
async def command_fan_pump(
    body: FanPumpCommandIn,
    db: AsyncSession = Depends(get_db),
):
    row = await _log_and_publish(
        db,
        command_type="fan-pump",
        feed_key=settings.feed_cmd_fan_pump,
        mqtt_value=json.dumps(body.model_dump()),
        payload=body.model_dump(),
    )
    return CommandLogOut.model_validate(row)


@router.post("/commands/test-run", response_model=CommandLogOut)
async def command_test_run(
    body: TestRunCommandIn,
    db: AsyncSession = Depends(get_db),
):
    row = await _log_and_publish(
        db,
        command_type="test-run",
        feed_key=settings.feed_cmd_test_run,
        mqtt_value=body.action,
        payload=body.model_dump(),
    )
    return CommandLogOut.model_validate(row)
