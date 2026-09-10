import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { structures } from "../data/structures";
import { layers } from "../anatomy/depth";

interface AnatomyActions {
  setDepth: (depth: number) => void;
  select: (id: string) => void;
  reset: () => void;
}

interface ModelContext {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
}

/** Optional progressive enhancement. Standard browsers need no agent API. */
export function useAnatomyTools(actions: AnatomyActions) {
  const current = useRef(actions);
  useEffect(() => {
    current.current = actions;
  });
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: "explore_anatomy",
            description:
              "Set anatomy depth (0–100), or open a named BodyParts3D structure in side-by-side inspection. Clinical descriptions have not been reviewed.",
            inputSchema: {
              type: "object",
              properties: {
                depth: { type: "number", minimum: 0, maximum: 100 },
                structureId: {
                  type: "string",
                  description: "Stable structure ID from the anatomy selector, such as left-femur or skull.",
                },
              },
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute(input) {
              if (typeof input !== "object" || input === null)
                throw new Error("Expected an object.");
              const value = input as Record<string, unknown>;
              if (
                Object.keys(value).some(
                  (key) => !["depth", "structureId"].includes(key),
                )
              )
                throw new Error("Unknown field.");
              const structure = structures.find(
                (s) => s.id === value.structureId,
              );
              if (value.structureId !== undefined && !structure)
                throw new Error("Unknown structure.");
              if (
                value.depth !== undefined &&
                (typeof value.depth !== "number" ||
                  !Number.isFinite(value.depth) ||
                  value.depth < 0 ||
                  value.depth > 100)
              )
                throw new Error("Depth must be between 0 and 100.");
              if (!structure && value.depth === undefined)
                throw new Error("Provide depth or structureId.");
              const depth = structure
                ? Math.min(100, layers.indexOf(structure.layer) * 25 + 8)
                : (value.depth as number);
              flushSync(() => {
                current.current.reset();
                current.current.setDepth(depth);
                if (structure) current.current.select(structure.id);
              });
              return {
                targetDepth: depth,
                selectedStructure: structure?.id ?? null,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {
        /* Optional browser capability; UI remains usable. */
      });
    } catch {
      /* Unsupported draft API must not interrupt the viewer. */
    }
    return () => lifecycle.abort();
  }, []);
}
