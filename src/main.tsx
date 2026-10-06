import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { registerPwa } from "./lib/pwa";

/* Vazirmatn (Latin + Persian) and the Korean fallback subsets are declared
   in src/index.css from local font assets — no runtime font imports. */

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

registerPwa();
