import { apiFetch } from "./client";

export interface CommandLogOut {
  id: number;
  command_type: string;
  payload: Record<string, string> | null;
  source: string;
  timestamp: string;
}

export function postSystemCommand(action: "on" | "off") {
  return apiFetch<CommandLogOut>("/api/commands/system", {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export function postFanPumpCommand(fan: string, pump: string) {
  return apiFetch<CommandLogOut>("/api/commands/fan-pump", {
    method: "POST",
    body: JSON.stringify({ fan, pump }),
  });
}

export function postTestRunCommand(action: "on" | "off") {
  return apiFetch<CommandLogOut>("/api/commands/test-run", {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export function getCommands(params: { from?: string; to?: string; limit?: number } = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return apiFetch<CommandLogOut[]>(`/api/commands${query ? `?${query}` : ""}`);
}
