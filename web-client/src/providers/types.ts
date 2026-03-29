export type AlertLevel = "NORMAL" | "WARNING" | "ALARM";
export type AlarmReason = "NONE" | "HIGH_TEMP" | "FIRE" | "TEST";
export type DeviceStatusValue = "online" | "offline" | "error";
export interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}
export interface AIDetectionData {
  fire: boolean;
  fireConfidence: number;
  smoke: boolean;
  smokeConfidence: number;
  timestamp: string;
}
export interface AlertData {
  alertLevel: AlertLevel;
  alarmReason: AlarmReason;
  timestamp: string;
}
export interface DeviceStatusData {
  deviceId: string;
  status: DeviceStatusValue;
  timestamp: string;
}
export interface LiveData {
  sensor: SensorData | null;
  ai: AIDetectionData | null;
  alert: AlertData | null;
  deviceStatus: DeviceStatusData | null;
  isConnected: boolean;
}
