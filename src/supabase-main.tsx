import React from "react";
import ReactDOM from "react-dom/client";
import SupabaseApp from "./SupabaseApp.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SupabaseApp />
  </React.StrictMode>,
);
