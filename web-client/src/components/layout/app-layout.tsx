import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";

export function AppLayout() {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        <TopBar />
        <div className="pt-24 px-8 pb-20 md:pb-12 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
