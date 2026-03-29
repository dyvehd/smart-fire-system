from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, Index, Integer, JSON, MetaData, String, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


SCHEMA = "smart_fire"


class Base(DeclarativeBase):
    metadata = MetaData(schema=SCHEMA)


class AlertLevel(str, enum.Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    ALARM = "ALARM"


class AlarmReason(str, enum.Enum):
    NONE = "NONE"
    HIGH_TEMP = "HIGH_TEMP"
    FIRE = "FIRE"
    TEST = "TEST"


class DeviceStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    humidity: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (Index("ix_sensor_readings_timestamp", "timestamp"),)


class AIDetection(Base):
    __tablename__ = "ai_detections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fire: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fire_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    smoke: Mapped[bool] = mapped_column(Boolean, nullable=False)
    smoke_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (Index("ix_ai_detections_timestamp", "timestamp"),)


class AlertEvent(Base):
    __tablename__ = "alert_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    alert_level: Mapped[AlertLevel] = mapped_column(
        Enum(AlertLevel, name="alert_level_enum"), nullable=False
    )
    alarm_reason: Mapped[AlarmReason] = mapped_column(
        Enum(AlarmReason, name="alarm_reason_enum"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (Index("ix_alert_events_timestamp", "timestamp"),)


class DeviceStatusLog(Base):
    __tablename__ = "device_status_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[DeviceStatus] = mapped_column(
        Enum(DeviceStatus, name="device_status_enum"), nullable=False
    )
    message: Mapped[str | None] = mapped_column(String, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (Index("ix_device_status_log_timestamp", "timestamp"),)


class CommandLog(Base):
    __tablename__ = "command_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    command_type: Mapped[str] = mapped_column(String, nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    source: Mapped[str] = mapped_column(String, nullable=False, default="frontend")
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (Index("ix_command_log_timestamp", "timestamp"),)
