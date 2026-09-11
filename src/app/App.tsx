import { useCallback, useEffect, useRef, useState } from "react";
import { AnatomyViewer } from "../three/AnatomyViewer";
import { DepthIndicator } from "../components/DepthIndicator";
import { DepthControl } from "../components/DepthControl";
import { SelectedStructurePanel } from "../components/SelectedStructurePanel";
import { useAnatomyDepth } from "../hooks/useAnatomyDepth";
import { useStructureSelection } from "../hooks/useStructureSelection";
import { structures } from "../data/structures";
import { useAnatomyTools } from "../hooks/useAnatomyTools";
import { AtlasStatus } from "../components/AtlasStatus";
import { ArrangementControl } from "../components/ArrangementControl";
import { OrientationGizmo } from "../components/OrientationGizmo";
import type { OrientationGizmoHandle, QuaternionTuple } from "../components/OrientationGizmo";
import type { Layer } from "../types/anatomy";

type Theme = "dark" | "light";

function getSystemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getSystemTheme);
  const hasManualTheme = useRef(false);
  const [visibleLayers,setVisibleLayers]=useState<Layer[]|null>(null);
  const [explosion,setExplosion]=useState(0);
  const depth = useAnatomyDepth(()=>setVisibleLayers(null));
  const selection = useStructureSelection();
  const [resetKey, setResetKey] = useState(0);
  const orientationRef = useRef<OrientationGizmoHandle>(null);
  const updateOrientation = useCallback((quaternion: QuaternionTuple) => {
    orientationRef.current?.setQuaternion(quaternion);
  }, []);
  const selected = selection.selectedStructure;
  useAnatomyTools({
    setDepth: depth.setTargetDepth,
    select: selection.select,
    reset: selection.reset,
  });
  function reset() {
    selection.reset();
    setResetKey((key) => key + 1);
    depth.setTargetDepth(0);
    setVisibleLayers(null);
    setExplosion(0);
  }
  function arrange(value:number) {
    if(value>0 && !visibleLayers)setVisibleLayers(["skin","muscles","organs","skeleton"]);
    setExplosion(value);
  }
  function toggleLayer(layer:Layer) {
    setVisibleLayers(previous=>{const active=previous??[depth.currentLayer];return active.includes(layer)?active.filter(item=>item!==layer):[...active,layer];});
  }
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") selection.reset();
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [selection.reset]);
  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const updateFromSystem = (event: MediaQueryListEvent) => {
      if (!hasManualTheme.current) setTheme(event.matches ? "dark" : "light");
    };
    systemTheme.addEventListener("change", updateFromSystem);
    return () => systemTheme.removeEventListener("change", updateFromSystem);
  }, []);
  return (
    <main className={`app theme-${theme} ${selected ? "has-selection" : ""}`}>
      <header className="app-header">
        <a className="brand" href="./" aria-label="Anatomy Finder home">
          <span className="brand-mark">
            <img src="/anatomy-finder-logo.png" alt="" />
          </span>
          <span>
            Anatomy<span className="brand-light"> Finder</span>
          </span>
        </a>
        <div className="header-right">
          <span className="prototype-badge">
            <i />
            HUMAN ATLAS / 02
          </span>
          <button className="reset-view" onClick={reset}>
            <span>↺</span> Reset view
          </button>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => {
              hasManualTheme.current = true;
              setTheme((current) => current === "dark" ? "light" : "dark");
            }}
            aria-pressed={theme === "light"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? "☀ Light" : "◐ Dark"}
          </button>
        </div>
      </header>
      <div className="workspace">
        <div className="main-stage" ref={depth.viewportRef}>
          <div className="stage-caption">
            <span className="eyebrow">THE HUMAN BODY</span>
            <h1>
              {explosion>.5?"Parts atlas":visibleLayers?"Human anatomy":depth.currentLayer[0].toUpperCase()+depth.currentLayer.slice(1)}
            </h1>
            <p>
              {selected
                ? "Structure in context"
                : "An exploration, layer by layer."}
            </p>
          </div>
          <AtlasStatus layer={depth.currentLayer} activeLayers={visibleLayers}/>
          <div className="body-canvas"><AnatomyViewer
            depth={depth.anatomyDepth}
            selectedId={selected?.id}
            isolated={selection.inspectionMode === "isolated"}
            onSelect={selection.select}
            resetKey={resetKey}
            visibleLayers={visibleLayers}
            explosion={explosion}
            onOrientationChange={updateOrientation}
          /></div>
          <OrientationGizmo ref={orientationRef} />
          <div className="stage-bottom">
            <span className="status-dot" />{" "}
            {selection.inspectionMode === "isolated"
              ? "Isolated structure"
              : "Full body"}
            <span className="stage-scale">SOURCED ANATOMY · BODYParts3D</span>
          </div>
          <div className="exploration-controls">
            <ArrangementControl value={explosion} onChange={arrange}/>
            <DepthControl
              depth={depth.anatomyDepth}
              target={depth.targetDepth}
              onChange={(value) => {
                selection.reset();
                setVisibleLayers(null);
                depth.setTargetDepth(value);
              }}
            />
          </div>
        </div>
        <DepthIndicator
          layer={depth.currentLayer}
          onChange={(value) => {
            selection.reset();
            setVisibleLayers(null);
            depth.setTargetDepth(value);
          }}
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayer}
        />
        {selected && (
          <SelectedStructurePanel
            structure={selected}
            detailsOpen={selection.detailsPanelOpen}
            onDetails={() =>
              selection.setDetailsPanelOpen(!selection.detailsPanelOpen)
            }
            isolated={selection.inspectionMode === "isolated"}
            onIsolate={() =>
              selection.setInspectionMode(
                selection.inspectionMode === "isolated"
                  ? "context"
                  : "isolated",
              )
            }
            onClose={selection.reset}
          />
        )}
        <div className="structure-picker">
          <label htmlFor="structure">Select structure</label>
          <select
            aria-label="Select structure"
            id="structure"
            value={selected&&(visibleLayers?visibleLayers.includes(selected.layer):selected.layer===depth.currentLayer)?selected.id:""}
            onChange={(e) =>
              e.target.value
                ? selection.select(e.target.value)
                : selection.reset()
            }
          >
            <option value="">
              Choose a{" "}
              {depth.currentLayer === "skeleton" ? "bone" : "structure"}…
            </option>
            {structures
              .filter((s) => visibleLayers?visibleLayers.includes(s.layer):s.layer === depth.currentLayer)
              .map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <footer className="app-footer">
        <span className="scroll-instruction">
          <span className="mouse-icon" /> Scroll to explore deeper anatomy
        </span>
        <span>
          Drag to rotate <b>·</b> Select to inspect
        </span>
        <span className="prototype-note">
          <a href="/models/bodyparts3d/ATTRIBUTION.txt" target="_blank" rel="noreferrer">Model sources</a> <span>·</span> Not for medical use
        </span>
      </footer>
    </main>
  );
}
