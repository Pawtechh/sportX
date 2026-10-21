import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "animate.css";
import "hover.css/css/hover-min.css";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
