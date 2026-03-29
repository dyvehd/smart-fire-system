import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MaterialIcon } from "@/components/shared/material-icon";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function useLocalClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function TopBar() {
  const clock = useLocalClock();

  return (
    <header className="bg-surface/80 backdrop-blur-xl fixed top-0 right-0 left-0 md:left-64 z-30">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-6">
          <span className="text-xl font-black tracking-tighter text-black md:hidden">
            SMART FIRE SYSTEM
          </span>
          <div className="hidden lg:flex items-center gap-6 font-medium tracking-tight text-sm">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "transition-colors",
                    isActive
                      ? "text-black font-bold border-b-2 border-black pb-1"
                      : "text-on-primary-fixed-variant hover:text-black",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-surface-container-lowest px-5 py-2 rounded-full shadow-sm">
            <MaterialIcon
              icon="schedule"
              className="text-on-surface-variant text-sm"
            />
            <span className="text-sm font-bold tracking-tight tabular-nums">
              {clock}
            </span>
            <MaterialIcon
              icon="notifications"
              className="hover:bg-surface-container-low rounded-full p-2 transition-all cursor-pointer"
            />
            <MaterialIcon
              icon="settings"
              className="hover:bg-surface-container-low rounded-full p-2 transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
