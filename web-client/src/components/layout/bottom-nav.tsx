import { NavLink } from "react-router-dom";
import { MaterialIcon } from "@/components/shared/material-icon";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl z-50 flex justify-around items-center py-4 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1",
              isActive ? "text-black" : "text-on-primary-fixed-variant",
            )
          }
        >
          {({ isActive }) => (
            <>
              <MaterialIcon icon={item.icon} filled={isActive} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {item.label.split(" ")[0]}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
