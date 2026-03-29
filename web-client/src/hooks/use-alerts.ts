import { useQuery } from "@tanstack/react-query";
import { getAlerts } from "@/api/alerts";

export function useAlerts(params: {
  from?: string;
  to?: string;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["alerts", params],
    queryFn: () => getAlerts(params),
  });
}
