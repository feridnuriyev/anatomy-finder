import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Layer } from "../types/anatomy";

export type AssetStatus = "idle" | "loading" | "ready" | "fallback";
interface AtlasStatusValue {
  statuses: Record<Layer, AssetStatus>;
  retries: Record<Layer, number>;
  report: (layer: Layer, status: AssetStatus) => void;
  retry: (layer: Layer) => void;
}
const AtlasStatusContext = createContext<AtlasStatusValue | null>(null);
export function AtlasStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<Layer, AssetStatus>>({skin:"idle", muscles:"idle", organs:"idle", skeleton:"idle"});
  const [retries, setRetries] = useState<Record<Layer, number>>({skin:0, muscles:0, organs:0, skeleton:0});
  const report = useCallback((layer: Layer, status: AssetStatus) => setStatuses(previous => previous[layer] === status ? previous : {...previous, [layer]: status}), []);
  const retry = useCallback((layer: Layer) => setRetries(previous => ({...previous, [layer]: previous[layer] + 1})), []);
  const value = useMemo(() => ({statuses, retries, report, retry}), [statuses, retries, report, retry]);
  return <AtlasStatusContext.Provider value={value}>{children}</AtlasStatusContext.Provider>;
}
export function useAtlasStatus() {
  const context = useContext(AtlasStatusContext);
  if (!context) throw new Error("AtlasStatusProvider is required.");
  return context;
}
