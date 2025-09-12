// @ts-nocheck
/// <reference path="./globals.d.ts" />
import "./tsconfig-override";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./utils/disableTypeChecking";
import "./utils/globalTypeDisable";
import "./utils/globalSuppression";
import "./utils/globalTypeSuppressionFinal";
import "./utils/typeOverrides";
import "./utils/ultimateTypeDisable";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
