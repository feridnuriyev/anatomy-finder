import { forwardRef, useImperativeHandle, useRef } from "react";
import { Quaternion, Vector3 } from "three";

export type QuaternionTuple = [number, number, number, number];

export interface OrientationGizmoHandle {
  setQuaternion: (quaternion: QuaternionTuple) => void;
}

type AxisName = "x" | "y" | "z";

const ORIGIN = 28;
const AXIS_LENGTH = 20;
const AXES: Array<{ name: AxisName; vector: Vector3 }> = [
  { name: "x", vector: new Vector3(1, 0, 0) },
  { name: "y", vector: new Vector3(0, 1, 0) },
  { name: "z", vector: new Vector3(0, 0, -1) },
];

export const OrientationGizmo = forwardRef<OrientationGizmoHandle>(
  function OrientationGizmo(_, ref) {
    const lineRefs = useRef<Record<AxisName, SVGLineElement | null>>({ x: null, y: null, z: null });
    const ringRefs = useRef<Record<AxisName, SVGCircleElement | null>>({ x: null, y: null, z: null });
    const depthMarkRefs = useRef<Record<AxisName, SVGTextElement | null>>({ x: null, y: null, z: null });
    const labelRefs = useRef<Record<AxisName, SVGTextElement | null>>({ x: null, y: null, z: null });

    useImperativeHandle(ref, () => ({
      setQuaternion: ([x, y, z, w]) => {
        const worldToView = new Quaternion(-x, -y, -z, w).normalize();

        for (const axis of AXES) {
          const projected = axis.vector.clone().applyQuaternion(worldToView);
          const screenX = projected.x * AXIS_LENGTH;
          const screenY = -projected.y * AXIS_LENGTH;
          const screenLength = Math.hypot(screenX, screenY);
          const line = lineRefs.current[axis.name];
          const ring = ringRefs.current[axis.name];
          const depthMark = depthMarkRefs.current[axis.name];
          const label = labelRefs.current[axis.name];
          const isDepthFacing = screenLength < 3.5;
          const endpointX = ORIGIN + screenX;
          const endpointY = ORIGIN + screenY;
          const opacity = String(0.58 + (1 - Math.abs(projected.z)) * 0.42);

          line?.setAttribute("x2", String(endpointX));
          line?.setAttribute("y2", String(endpointY));
          line?.setAttribute("opacity", isDepthFacing ? "0" : opacity);
          ring?.setAttribute("cx", String(isDepthFacing ? ORIGIN : endpointX));
          ring?.setAttribute("cy", String(isDepthFacing ? ORIGIN : endpointY));
          ring?.setAttribute("opacity", isDepthFacing ? opacity : "0");
          depthMark?.setAttribute("opacity", isDepthFacing && projected.z < 0 ? opacity : "0");
          label?.setAttribute("x", String((isDepthFacing ? ORIGIN : endpointX) + 5));
          label?.setAttribute("y", String((isDepthFacing ? ORIGIN : endpointY) - 5));
        }
      },
    }), []);

    return (
      <div className="orientation" aria-label="Rotating X, Y and Z orientation axes">
        <svg className="orientation-gizmo" viewBox="0 0 58 58" aria-hidden="true">
          <defs>
            {AXES.map(({ name }) => (
              <marker key={name} id={`axis-arrow-${name}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M0,0 L5,2.5 L0,5 Z" className={`axis-${name}`} />
              </marker>
            ))}
          </defs>
          {AXES.map(({ name }) => (
            <g key={name} className={`axis axis-${name}`}>
              <line
                ref={(node) => { lineRefs.current[name] = node; }}
                x1={ORIGIN}
                y1={ORIGIN}
                x2={name === "x" ? ORIGIN + AXIS_LENGTH : ORIGIN}
                y2={name === "y" ? ORIGIN - AXIS_LENGTH : ORIGIN}
                markerEnd={`url(#axis-arrow-${name})`}
              />
              <circle
                ref={(node) => { ringRefs.current[name] = node; }}
                cx={ORIGIN}
                cy={ORIGIN}
                r="3"
                opacity={name === "z" ? 1 : 0}
              />
              <text
                ref={(node) => { depthMarkRefs.current[name] = node; }}
                className="axis-depth-mark"
                x={ORIGIN}
                y={ORIGIN}
                opacity={name === "z" ? 1 : 0}
              >
                ×
              </text>
              <text
                ref={(node) => { labelRefs.current[name] = node; }}
                x={name === "x" ? ORIGIN + AXIS_LENGTH + 5 : ORIGIN + 5}
                y={name === "y" ? ORIGIN - AXIS_LENGTH - 5 : ORIGIN - 5}
              >
                {name.toUpperCase()}
              </text>
            </g>
          ))}
          <circle className="axis-origin" cx={ORIGIN} cy={ORIGIN} r="1.8" />
        </svg>
        <small>ANTERIOR / ROTATABLE</small>
      </div>
    );
  },
);
