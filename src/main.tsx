import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import { AtlasStatusProvider } from "./hooks/useAtlasStatus";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AtlasStatusProvider><App /></AtlasStatusProvider>
  </React.StrictMode>,
);
