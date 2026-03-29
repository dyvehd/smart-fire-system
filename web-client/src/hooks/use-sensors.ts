import { useQuery } from "@tanstack/react-query";
import { getSensors } from "@/api/sensors";

export function useSensors(params: {
  from?: string;
  to?: string;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["sensors", params],
    queryFn: () => getSensors(params),
  });
}
