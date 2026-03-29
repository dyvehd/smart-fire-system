import { useQuery } from "@tanstack/react-query";
import { getAIDetections } from "@/api/ai";

export function useAIDetections(params: {
  from?: string;
  to?: string;
  onlyPositive?: boolean;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["aiDetections", params],
    queryFn: () => getAIDetections(params),
  });
}
