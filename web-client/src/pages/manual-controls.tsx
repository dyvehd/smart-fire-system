import { useState } from "react";
import { useFanPumpCommand, useFireDrill } from "@/hooks/use-commands";
import { useSystemState } from "@/hooks/use-system-state";
import { MaterialIcon } from "@/components/shared/material-icon";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const CIRCUIT_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDzBypHz10r3Lmx9aJjf-Wmtzk6bEbUn-6ABvgkHDXhvlc9s2vZgl-ymaHoFnfRfoHuwYTSjsJSu3pI0X8gVD-0WsswBdCBmjHovLiDixEbAXvU_Rp7u6r431KOnnCcmBNthBvZT2dxGCSl2BXPuKBajEITaRaXsUf96WptA6GL1uRoH8XzTP3gD7y4pLV2Oz6Jld7zzvCt7Iy47HExh1TJ_aC7rAMAGYuep607mL4m6X41o-ddcwUag-sow3nUoR38X78l610M7VU9";

type DeviceMode = "on" | "off" | "auto";

function ToggleSwitch({
  active,
  onToggle,
  disabled,
}: {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-14 h-8 rounded-full relative p-1 transition-colors duration-300 cursor-pointer disabled:opacity-50",
        active ? "bg-black" : "bg-surface-container-highest",
      )}
    >
      <div
        className={cn(
          "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300",
          active && "translate-x-6",
        )}
      />
    </button>
  );
}

function IconCircle({ icon }: { icon: string }) {
  return (
    <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center shrink-0">
      <MaterialIcon icon={icon} className="text-black" />
    </div>
  );
}

function ControlCard({
  icon,
  title,
  statusLabel,
  active,
  children,
}: {
  icon: string;
  title: string;
  statusLabel: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(26,28,28,0.04)] flex flex-col justify-between min-h-[240px]">
      <div className="flex justify-between items-start">
        <IconCircle icon={icon} />
        <span
          className={cn(
            "text-[0.65rem] font-bold uppercase tracking-widest",
            active ? "text-black" : "text-on-primary-fixed-variant",
          )}
        >
          {statusLabel}
        </span>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function ManualControlsPage() {
  const { data: state } = useSystemState();
  const fanPumpCmd = useFanPumpCommand();
  const fireDrill = useFireDrill();

  const lastPayload = state?.last_command?.payload;
  const [fanMode, setFanMode] = useState<DeviceMode>(
    (lastPayload?.fan as DeviceMode) ?? "off",
  );
  const [pumpMode, setPumpMode] = useState<DeviceMode>(
    (lastPayload?.pump as DeviceMode) ?? "off",
  );

  const toggleFan = () => {
    const next: DeviceMode = fanMode === "on" ? "off" : "on";
    setFanMode(next);
    fanPumpCmd.mutate({ fan: next, pump: pumpMode });
  };

  const togglePump = () => {
    const next: DeviceMode = pumpMode === "on" ? "off" : "on";
    setPumpMode(next);
    fanPumpCmd.mutate({ fan: fanMode, pump: next });
  };

  const handleFireDrill = () => {
    fireDrill.mutate("on");
  };

  return (
    <>
      <PageHeader
        kicker="Hardware Interface"
        title="Manual Controls"
        description="Direct hardware override for critical suppression systems. Use with caution. Environmental sensors remain active during manual toggling."
      />

      {/* Fire Drill */}
      <section className="mb-12">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(26,28,28,0.04)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              System Testing Protocol
            </h2>
            <p className="text-sm text-on-surface-variant">
              Simulate a high-heat event to test actuators, alarm response, and
              notification latency.
            </p>
          </div>
          <button
            onClick={handleFireDrill}
            disabled={fireDrill.isPending}
            className="bg-black text-white rounded-full px-12 py-6 text-lg font-black tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            {fireDrill.isPending ? "Running..." : "INITIALIZE FIRE DRILL"}
          </button>
        </div>
      </section>

      {/* Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ControlCard
          icon="air"
          title="Mini Fan"
          statusLabel={fanMode === "on" ? "Running" : "Standby"}
          active={fanMode === "on"}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">
              Manual Toggle
            </span>
            <ToggleSwitch
              active={fanMode === "on"}
              onToggle={toggleFan}
              disabled={fanPumpCmd.isPending}
            />
          </div>
        </ControlCard>

        <ControlCard
          icon="water_drop"
          title="Water Pump"
          statusLabel={pumpMode === "on" ? "Active" : "Inactive"}
          active={pumpMode === "on"}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">
              Flow Activation
            </span>
            <ToggleSwitch
              active={pumpMode === "on"}
              onToggle={togglePump}
              disabled={fanPumpCmd.isPending}
            />
          </div>
        </ControlCard>

        <ControlCard
          icon="power_settings_new"
          title="System Power"
          statusLabel="Online"
          active
        >
          <p className="text-sm text-on-surface-variant">
            Gateway and sensor node are active. System is monitoring.
          </p>
        </ControlCard>
      </div>

      {/* Decorative section */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-surface-container-low rounded-xl p-12 overflow-hidden relative min-h-[300px] flex flex-col justify-end">
          <img
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-10"
            src={CIRCUIT_IMG}
            alt="Circuit board"
          />
          <div className="relative z-10">
            <h4 className="text-4xl font-black tracking-tighter mb-4">
              Live Actuator Response
            </h4>
            <div className="flex gap-4">
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                Fan: {fanMode.toUpperCase()}
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                Pump: {pumpMode.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-black text-white rounded-xl p-8 flex flex-col justify-between min-h-[200px]">
          <MaterialIcon icon="security" className="text-white text-4xl" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">
              Fire Drill
            </p>
            <h5 className="text-xl font-bold leading-tight">
              Test all outputs with one tap
            </h5>
          </div>
        </div>
      </section>
    </>
  );
}
