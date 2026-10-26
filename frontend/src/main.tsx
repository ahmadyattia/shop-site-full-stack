// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
// import { HashRouter } from "react-router-dom";
import { Container } from "react-dom/client";

createRoot(document.getElementById("root") as Container).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
