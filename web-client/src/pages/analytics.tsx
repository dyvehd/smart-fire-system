import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";
import { useLiveData } from "@/providers/live-data-context";
import { useSensors } from "@/hooks/use-sensors";
import { MaterialIcon } from "@/components/shared/material-icon";
import { PageHeader } from "@/components/shared/page-header";
import {
  formatTemperature,
  formatHumidity,
  formatTimestamp,
} from "@/lib/utils";
import { TEMP_WARNING_THRESHOLD, TEMP_ALARM_THRESHOLD } from "@/lib/constants";

const SMOKE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBB06CnQ05Q4-HejcZTTBljeQNdbP9m-V39_DRL2j9K-c14VZ2vE2ytS1ZCyGKyLwp2unXDU6YPGFtRHnk-EwTcQjqX1LZNLBLRRgcmzp4WOgkvt0OeT6S9uAFFeAd7gu3q0SqdcXwQKcCbc21TNIximbn2sachAUlkrtl9FL4-i_jXESw1eHMDPlZ4tdUMh_vT2BHuKEBYFEQhR9zyisU0_Jh7kxbAVzhSqF-DcmdWKg66NBHfO2jYWRqfwrn-cOBakcgonHNzknLF";

export default function AnalyticsPage() {
  const { sensor } = useLiveData();

  const now = useMemo(() => new Date(), []);
  const twentyFourHoursAgo = useMemo(
    () => new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    [now],
  );
  const sevenDaysAgo = useMemo(
    () => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    [now],
  );

  const { data: dayReadings } = useSensors({
    from: twentyFourHoursAgo,
    limit: 500,
  });

  const { data: weekReadings } = useSensors({
    from: sevenDaysAgo,
    limit: 1000,
  });

  const tempChartData = useMemo(() => {
    if (!dayReadings) return [];
    return dayReadings.map((r) => ({
      time: formatTimestamp(r.timestamp),
      temperature: r.temperature,
      humidity: r.humidity,
    }));
  }, [dayReadings]);

  const stats = useMemo(() => {
    if (!dayReadings || dayReadings.length === 0) {
      return { mean: null, peak: null, peakTime: "" };
    }
    const temps = dayReadings.map((r) => r.temperature);
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const peak = Math.max(...temps);
    const peakReading = dayReadings.find((r) => r.temperature === peak);
    return {
      mean,
      peak,
      peakTime: peakReading ? formatTimestamp(peakReading.timestamp) : "",
    };
  }, [dayReadings]);

  const humidityByDay = useMemo(() => {
    if (!weekReadings) return [];
    const dayMap = new Map<string, number[]>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const r of weekReadings) {
      const d = new Date(r.timestamp);
      const label = dayNames[d.getDay()];
      if (!dayMap.has(label)) dayMap.set(label, []);
      dayMap.get(label)!.push(r.humidity);
    }
    return Array.from(dayMap.entries()).map(([day, vals]) => ({
      day,
      humidity: vals.reduce((a, b) => a + b, 0) / vals.length,
    }));
  }, [weekReadings]);

  const liveTemp = sensor?.temperature ?? null;
  const liveHumidity = sensor?.humidity ?? null;

  return (
    <>
      <PageHeader
        kicker="Telemetry & Environment"
        title={<>Environmental Analytics.</>}
      />

      {/* Stat Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Mean Temp */}
        <div className="md:col-span-1 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between aspect-square shadow-sm">
          <div className="flex justify-between items-start">
            <MaterialIcon icon="thermostat" className="text-black" />
            <span className="text-[10px] font-bold uppercase tracking-widest bg-surface-container-highest px-3 py-1 rounded-full">
              Mean
            </span>
          </div>
          <div>
            <p className="text-[2.5rem] font-black tracking-tight text-black">
              {formatTemperature(stats.mean)}
            </p>
            <p className="text-xs text-on-surface-variant font-medium">
              24h average
            </p>
          </div>
        </div>

        {/* Peak Temp */}
        <div className="md:col-span-1 bg-primary text-on-primary p-8 rounded-xl flex flex-col justify-between aspect-square shadow-sm">
          <div className="flex justify-between items-start">
            <MaterialIcon icon="trending_up" className="text-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
              24H Peak
            </span>
          </div>
          <div>
            <p className="text-[2.5rem] font-black tracking-tight text-white">
              {formatTemperature(stats.peak)}
            </p>
            <p className="text-xs text-on-primary-container font-medium">
              {stats.peakTime ? `Recorded at ${stats.peakTime}` : "No data"}
            </p>
          </div>
        </div>

        {/* Humidity */}
        <div className="md:col-span-2 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Humidity Saturation
              </p>
              <h3 className="text-xl font-bold tracking-tight text-black">
                Atmospheric Stability
              </h3>
            </div>
            <MaterialIcon icon="water_drop" className="text-black" />
          </div>
          <div className="mt-8 flex items-end gap-12">
            <div>
              <p className="text-[2.5rem] font-black tracking-tight text-black">
                {formatHumidity(liveHumidity)}
              </p>
              <p className="text-xs text-on-surface-variant font-medium">
                Optimal Range
              </p>
            </div>
            <div className="flex-grow pb-4">
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${liveHumidity ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Chart */}
      <section className="bg-surface-container-lowest shadow-sm rounded-xl p-10 mb-8 overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-black">
              Historical Temperature
            </h2>
            <p className="text-sm text-on-surface-variant">
              Last 24 hours of sensor readings
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-px border border-dashed border-on-surface-variant opacity-40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Early Warning ({TEMP_WARNING_THRESHOLD}°C)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-[2px] bg-black" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black">
                Critical ({TEMP_ALARM_THRESHOLD}°C)
              </span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          {tempChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempChartData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#4c4546" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#4c4546" }}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "none",
                    borderRadius: "1rem",
                    boxShadow: "0 20px 40px rgba(26,28,28,0.04)",
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={TEMP_WARNING_THRESHOLD}
                  stroke="#4c4546"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={TEMP_ALARM_THRESHOLD}
                  stroke="#000000"
                  strokeWidth={2}
                  strokeOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#000000"
                  strokeWidth={2}
                  fill="url(#tempGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
              No temperature data available
            </div>
          )}
        </div>
      </section>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Humidity Drift */}
        <div className="md:col-span-2 bg-surface-container-low p-10 rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold tracking-tight text-black">
              Humidity Drift
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Last 7 Days
            </span>
          </div>
          <div className="h-[140px]">
            {humidityByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={humidityByDay}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#4c4546" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "none",
                      borderRadius: "1rem",
                      boxShadow: "0 20px 40px rgba(26,28,28,0.04)",
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${Number(v).toFixed(1)}%`, "Humidity"]}
                  />
                  <Bar
                    dataKey="humidity"
                    fill="#000000"
                    radius={[999, 999, 999, 999]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
                No humidity data available
              </div>
            )}
          </div>
        </div>

        {/* Decorative Image */}
        <div className="md:col-span-1 rounded-xl overflow-hidden relative group min-h-[200px]">
          <img
            className="w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-700"
            src={SMOKE_IMG}
            alt="Abstract smoke and light"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
              Live Sensor
            </p>
            <h4 className="text-lg font-bold text-white tracking-tight">
              {formatTemperature(liveTemp)}
            </h4>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                Live Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
