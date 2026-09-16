import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Public routes are prerendered at build time (scripts/prerender.mjs) — hydrate
// that markup. /admin ships the empty 200.html shell, so mount fresh there.
const el = document.getElementById("root");
if (el.firstElementChild) hydrateRoot(el, app);
else createRoot(el).render(app);
