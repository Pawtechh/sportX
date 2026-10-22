import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import auth from "./routes/auth";
import productsRouter, { logsRouter } from "./routes/products";
import orders from "./routes/orders";
import admin from "./routes/admin";
import { initDatabase } from "./db";

import reviews from "./routes/reviews";
import projectsRouter from "./routes/projects";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/products", productsRouter);
app.use("/api/inventory-logs", logsRouter);
app.use("/api/orders", orders);
app.use("/api/admin", admin);
app.use("/api/reviews", reviews);
app.use("/api/projects", projectsRouter);

// Hosting de producción: sirve el frontend compilado (npm run build) con fallback SPA.
const dist = path.resolve(process.cwd(), "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ error: err.message ?? "Error interno" });
});

app.get("/healthz", (_req, res) => res.status(200).send("OK"));

async function start() {
  const port = Number(process.env.PORT || 10000);
  app.listen(port, "0.0.0.0", () => {
    console.log(`SportX API → http://0.0.0.0:${port}`);
  });
  try {
    await initDatabase();
    console.log("SportX DB initialized and ready.");
  } catch (err) {
    console.error("Warning initializing DB:", err);
  }
}

start();
