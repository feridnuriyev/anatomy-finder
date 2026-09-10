import { Component } from "react";
import type { ReactNode } from "react";

export class AtlasBoundary extends Component<{children:ReactNode; fallback:ReactNode; onFailure:()=>void; retryToken:number}, {failed:boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch() { this.props.onFailure(); }
  componentDidUpdate(previous: Readonly<typeof this.props>) {
    if(previous.retryToken !== this.props.retryToken && this.state.failed) this.setState({failed:false});
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
