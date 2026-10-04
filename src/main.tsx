import React from "react";
import ReactDOM from "react-dom/client";

/* Body / UI — DM Sans (variable): designed for small on-screen sizes,
   geometric but friendly, and it matches Poppins' geometry. */
import "@fontsource-variable/dm-sans";

/* Display — Poppins: the geometric sans K-pop and Gen-Z brands lean on.
   Only the four weights the UI uses, and only the latin subset, so the
   page never pays for Devanagari or the woff fallbacks. */
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-800.css";

import "./index.css";
import App from "./app/App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
