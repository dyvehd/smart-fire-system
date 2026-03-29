from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.mqtt import mqtt_service
from app.routers import ai, alerts, commands, devices, sensors, state

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await create_tables()
    logger.info("Database tables ensured")

    loop = asyncio.get_running_loop()
    mqtt_service.start(loop)

    yield

    # shutdown
    mqtt_service.stop()


app = FastAPI(
    title="Smart Fire System API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(state.router)
app.include_router(sensors.router)
app.include_router(ai.router)
app.include_router(alerts.router)
app.include_router(commands.router)
app.include_router(devices.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
