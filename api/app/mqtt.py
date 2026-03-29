from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

from Adafruit_IO import MQTTClient

from app.config import settings
from app.database import async_session
from app.models import (
    AIDetection,
    AlertEvent,
    AlertLevel,
    AlarmReason,
    DeviceStatus,
    DeviceStatusLog,
    SensorReading,
)

logger = logging.getLogger(__name__)

# regex patterns for the gateway's string payloads
_SENSOR_RE = re.compile(r"Temperature:\s*([\d.]+).*Humidity:\s*([\d.]+)", re.IGNORECASE)
_AI_RE = re.compile(
    r"fire:\s*(True|False),\s*conf:\s*([\d.]+),\s*"
    r"smoke:\s*(True|False),\s*conf:\s*([\d.]+)",
    re.IGNORECASE,
)


class MQTTService:
    """Bridges Adafruit IO MQTT and the local database.
    Subscribes to telemetry feeds coming from the IoT gateway and persists
    every message.  Exposes ``publish()`` so that REST command handlers can
    push control messages back to Adafruit IO.
    """

    def __init__(self) -> None:
        self._client = MQTTClient(settings.aio_username, settings.aio_key)
        self._client.on_connect = self._on_connect
        self._client.on_disconnect = self._on_disconnect
        self._client.on_message = self._on_message
        self._loop: asyncio.AbstractEventLoop | None = None

    # Lifecycle

    def start(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop
        self._client.connect()
        self._client.loop_background()
        logger.info("MQTT service started")

    def stop(self) -> None:
        try:
            self._client.disconnect()
        except Exception:
            pass
        logger.info("MQTT service stopped")

    # Publish (called from async route handlers)

    def publish(self, feed_key: str, value: Any) -> None:
        self._client.publish(feed_key, value)
        logger.info("Published to %s: %s", feed_key, value)

    # Adafruit IO callbacks

    def _on_connect(self, client: MQTTClient) -> None:
        logger.info("Connected to Adafruit IO — subscribing to telemetry feeds")
        for feed in settings.subscribe_feeds:
            client.subscribe(feed)

    def _on_disconnect(self, client: MQTTClient) -> None:
        logger.warning("Disconnected from Adafruit IO")

    def _on_message(self, client: MQTTClient, feed_key: str, payload: str) -> None:
        logger.debug("MQTT ← %s: %s", feed_key, payload)
        if self._loop is None:
            return
        asyncio.run_coroutine_threadsafe(self._persist(feed_key, payload), self._loop)

    # Persistence

    async def _persist(self, feed_key: str, payload: str) -> None:
        try:
            async with async_session() as session:
                row = self._parse(feed_key, payload)
                if row is not None:
                    session.add(row)
                    await session.commit()
        except Exception:
            logger.exception("Failed to persist message from %s", feed_key)

    def _parse(self, feed_key: str, payload: str) -> Any | None:
        """Turn a raw MQTT payload into the corresponding ORM model instance."""

        if feed_key == settings.feed_sensor_results:
            return self._parse_sensor(payload)
        if feed_key == settings.feed_device_status:
            return self._parse_device_status(payload)
        if feed_key == settings.feed_ai_results:
            return self._parse_ai(payload)
        if feed_key == settings.feed_alert:
            return self._parse_alert(payload)

        logger.warning("Unknown feed key: %s", feed_key)
        return None

    # Individual parsers

    @staticmethod
    def _parse_sensor(payload: str) -> SensorReading | None:
        # Gateway format: "Temperature: 25.3°C, Humidity: 60.1%"
        # Also accept JSON: {"temperature": 25.3, "humidity": 60.1}
        m = _SENSOR_RE.search(payload)
        if m:
            return SensorReading(
                temperature=float(m.group(1)), humidity=float(m.group(2))
            )
        try:
            data = json.loads(payload)
            return SensorReading(
                temperature=float(data["temperature"]),
                humidity=float(data["humidity"]),
            )
        except (json.JSONDecodeError, KeyError, TypeError):
            logger.warning("Unparseable sensor payload: %s", payload)
            return None

    @staticmethod
    def _parse_device_status(payload: str) -> DeviceStatusLog | None:
        raw = payload.strip().lower()
        try:
            status = DeviceStatus(raw)
        except ValueError:
            logger.warning("Unknown device status: %s", payload)
            return None
        return DeviceStatusLog(device_id="yolobit", status=status)

    @staticmethod
    def _parse_ai(payload: str) -> AIDetection | None:
        # Gateway format: "fire: True, conf: 0.85, smoke: False, conf: 0.12"
        m = _AI_RE.search(payload)
        if m:
            return AIDetection(
                fire=m.group(1).lower() == "true",
                fire_confidence=float(m.group(2)),
                smoke=m.group(3).lower() == "true",
                smoke_confidence=float(m.group(4)),
            )
        try:
            data = json.loads(payload)
            return AIDetection(
                fire=bool(data["fire"]),
                fire_confidence=float(data["fire_confidence"]),
                smoke=bool(data["smoke"]),
                smoke_confidence=float(data["smoke_confidence"]),
            )
        except (json.JSONDecodeError, KeyError, TypeError):
            logger.warning("Unparseable AI payload: %s", payload)
            return None

    @staticmethod
    def _parse_alert(payload: str) -> AlertEvent | None:
        # Gateway format: "ALARM:FIRE", "NORMAL:NONE", etc.
        parts = payload.strip().upper().split(":", 1)
        if len(parts) != 2:
            logger.warning("Unparseable alert payload: %s", payload)
            return None
        try:
            level = AlertLevel(parts[0])
            reason = AlarmReason(parts[1])
        except ValueError:
            logger.warning("Unknown alert level/reason: %s", payload)
            return None
        return AlertEvent(alert_level=level, alarm_reason=reason)


# Singleton used across the application
mqtt_service = MQTTService()
