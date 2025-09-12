/// <reference path="./globals.d.ts" />
// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./utils/disableTypeChecking";
import "./utils/globalTypeDisable";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
