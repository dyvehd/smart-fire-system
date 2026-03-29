from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/smart_fire"
    )

    aio_username: str = ""
    aio_key: str = ""

    # Adafruit IO MQTT feed keys
    feed_sensor_results: str = "sfs-mqtt.sensor-slash-results"
    feed_device_status: str = "sfs-mqtt.sensor-slash-device-status"
    feed_ai_results: str = "sfs-mqtt.ai-slash-results"
    feed_alert: str = "sfs-mqtt.event-slash-alert-level-alarm-reason"
    feed_cmd_system: str = "sfs-mqtt.cmd-slash-system"
    feed_cmd_fan_pump: str = "sfs-mqtt.cmd-slash-fan-pump"
    feed_cmd_test_run: str = "sfs-mqtt.cmd-slash-test-run"

    @property
    def subscribe_feeds(self) -> list[str]:
        return [
            self.feed_sensor_results,
            self.feed_device_status,
            self.feed_ai_results,
            self.feed_alert,
        ]


settings = Settings()
