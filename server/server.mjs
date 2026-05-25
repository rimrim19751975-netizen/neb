import express from "express";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./sqliteApp.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const PORT = process.env.PORT || 4000;

const app = createApp();

app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distDir, "index.html"));
});

function localIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) ips.push(entry.address);
    }
  }
  return ips;
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Academy started on http://localhost:${PORT}`);
  for (const ip of localIPs()) {
    console.log(`Network: http://${ip}:${PORT}`);
  }
  console.log(`SQLite DB: ${app.locals.dbFile}`);
});
