import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";

/* Fonts: Pretendard is declared as @font-face in src/index.css from the
   self-hosted latin subsets in src/assets/fonts/ — no runtime font imports. */

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
