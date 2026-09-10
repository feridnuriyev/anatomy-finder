import { layers } from "../anatomy/depth";
import type { Layer } from "../types/anatomy";
export function DepthIndicator({
  layer,
  onChange,
  visibleLayers,
  onToggleLayer,
}: {
  layer: Layer;
  onChange: (depth: number) => void;
  visibleLayers: Layer[] | null;
  onToggleLayer: (layer:Layer) => void;
}) {
  return (
    <nav className="depth-panel" aria-label="Anatomical layers">
      <div className="eyebrow">ANATOMY SYSTEMS</div>
      <div className="layer-list">
        {layers.map((item, index) => (
          <div key={item} className="layer-row"><button
            className={`layer-button ${(visibleLayers?visibleLayers.includes(item):item === layer) ? "active" : ""}`}
            onClick={() => onChange(index === 0 ? 0 : index === 3 ? 100 : index * 25 + 8)}
            aria-pressed={visibleLayers?visibleLayers.includes(item):item === layer}
          >
            <span className="layer-number">0{index + 1}</span>
            <span>{item[0].toUpperCase() + item.slice(1)}</span>
            <span className="layer-dot" />
          </button><button className="visibility-button" aria-label={`${visibleLayers?.includes(item)||(!visibleLayers&&item===layer)?"Hide":"Show"} ${item}`} aria-pressed={visibleLayers?visibleLayers.includes(item):item===layer} onClick={()=>onToggleLayer(item)} title="Toggle system visibility">{visibleLayers?.includes(item)||(!visibleLayers&&item===layer)?"◉":"○"}</button></div>
        ))}
      </div>
    </nav>
  );
}
