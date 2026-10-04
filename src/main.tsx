import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/nunito-sans";
import "@fontsource-variable/quicksand";
import "./index.css";
import App from "./app/App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
