import { Component } from "react";
import type { ReactNode } from "react";
export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-error">
        <h2>3D view unavailable</h2>
        <p>Please enable WebGL or try a browser with hardware acceleration.</p>
        <button onClick={() => this.setState({ failed: false })}>
          Retry 3D view
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
