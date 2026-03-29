from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models import AlertLevel, AlarmReason, DeviceStatus


# Sensor


class SensorReadingOut(BaseModel):
    id: int
    temperature: float
    humidity: float
    timestamp: datetime

    model_config = {"from_attributes": True}


# AI Detection


class AIDetectionOut(BaseModel):
    id: int
    fire: bool
    fire_confidence: float
    smoke: bool
    smoke_confidence: float
    timestamp: datetime

    model_config = {"from_attributes": True}


# Alert


class AlertEventOut(BaseModel):
    id: int
    alert_level: AlertLevel
    alarm_reason: AlarmReason
    timestamp: datetime

    model_config = {"from_attributes": True}


# Device Status


class DeviceStatusOut(BaseModel):
    id: int
    device_id: str
    status: DeviceStatus
    message: str | None = None
    timestamp: datetime

    model_config = {"from_attributes": True}


# Command


class CommandLogOut(BaseModel):
    id: int
    command_type: str
    payload: dict | None = None
    source: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class SystemCommandIn(BaseModel):
    action: str = Field(..., pattern=r"^(on|off)$")


class FanPumpCommandIn(BaseModel):
    fan: str = Field(..., pattern=r"^(on|off|auto)$")
    pump: str = Field(..., pattern=r"^(on|off|auto)$")


class TestRunCommandIn(BaseModel):
    action: str = Field(..., pattern=r"^(on|off)$")


# Aggregate state snapshot


class SystemState(BaseModel):
    sensor: SensorReadingOut | None = None
    ai: AIDetectionOut | None = None
    alert: AlertEventOut | None = None
    device_status: list[DeviceStatusOut] = []
    last_command: CommandLogOut | None = None
