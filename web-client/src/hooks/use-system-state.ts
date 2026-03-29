import { useQuery } from "@tanstack/react-query";
import { getSystemState } from "@/api/state";

export function useSystemState() {
  return useQuery({
    queryKey: ["systemState"],
    queryFn: getSystemState,
    refetchInterval: 10_000,
  });
}
