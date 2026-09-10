import { useCallback, useState } from "react";
import { structures } from "../data/structures";
export function useStructureSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [inspectionMode, setInspectionMode] = useState<"context" | "isolated">(
    "context",
  );
  const selectedStructure =
    structures.find((item) => item.id === selectedId) ?? null;
  const select = useCallback((id: string) => {
    if (!structures.some((item) => item.id === id)) return;
    setSelectedId(id);
    setDetailsPanelOpen(false);
    setInspectionMode("context");
  }, []);
  const reset = useCallback(() => {
    setSelectedId(null);
    setDetailsPanelOpen(false);
    setInspectionMode("context");
  }, []);
  return {
    selectedStructure,
    detailsPanelOpen,
    setDetailsPanelOpen,
    inspectionMode,
    setInspectionMode,
    select,
    reset,
  };
}
