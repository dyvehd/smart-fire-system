import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemperature(value: number | null | undefined): string {
  if (value == null) return "--°C";
  return `${value.toFixed(1)}°C`;
}

export function formatHumidity(value: number | null | undefined): string {
  if (value == null) return "--%";
  return `${Math.round(value)}%`;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTimeFull(iso: string): string {
  return `${formatDate(iso)} · ${formatTimestamp(iso)}`;
}

export function confidencePercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
