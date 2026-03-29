import { NavLink } from "react-router-dom";
import { MaterialIcon } from "@/components/shared/material-icon";
import { useLiveData } from "@/providers/live-data-context";
import { useFireDrill } from "@/hooks/use-commands";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { alert, isConnected } = useLiveData();
  const fireDrill = useFireDrill();

  const isNormal = !alert || alert.alertLevel === "NORMAL";

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-8 px-4 z-40 hidden md:flex">
      <div className="px-6">
        <h2 className="text-on-background font-black tracking-tighter text-2xl">
          SMART FIRE SYSTEM
        </h2>
        <div className="flex flex-col gap-2 flex-grow">
          <div className="py-8 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50 mb-1">
              System Status
            </p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected
                    ? isNormal
                      ? "bg-primary"
                      : "bg-error animate-pulse"
                    : "bg-on-surface-variant",
                )}
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-black">
                {isConnected
                  ? isNormal
                    ? "System Active"
                    : alert?.alertLevel
                  : "Offline"}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">
              {isConnected ? "All sensors nominal" : "No MQTT connection"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-6 py-3 my-1 rounded-full transition-all duration-300 ease-in-out",
                isActive
                  ? "bg-surface-container-lowest text-black shadow-sm"
                  : "text-on-primary-fixed-variant hover:text-black hover:bg-surface-container-highest",
              )
            }
          >
            {({ isActive }) => (
              <>
                <MaterialIcon icon={item.icon} filled={isActive} />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-surface-container-highest/30">
        <button
          onClick={() => fireDrill.mutate("on")}
          disabled={fireDrill.isPending}
          className="w-full bg-primary text-on-primary rounded-full py-4 text-xs font-bold uppercase tracking-widest mb-6 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          Fire Drill
        </button>
      </div>
    </aside>
  );
}
