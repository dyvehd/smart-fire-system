# Smart Fire Monitoring and Alarm System

An IoT-based fire monitoring system that combines environmental sensors, AI-powered fire detection, and a web dashboard for real-time alerting and remote control.

## System Architecture

```
Yolo:Bit + DHT20 + LCD + Fan + Pump + RGB LED
        |
        | USB Serial (JSON lines)
        v
   IoT Gateway (Python, on laptop)
        |  - Reads serial sensor data
        |  - Runs YOLO fire/smoke detection on webcam
        |  - Publishes telemetry to Adafruit IO (MQTT)
        |  - Subscribes to control commands
        |
        | MQTT
        v
   Adafruit IO Cloud
        |  - Feeds: sensor data, AI results, alerts, commands
        |
        | MQTT (bi-direction)
        |
        ->  Backend (FastAPI + PostgreSQL)  <----------+ HTTP REST
        |  - Persists all telemetry                    | (control commands, history query)
        |  - Exposes REST APIs                         |
        |                                              |
        | MQTT                                         |
        | (uni-direction, for live data only)          |
        |                                              |
        ->  Web Dashboard -----------------------------+
           - Real-time charts (temp/humidity)
           - AI detection status
           - Fan/Pump controls
           - Fire drill button
           - Alert panel & event history
```

For the prototype, the frontend subscribes directly to Adafruit IO via MQTT for live data, while the backend handles persistence and command relay. This will later be refactored so the frontend gets all data through the backend.

## Repository Structure

```
smart-fire-system/
  api/                  Backend server (FastAPI + PostgreSQL)
  web-client/           Frontend dashboard (to be built)
```

## Backend (`api/`)

### Tech Stack

- Python 3.13+ managed with [uv](https://docs.astral.sh/uv/)
- FastAPI + Uvicorn
- SQLAlchemy 2.0 (async) + asyncpg + PostgreSQL
- Adafruit IO MQTT client
- Pydantic v2 + pydantic-settings

### Setup

```bash
cd api
cp .env.example .env     # fill in DATABASE_URL and Adafruit IO credentials
uv sync
uv run python main.py    # starts on http://localhost:8000
```

Requires a running PostgreSQL instance. Tables are created automatically on first startup under the `smart_fire` schema.

### API Endpoints

**Data queries (GET)**

| Endpoint              | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `/api/state`          | Latest snapshot (sensor, AI, alert, devices)       |
| `/api/sensors`        | Historical sensor readings (`from`, `to`, `limit`) |
| `/api/ai/detections`  | AI detection log (`from`, `to`, `onlyPositive`)    |
| `/api/alerts`         | Alert event log (`from`, `to`)                     |
| `/api/commands`       | Command audit trail (`from`, `to`)                 |
| `/api/devices/status` | Latest status per device                           |

**Commands (POST)**

| Endpoint                 | Body            | Purpose |
| ------------------------ | --------------- | ------- |
| `/api/commands/system`   | `{"action": "on | off"}`  |
| `/api/commands/fan-pump` | `{"fan": "on    | off     |
| `/api/commands/test-run` | `{"action": "on | off"}`  |

For more details, see interactive docs at `http://localhost:8000/docs` (Swagger UI).

## Adafruit IO Feeds

| Feed Name                        | MQTT Key                                        | Direction        |
| -------------------------------- | ----------------------------------------------- | ---------------- |
| `sensor/results`                 | `sfs-mqtt.sensor-slash-results`                 | Gateway -> Cloud |
| `sensor/device-status`           | `sfs-mqtt.sensor-slash-device-status`           | Gateway -> Cloud |
| `ai/results`                     | `sfs-mqtt.ai-slash-results`                     | Gateway -> Cloud |
| `event/alert-level-alarm-reason` | `sfs-mqtt.event-slash-alert-level-alarm-reason` | Gateway -> Cloud |
| `cmd/system`                     | `sfs-mqtt.cmd-slash-system`                     | Cloud -> Gateway |
| `cmd/fan-pump`                   | `sfs-mqtt.cmd-slash-fan-pump`                   | Cloud -> Gateway |
| `cmd/test-run`                   | `sfs-mqtt.cmd-slash-test-run`                   | Cloud -> Gateway |

## Progress

| Component                  | Status                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| Monitoring (MCU + sensors) | Done                                                                |
| AI fire detection (YOLO)   | Done                                                                |
| IoT Gateway                | ~90% (missing: command forwarding to MCU, smarter alert evaluation) |
| Adafruit IO feeds          | Done                                                                |
| Backend API + Database     | Done                                                                |
| Frontend Dashboard         | Not started                                                         |
