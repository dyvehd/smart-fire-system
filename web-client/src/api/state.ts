import { apiFetch } from "./client";
import type { SensorReadingOut } from "./sensors";
import type { AIDetectionOut } from "./ai";
import type { AlertEventOut } from "./alerts";
import type { CommandLogOut } from "./commands";

export interface DeviceStatusOut {
  id: number;
  device_id: string;
  status: "online" | "offline" | "error";
  message: string | null;
  timestamp: string;
}

export interface SystemState {
  sensor: SensorReadingOut | null;
  ai: AIDetectionOut | null;
  alert: AlertEventOut | null;
  device_status: DeviceStatusOut[];
  last_command: CommandLogOut | null;
}

export function getSystemState() {
  return apiFetch<SystemState>("/api/state");
}
