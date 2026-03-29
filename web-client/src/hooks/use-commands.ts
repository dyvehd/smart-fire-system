import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postSystemCommand,
  postFanPumpCommand,
  postTestRunCommand,
} from "@/api/commands";

export function useSystemCommand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: "on" | "off") => postSystemCommand(action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["systemState"] }),
  });
}

export function useFanPumpCommand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fan, pump }: { fan: string; pump: string }) =>
      postFanPumpCommand(fan, pump),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["systemState"] }),
  });
}

export function useFireDrill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: "on" | "off") => postTestRunCommand(action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["systemState"] }),
  });
}
