import { StructureViewer } from "../three/StructureViewer";
import type { AnatomicalStructure } from "../types/anatomy";
import { structures } from "../data/structures";
export function SelectedStructurePanel({
  structure,
  detailsOpen,
  onDetails,
  isolated,
  onIsolate,
  onClose,
}: {
  structure: AnatomicalStructure;
  detailsOpen: boolean;
  onDetails: () => void;
  isolated: boolean;
  onIsolate: () => void;
  onClose: () => void;
}) {
  return (
    <aside className="inspection-panel" aria-label="Selected structure">
      <div className="inspection-header">
        <span className="eyebrow">STRUCTURE INSPECTION</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close inspection"
        >
          ×
        </button>
      </div>
      <div className="structure-title">
        <span className="system-label">{structure.system}</span>
        <h2>{structure.name}</h2>
        <p className="structure-summary">{structure.description}</p>
      </div>
      <div className="structure-canvas">
        <StructureViewer key={structure.id} id={structure.id} />
      </div>
      <div className="inspection-actions">
        <button
          className={isolated ? "selected-action" : ""}
          onClick={onIsolate}
          aria-pressed={isolated}
        >
          {isolated ? "Show full body" : "Isolate structure"}
        </button>
        <button onClick={onClose}>Reset</button>
        <button
          className="icon-button dots"
          aria-label={`Details for ${structure.name}`}
          aria-expanded={detailsOpen}
          aria-controls="structure-details"
          onClick={onDetails}
        >
          ···
        </button>
      </div>
      {detailsOpen ? (
        <section id="structure-details" className="details-panel">
          <div className="details-heading">
            <h3>Structure notes</h3>
            <span>{structure.source?"SOURCE DATA":"EXAMPLE DATA"}</span>
          </div>
          <p>{structure.description}</p>
          <dl>
            <dt>Name</dt>
            <dd>{structure.name}</dd>
            <dt>Anatomical system</dt>
            <dd>{structure.system}</dd>
            <dt>Location</dt>
            <dd>{structure.location}</dd>
            {structure.source&&<><dt>Source identifier</dt><dd>{structure.source.fmaId} · {structure.source.version}</dd><dt>Provenance</dt><dd><a href={structure.source.url} target="_blank" rel="noreferrer">BodyParts3D dataset ↗</a> · <a href={structure.source.licenseUrl} target="_blank" rel="noreferrer">License ↗</a></dd></>}
            <dt>Function</dt>
            <dd>{structure.function}</dd>
            {structure.contentSource&&<><dt>Educational source</dt><dd><a href={structure.contentSource.url} target="_blank" rel="noreferrer">{structure.contentSource.title} ↗</a> · {structure.contentSource.license}</dd></>}
            <dt>Related structures</dt>
            <dd>
              {structure.related
                .map((id) => structures.find((s) => s.id === id)?.name ?? id)
                .join(", ") || "Not yet curated"}
            </dd>
          </dl>
        </section>
      ) : (
        <p className="inspection-hint">
          Drag to rotate · Pinch to zoom
          <br />
          <span>BodyParts3D · Scale adjusted for inspection</span>
        </p>
      )}
    </aside>
  );
}
