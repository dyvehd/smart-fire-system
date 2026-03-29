import { apiFetch, buildQuery } from "./client";

export interface AIDetectionOut {
  id: number;
  fire: boolean;
  fire_confidence: number;
  smoke: boolean;
  smoke_confidence: number;
  timestamp: string;
}

interface AIParams {
  from?: string;
  to?: string;
  onlyPositive?: boolean;
  limit?: number;
}

export function getAIDetections(params: AIParams = {}) {
  return apiFetch<AIDetectionOut[]>(`/api/ai/detections${buildQuery(params)}`);
}
