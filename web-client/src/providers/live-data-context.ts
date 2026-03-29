import { createContext, useContext } from "react";
import type { LiveData } from "./types";

const defaultLiveData: LiveData = {
  sensor: null,
  ai: null,
  alert: null,
  deviceStatus: null,
  isConnected: false,
};

export const LiveDataContext = createContext<LiveData>(defaultLiveData);

export function useLiveData(): LiveData {
  return useContext(LiveDataContext);
}
