export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const AIO_USERNAME = import.meta.env.VITE_AIO_USERNAME ?? "";
export const AIO_KEY = import.meta.env.VITE_AIO_KEY ?? "";
export const AIO_FEED_PREFIX = import.meta.env.VITE_AIO_FEED_PREFIX ?? "sfs-mqtt";

export const FEED_KEYS = {
  sensorResults: `${AIO_FEED_PREFIX}.sensor-slash-results`,
  deviceStatus: `${AIO_FEED_PREFIX}.sensor-slash-device-status`,
  aiResults: `${AIO_FEED_PREFIX}.ai-slash-results`,
  alertLevel: `${AIO_FEED_PREFIX}.event-slash-alert-level-alarm-reason`,
} as const;

export const TEMP_WARNING_THRESHOLD = 40;
export const TEMP_ALARM_THRESHOLD = 55;

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "dashboard" },
  { label: "Analytics", path: "/analytics", icon: "insights" },
  { label: "Manual Controls", path: "/controls", icon: "tune" },
  { label: "Alert Logs", path: "/alerts", icon: "history" },
  { label: "AI Monitoring", path: "/ai", icon: "psychology" },
] as const;
