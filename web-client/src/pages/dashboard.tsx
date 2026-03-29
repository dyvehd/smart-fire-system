import { Link } from "react-router-dom";
import { useLiveData } from "@/providers/live-data-context";
import { useAlerts } from "@/hooks/use-alerts";
import { MaterialIcon } from "@/components/shared/material-icon";
import { PageHeader } from "@/components/shared/page-header";
import {
  formatTemperature,
  formatHumidity,
  formatTimestamp,
  cn,
} from "@/lib/utils";
import { TEMP_WARNING_THRESHOLD } from "@/lib/constants";

const CAMERA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDRsTMkaZJh_o69cXJNU2H3qbVrJtkPheVzkDz4dx3QbG4S7rcCS273DREMRqWW_doZMGulkGaCLv_g-_I2EAD-zFR7tnfPc0MeSdq7Bh4UrJnpt8lvJ8J-qlDXQSDqxovqKattLN3lnhwCGns_70LZqN8lzSiyjRlq_bENKzQVKBwJvutwxC3sFd8QCze2kvN4h4Fel0mbhBERo0Cc1PJFwQGb1YP8_7L_aH1fS_XzgTCvjtOO_Zx8jvUfLGEbCE622m3sYg0G2tE7";

function alertIcon(reason: string) {
  switch (reason) {
    case "FIRE":
      return "local_fire_department";
    case "HIGH_TEMP":
      return "thermostat";
    case "TEST":
      return "science";
    default:
      return "info";
  }
}

export default function DashboardPage() {
  const { sensor, ai, alert, deviceStatus } = useLiveData();
  const { data: recentAlerts } = useAlerts({ limit: 5 });

  const isWarning = alert?.alertLevel === "WARNING";
  const isAlarm = alert?.alertLevel === "ALARM";

  const headline = isAlarm
    ? "Fire Detected!"
    : isWarning
      ? "High Temperature!"
      : "It's all good!";

  const subtitle = isAlarm
    ? `ALARM triggered — reason: ${alert?.alarmReason}. Please take immediate action.`
    : isWarning
      ? "Temperature exceeded safe threshold. Ventilation fan activated automatically."
      : "Continuous surveillance active. AI vision processing with 0 anomalies detected.";

  const fireDetected = ai?.fire;
  const fireLabel = fireDetected
    ? `Fire Detected (${(ai!.fireConfidence * 100).toFixed(0)}%)`
    : "No Fire Detected";

  const temp = sensor?.temperature ?? null;
  const hum = sensor?.humidity ?? null;
  const tempAboveWarning = temp != null && temp > TEMP_WARNING_THRESHOLD;

  return (
    <>
      <PageHeader
        kicker="Real-time Overview"
        title={headline}
        description={subtitle}
        titleClassName={isAlarm ? "text-error" : undefined}
      />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* AI Camera Feed */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden relative aspect-video shadow-sm group">
          <img
            className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 transition-transform duration-700"
            src={CAMERA_IMG}
            alt="Surveillance camera view"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="text-white font-bold text-xs uppercase tracking-widest">
              Live AI Feed: CAM_01
            </span>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                AI Inference
              </p>
              <p
                className={cn(
                  "text-2xl font-black tracking-tight",
                  fireDetected ? "text-red-400" : "text-white",
                )}
              >
                {fireLabel}
              </p>
            </div>
            <Link
              to="/ai"
              className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40 transition-all"
            >
              <MaterialIcon icon="fullscreen" />
            </Link>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Temperature Card */}
          <div className="bg-surface-container p-8 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <MaterialIcon icon="thermostat" className="text-4xl mb-4" />
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                Ambient Temperature
              </p>
              <h3
                className={cn(
                  "text-6xl font-black tracking-tighter mt-2",
                  tempAboveWarning && "text-error",
                )}
              >
                {formatTemperature(temp)}
              </h3>
            </div>
            <div className="pt-6 border-t border-on-surface/5 flex items-center gap-2 text-primary font-bold">
              <MaterialIcon
                icon={tempAboveWarning ? "warning" : "check_circle"}
                className="text-sm"
              />
              <span className="text-xs">
                {tempAboveWarning
                  ? "Above safe threshold"
                  : "Within safe range"}
              </span>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="bg-primary text-on-primary p-8 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <MaterialIcon
                icon="humidity_percentage"
                className="text-4xl mb-4 text-surface-container-highest"
              />
              <p className="text-on-primary/60 text-xs font-bold uppercase tracking-widest">
                Relative Humidity
              </p>
              <h3 className="text-6xl font-black tracking-tighter mt-2">
                {formatHumidity(hum)}
              </h3>
            </div>
            <div className="pt-6 border-t border-on-primary/10 flex items-center gap-2 text-on-primary font-bold">
              <MaterialIcon icon="check_circle" className="text-sm" />
              <span className="text-xs uppercase tracking-widest">
                Optimal Range
              </span>
            </div>
          </div>
        </div>

        {/* System Activity Feed */}
        <div className="md:col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-black tracking-tight">
              System Activity
            </h4>
            <Link
              to="/alerts"
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-black transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="space-y-6">
            {recentAlerts && recentAlerts.length > 0 ? (
              recentAlerts.map((evt) => (
                <div key={evt.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                    <MaterialIcon
                      icon={alertIcon(evt.alarm_reason)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {evt.alert_level} — {evt.alarm_reason}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Alert level changed to {evt.alert_level}
                      {evt.alarm_reason !== "NONE" &&
                        ` due to ${evt.alarm_reason.replace("_", " ").toLowerCase()}`}
                    </p>
                    <p className="text-[10px] text-on-secondary-container mt-1 uppercase tracking-tighter font-medium">
                      {formatTimestamp(evt.timestamp)} • {evt.alert_level}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Device Status Card (replaces Facility Coverage) */}
        <div className="md:col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-lg font-black tracking-tight mb-2">
              Device Status
            </h4>
            <div className="flex gap-2">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  deviceStatus?.status === "online"
                    ? "bg-surface-container-lowest text-black"
                    : "bg-surface-container text-on-surface-variant",
                )}
              >
                Gateway: {deviceStatus?.status ?? "Unknown"}
              </span>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  ai
                    ? "bg-surface-container-lowest text-black"
                    : "bg-surface-container text-on-surface-variant",
                )}
              >
                AI Model: {ai ? "Active" : "Idle"}
              </span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-12">
            {["Sensor Node", "AI Engine", "MQTT Link"].map((label, i) => (
              <div key={label} className="flex flex-col items-center">
                <span
                  className={cn(
                    "w-3 h-3 rounded-full ring-4",
                    i === 0
                      ? deviceStatus?.status === "online"
                        ? "bg-black ring-black/10"
                        : "bg-on-surface-variant ring-on-surface-variant/10"
                      : i === 1
                        ? ai
                          ? "bg-black ring-black/10"
                          : "bg-on-surface-variant ring-on-surface-variant/10"
                        : sensor
                          ? "bg-black ring-black/10"
                          : "bg-on-surface-variant ring-on-surface-variant/10",
                  )}
                />
                <span className="text-[9px] font-bold uppercase mt-2">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
