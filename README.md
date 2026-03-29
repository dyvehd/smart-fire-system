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

**Notes:** For the prototype, the frontend subscribes directly to Adafruit IO via MQTT for live data, while the backend handles persistence and command relay. This will later be refactored so the frontend gets all data through the backend.

## Repository Structure

```
smart-fire-system/
  api/                  Backend server (FastAPI + PostgreSQL)
  web-client/           Frontend dashboard (React + Vite)
  references/           Design system, reference HTML pages, project notes
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

## Frontend (`web-client/`)

### Tech Stack

- React 19 + TypeScript
- Vite (build tool) + TailwindCSS v4
- TanStack Query (server state & caching)
- Recharts (data visualization)
- React Router (client-side routing)
- MQTT.js (direct Adafruit IO WebSocket connection for live data)

### Setup

```bash
cd web-client
cp .env.example .env   # fill in API URL and Adafruit IO credentials
npm install
npm run dev            # starts on http://localhost:5173
```

### Pages

| Route        | Page            | Description                                                     |
| ------------ | --------------- | --------------------------------------------------------------- |
| `/`          | Dashboard       | Live temp/humidity cards, AI camera feed, system activity log   |
| `/analytics` | Analytics       | Historical temperature chart, humidity drift, stat bento grid   |
| `/controls`  | Manual Controls | Fan/pump toggle switches, fire drill trigger, actuator status   |
| `/alerts`    | Alert Logs      | Filterable, paginated table of alerts and AI detection events   |
| `/ai`        | AI Monitoring   | Live AI view with bounding-box overlays, confidence meters, log |

### Data Architecture

- **Live data**: The frontend connects directly to Adafruit IO via MQTT WebSocket (`MqttLiveProvider`) to stream sensor readings, AI detections, alert levels, and device status in real time. This is wrapped in a React Context so the provider can be swapped later (e.g. to a backend WebSocket).
- **Historical data**: TanStack Query hooks fetch from the FastAPI backend REST API for charts, tables, and audit trails.
- **Commands**: POST requests to the backend, which logs and relays them to Adafruit IO via MQTT.

### Frontend File Structure

```
web-client/src/
  main.tsx                          Entry point
  App.tsx                           Router, QueryClient, providers
  index.css                         Tailwind imports, design tokens
  lib/
    constants.ts                    API URL, MQTT config, thresholds
    utils.ts                        Formatting helpers, cn()
  providers/
    types.ts                        LiveData interfaces
    live-data-context.ts            React Context definition
    mqtt-live-provider.tsx          MQTT adapter (Adafruit IO)
  api/
    client.ts                       fetch wrapper, query builder
    sensors.ts, ai.ts, alerts.ts    REST API modules
    commands.ts, state.ts
  hooks/
    use-sensors.ts, use-alerts.ts   TanStack Query hooks
    use-ai-detections.ts
    use-commands.ts, use-system-state.ts
  components/
    shared/
      material-icon.tsx             Google Material Symbols wrapper
      page-header.tsx               Shared page header component
    layout/
      app-layout.tsx                Shell (sidebar + topbar + outlet)
      sidebar.tsx, top-bar.tsx
      bottom-nav.tsx                Mobile navigation
  pages/
    dashboard.tsx, analytics.tsx
    manual-controls.tsx
    alert-logs.tsx, ai-monitoring.tsx
```

## Progress

| Component                  | Status                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| Monitoring (MCU + sensors) | Done                                                                |
| AI fire detection (YOLO)   | Done                                                                |
| IoT Gateway                | ~90% (missing: command forwarding to MCU, smarter alert evaluation) |
| Adafruit IO feeds          | Done                                                                |
| Backend API + Database     | Done                                                                |
| Basic Frontend Dashboard   | Done                                                                |
| Live AI Camera (Frontend)  | Not started                                                         |
