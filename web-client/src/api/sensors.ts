import { apiFetch, buildQuery } from "./client";

export interface SensorReadingOut {
  id: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

interface SensorsParams {
  from?: string;
  to?: string;
  limit?: number;
}

export function getSensors(params: SensorsParams = {}) {
  return apiFetch<SensorReadingOut[]>(`/api/sensors${buildQuery(params)}`);
}
