import { layers } from "../anatomy/depth";
import type { Layer } from "../types/anatomy";

export function CreatorCredit({ className = "" }: { className?: string }) {
  return (
    <a
      className={`creator-credit ${className}`.trim()}
      href="https://github.com/feridnuriyev"
      target="_blank"
      rel="noreferrer"
      aria-label="Visit Farid Nuriyev on GitHub"
    >
      <svg
        className="creator-github-mark"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M12 .7a11.3 11.3 0 0 0-3.57 22c.57.1.77-.25.77-.55v-2.13c-3.17.69-3.84-1.35-3.84-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.53-.29-5.19-1.26-5.19-5.59 0-1.23.44-2.24 1.18-3.03-.12-.29-.51-1.44.11-3 0 0 .96-.31 3.11 1.16a10.75 10.75 0 0 1 5.67 0c2.15-1.47 3.11-1.16 3.11-1.16.62 1.56.23 2.71.11 3 .74.79 1.18 1.8 1.18 3.03 0 4.34-2.67 5.29-5.2 5.58.41.35.77 1.04.77 2.1v3.16c0 .3.2.66.78.55A11.3 11.3 0 0 0 12 .7Z"
        />
      </svg>
      <span>by Farid Nuriyev</span>
    </a>
  );
}

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
      <CreatorCredit />
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
