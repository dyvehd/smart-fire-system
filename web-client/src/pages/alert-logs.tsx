import { useState, useMemo } from "react";
import { useAlerts } from "@/hooks/use-alerts";
import { useAIDetections } from "@/hooks/use-ai-detections";
import { useSystemState } from "@/hooks/use-system-state";
import { MaterialIcon } from "@/components/shared/material-icon";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateTimeFull, formatTemperature, cn } from "@/lib/utils";

type FilterTab = "all" | "ai" | "temp" | "command";

interface UnifiedEvent {
  id: string;
  timestamp: string;
  category: string;
  categoryStyle: "error" | "primary" | "neutral";
  description: string;
  icon: string;
}

const PAGE_SIZE = 10;

export default function AlertLogsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(0);

  const { data: state } = useSystemState();
  const { data: alerts } = useAlerts({ limit: 200 });
  const { data: aiDetections } = useAIDetections({ limit: 200 });

  const unifiedEvents = useMemo<UnifiedEvent[]>(() => {
    const events: UnifiedEvent[] = [];

    if (alerts) {
      for (const a of alerts) {
        events.push({
          id: `alert-${a.id}`,
          timestamp: a.timestamp,
          category: a.alarm_reason === "HIGH_TEMP" ? "Temp Breach" : a.alarm_reason === "FIRE" ? "Fire Alarm" : a.alarm_reason === "TEST" ? "Test Run" : "System",
          categoryStyle:
            a.alert_level === "ALARM"
              ? "error"
              : a.alert_level === "WARNING"
                ? "error"
                : "neutral",
          description: `Alert level changed to ${a.alert_level}${a.alarm_reason !== "NONE" ? ` — triggered by ${a.alarm_reason.replace("_", " ").toLowerCase()}` : ""}`,
          icon:
            a.alarm_reason === "FIRE"
              ? "local_fire_department"
              : a.alarm_reason === "HIGH_TEMP"
                ? "thermostat"
                : "info",
        });
      }
    }

    if (aiDetections) {
      for (const d of aiDetections) {
        if (d.fire || d.smoke) {
          events.push({
            id: `ai-${d.id}`,
            timestamp: d.timestamp,
            category: "AI Detection",
            categoryStyle: "primary",
            description: `AI detected ${d.fire ? `fire (${(d.fire_confidence * 100).toFixed(0)}%)` : ""}${d.fire && d.smoke ? " and " : ""}${d.smoke ? `smoke (${(d.smoke_confidence * 100).toFixed(0)}%)` : ""}`,
            icon: "psychology",
          });
        }
      }
    }

    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return events;
  }, [alerts, aiDetections]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return unifiedEvents;
    if (activeFilter === "ai")
      return unifiedEvents.filter((e) => e.category === "AI Detection");
    if (activeFilter === "temp")
      return unifiedEvents.filter((e) => e.category === "Temp Breach");
    return unifiedEvents.filter(
      (e) => e.category === "Test Run" || e.category === "System",
    );
  }, [unifiedEvents, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const pageEvents = filteredEvents.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

  const activeAlertCount = alerts?.filter((a) => a.alert_level !== "NORMAL").length ?? 0;

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Events" },
    { key: "ai", label: "AI Detection" },
    { key: "temp", label: "Temp Breach" },
    { key: "command", label: "Commands" },
  ];

  const categoryBadge = (style: "error" | "primary" | "neutral", label: string) => {
    const base =
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest";
    if (style === "error")
      return (
        <span className={cn(base, "bg-error/10 text-error")}>
          <span className="w-1 h-1 rounded-full bg-error" />
          {label}
        </span>
      );
    if (style === "primary")
      return (
        <span className={cn(base, "bg-primary/5 text-primary")}>
          <span className="w-1 h-1 rounded-full bg-primary" />
          {label}
        </span>
      );
    return (
      <span
        className={cn(
          base,
          "bg-on-tertiary-fixed-variant/10 text-on-tertiary-fixed-variant",
        )}
      >
        <span className="w-1 h-1 rounded-full bg-on-tertiary-fixed-variant" />
        {label}
      </span>
    );
  };

  return (
    <>
      <PageHeader kicker="Security Archives" title="Alert Logs" />

      {/* Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between h-48 shadow-sm">
          <MaterialIcon icon="warning" className="text-primary text-3xl" />
          <div>
            <p className="text-4xl font-black tracking-tight text-black">
              {activeAlertCount}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Active Alerts
            </p>
          </div>
        </div>
        <div className="bg-surface-container p-8 rounded-xl flex flex-col justify-between h-48 shadow-sm">
          <MaterialIcon
            icon="thermostat"
            className="text-on-surface-variant text-3xl"
          />
          <div>
            <p className="text-4xl font-black tracking-tight text-black">
              {formatTemperature(state?.sensor?.temperature ?? null)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Current Temp
            </p>
          </div>
        </div>
        <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden h-48 flex items-center shadow-sm">
          <div className="relative z-10 w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
              AI Status
            </p>
            <h3 className="text-2xl text-black font-bold max-w-[200px] leading-tight mb-4">
              Monitoring Core is{" "}
              {state?.ai ? "fully active" : "waiting for data"}.
            </h3>
            <div className="w-full md:w-32 h-1 bg-surface-container rounded-full overflow-hidden">
              <div className={cn("h-full bg-primary", state?.ai ? "w-[92%]" : "w-[20%]")} />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-surface-container-low p-2 rounded-2xl lg:rounded-full gap-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide w-full lg:w-auto pb-2 lg:pb-0 px-2 lg:px-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveFilter(tab.key);
                setPage(0);
              }}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors cursor-pointer",
                activeFilter === tab.key
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 whitespace-nowrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hidden sm:inline">
            Total: {filteredEvents.length} entries
          </span>
        </div>
      </section>

      {/* Data Table */}
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Timestamp
                </th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Event Category
                </th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Description
                </th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {pageEvents.length > 0 ? (
                pageEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <td className="px-8 py-5 text-sm font-medium tabular-nums text-black">
                      {formatDateTimeFull(evt.timestamp)}
                    </td>
                    <td className="px-8 py-5">
                      {categoryBadge(evt.categoryStyle, evt.category)}
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">
                      {evt.description}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <MaterialIcon
                        icon="verified"
                        className="text-primary group-hover:scale-110 transition-transform"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-on-surface-variant"
                  >
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <footer className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center sm:text-left">
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, filteredEvents.length)} of{" "}
            {filteredEvents.length} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
            >
              <MaterialIcon icon="chevron_left" className="text-sm" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum =
                totalPages <= 5
                  ? i
                  : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors cursor-pointer",
                    page === pageNum
                      ? "bg-primary text-on-primary shadow-sm"
                      : "hover:bg-surface-container",
                  )}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
            >
              <MaterialIcon icon="chevron_right" className="text-sm" />
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}
