import { useCallback, useEffect, useRef, useState } from "react";
import { AnatomyViewer } from "../three/AnatomyViewer";
import { CreatorCredit, DepthIndicator } from "../components/DepthIndicator";
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
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      meta.content = theme === "dark" ? "#12191d" : "#edf3f1";
    });
  }, [theme]);
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
        <CreatorCredit className="mobile-creator-credit" />
        <span className="scroll-instruction">
          <span className="mouse-icon" aria-hidden="true" />
          <svg className="touch-icon" viewBox="0 0 32 28" aria-hidden="true" focusable="false">
            <rect x="2" y="1.5" width="14" height="23" rx="3" />
            <path d="M7 4.5h4M7 21.5h4" />
            <path d="M21 26c-2.4 0-4.2-1.2-5.1-3.2l-2-4.3a1.45 1.45 0 0 1 2.45-1.5l1.45 1.65V10.2a1.65 1.65 0 0 1 3.3 0v5.1-1.25a1.55 1.55 0 0 1 3.1 0v1.55-.75a1.45 1.45 0 0 1 2.9 0v1.45-.25a1.35 1.35 0 0 1 2.7 0v3.6c0 3.7-2.6 6.35-6.3 6.35H21Z" />
            <path className="touch-motion" d="M23.5 7.2c1.2.55 2.1 1.55 2.5 2.8M23.8 3.5c2.75.85 4.9 3.05 5.7 5.8" />
          </svg>
          <span className="desktop-scroll-copy">Scroll to explore deeper anatomy</span>
          <span className="mobile-scroll-copy">Swipe to explore anatomy</span>
        </span>
        <span className="desktop-interaction-instruction">
          Drag to rotate <b>·</b> Select to inspect
        </span>
        <span className="prototype-note">
          <a href="/models/bodyparts3d/ATTRIBUTION.txt" target="_blank" rel="noreferrer">Model sources</a> <span>·</span> Not for medical use
        </span>
      </footer>
    </main>
  );
}
