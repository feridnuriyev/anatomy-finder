import { useEffect, useRef, useState } from "react";
import { clampDepth, currentLayer, wheelDelta } from "../anatomy/depth";
export function useAnatomyDepth(onWheelDepth?:()=>void) {
  const wheelAction=useRef(onWheelDepth);
  useEffect(()=>{wheelAction.current=onWheelDepth;},[onWheelDepth]);
  const [anatomyDepth, setDepth] = useState(0);
  const [targetDepth, setTarget] = useState(0);
  const target = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const setTargetDepth = (value: number) => {
    target.current = clampDepth(value);
    setTarget(target.current);
  };
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      event.stopPropagation();
      wheelAction.current?.();
      setTargetDepth(
        target.current + wheelDelta(event.deltaY, event.deltaMode),
      );
    };
    element.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    return () => element.removeEventListener("wheel", onWheel, true);
  }, []);
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let value = 0;
    const tick = (now: number) => {
      const factor = 1 - Math.exp(-Math.min(now - last, 64) / 95);
      last = now;
      if (Math.abs(target.current - value) > 0.01) {
        value += (target.current - value) * factor;
        setDepth(value);
      } else if (value !== target.current) {
        value = target.current;
        setDepth(value);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return {
    anatomyDepth,
    currentLayer: currentLayer(anatomyDepth),
    targetDepth,
    setTargetDepth,
    viewportRef,
  };
}
