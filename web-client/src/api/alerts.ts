import { apiFetch, buildQuery } from "./client";

export interface AlertEventOut {
  id: number;
  alert_level: "NORMAL" | "WARNING" | "ALARM";
  alarm_reason: "NONE" | "HIGH_TEMP" | "FIRE" | "TEST";
  timestamp: string;
}

interface AlertsParams {
  from?: string;
  to?: string;
  limit?: number;
}

export function getAlerts(params: AlertsParams = {}) {
  return apiFetch<AlertEventOut[]>(`/api/alerts${buildQuery(params)}`);
}
