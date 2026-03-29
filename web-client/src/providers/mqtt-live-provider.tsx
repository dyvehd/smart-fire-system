import { useState, useEffect, useCallback, type ReactNode } from "react";
import mqtt from "mqtt";
import { LiveDataContext } from "./live-data-context";
import type {
  SensorData,
  AIDetectionData,
  AlertData,
  DeviceStatusData,
  AlertLevel,
  AlarmReason,
} from "./types";
import { AIO_USERNAME, AIO_KEY, FEED_KEYS } from "@/lib/constants";

function parseSensor(payload: string): SensorData | null {
  try {
    const json = JSON.parse(payload);
    if (json.temperature != null && json.humidity != null) {
      return {
        temperature: Number(json.temperature),
        humidity: Number(json.humidity),
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    // Try text format: "Temperature: 25.3°C, Humidity: 60.1%"
  }
  const match = payload.match(
    /Temperature:\s*([\d.]+).*Humidity:\s*([\d.]+)/i,
  );
  if (match) {
    return {
      temperature: parseFloat(match[1]),
      humidity: parseFloat(match[2]),
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}

function parseAI(payload: string): AIDetectionData | null {
  try {
    const json = JSON.parse(payload);
    if ("fire" in json) {
      return {
        fire: Boolean(json.fire),
        fireConfidence: Number(json.fire_confidence ?? 0),
        smoke: Boolean(json.smoke),
        smokeConfidence: Number(json.smoke_confidence ?? 0),
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    // Try text format
  }
  const match = payload.match(
    /fire:\s*(True|False).*conf:\s*([\d.]+).*smoke:\s*(True|False).*conf:\s*([\d.]+)/i,
  );
  if (match) {
    return {
      fire: match[1].toLowerCase() === "true",
      fireConfidence: parseFloat(match[2]),
      smoke: match[3].toLowerCase() === "true",
      smokeConfidence: parseFloat(match[4]),
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}

function parseAlert(payload: string): AlertData | null {
  const parts = payload.toUpperCase().split(":");
  if (parts.length === 2) {
    return {
      alertLevel: parts[0] as AlertLevel,
      alarmReason: parts[1] as AlarmReason,
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}

function parseDeviceStatus(payload: string): DeviceStatusData | null {
  const status = payload.toLowerCase().trim();
  if (["online", "offline", "error"].includes(status)) {
    return {
      deviceId: "yolobit",
      status: status as DeviceStatusData["status"],
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}

interface Props {
  children: ReactNode;
}

export function MqttLiveProvider({ children }: Props) {
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [ai, setAI] = useState<AIDetectionData | null>(null);
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusData | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = useCallback((topic: string, message: Buffer) => {
    const payload = message.toString();
    const feedKey = topic.split("/").pop() ?? "";

    if (feedKey === FEED_KEYS.sensorResults.split(".").pop()) {
      const data = parseSensor(payload);
      if (data) setSensor(data);
    } else if (feedKey === FEED_KEYS.aiResults.split(".").pop()) {
      const data = parseAI(payload);
      if (data) setAI(data);
    } else if (feedKey === FEED_KEYS.alertLevel.split(".").pop()) {
      const data = parseAlert(payload);
      if (data) setAlert(data);
    } else if (feedKey === FEED_KEYS.deviceStatus.split(".").pop()) {
      const data = parseDeviceStatus(payload);
      if (data) setDeviceStatus(data);
    }
  }, []);

  useEffect(() => {
    if (!AIO_USERNAME || !AIO_KEY) {
      console.warn(
        "MQTT: AIO_USERNAME or AIO_KEY not set. Live data disabled.",
      );
      return;
    }

    const client = mqtt.connect("wss://io.adafruit.com/mqtt/", {
      username: AIO_USERNAME,
      password: AIO_KEY,
      protocolVersion: 4,
    });

    client.on("connect", () => {
      setIsConnected(true);
      const feeds = Object.values(FEED_KEYS);
      for (const feed of feeds) {
        client.subscribe(`${AIO_USERNAME}/feeds/${feed}`);
      }
    });

    client.on("close", () => setIsConnected(false));
    client.on("error", (err) => {
      console.error("MQTT error:", err);
      setIsConnected(false);
    });
    client.on("message", handleMessage);

    return () => {
      client.end(true);
    };
  }, [handleMessage]);

  return (
    <LiveDataContext.Provider
      value={{ sensor, ai, alert, deviceStatus, isConnected }}
    >
      {children}
    </LiveDataContext.Provider>
  );
}
