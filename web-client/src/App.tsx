import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MqttLiveProvider } from "@/providers/mqtt-live-provider";
import { AppLayout } from "@/components/layout/app-layout";
import DashboardPage from "@/pages/dashboard";
import AnalyticsPage from "@/pages/analytics";
import ManualControlsPage from "@/pages/manual-controls";
import AlertLogsPage from "@/pages/alert-logs";
import AIMonitoringPage from "@/pages/ai-monitoring";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchInterval: 15_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MqttLiveProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="controls" element={<ManualControlsPage />} />
              <Route path="alerts" element={<AlertLogsPage />} />
              <Route path="ai" element={<AIMonitoringPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MqttLiveProvider>
    </QueryClientProvider>
  );
}
