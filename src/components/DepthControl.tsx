import type { CSSProperties } from "react";

export function DepthControl({
  depth,
  target,
  onChange,
}: {
  depth: number;
  target: number;
  onChange: (depth: number) => void;
}) {
  return (
    <div className="depth-control">
      <div className="control-heading">
        <label htmlFor="depth">Depth</label>
        <output htmlFor="depth">{Math.round(depth)}%</output>
      </div>
      <input
        style={{ "--range-value": `${Math.round(target)}%` } as CSSProperties}
        id="depth"
        aria-label="Anatomy depth"
        type="range"
        min="0"
        max="100"
        step="1"
        value={target}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="range-labels">
        <span>Surface</span>
        <span>Inner</span>
      </div>
    </div>
  );
}
