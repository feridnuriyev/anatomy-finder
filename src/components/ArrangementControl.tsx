import type { CSSProperties } from "react";

export function ArrangementControl({value,onChange}:{value:number;onChange:(value:number)=>void}) {
  const percentage = Math.round(value * 100);
  const rangeStyle = { "--range-value": `${percentage}%` } as CSSProperties;
  return <div className="arrangement-control"><div className="arrangement-heading"><span>Arrangement</span><output>{percentage}%</output></div><input style={rangeStyle} type="range" min="0" max="100" value={percentage} aria-label="Explode anatomy" onChange={event=>onChange(Number(event.target.value)/100)}/><div className="arrangement-buttons"><button aria-pressed={value===0} onClick={()=>onChange(0)}>Full body</button><button aria-pressed={value===1} onClick={()=>onChange(1)}>Parts atlas</button></div></div>;
}
