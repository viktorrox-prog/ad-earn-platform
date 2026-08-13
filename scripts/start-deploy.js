const { spawnSync, spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const root = path.join(__dirname, "..");
const nextDir = path.join(root, ".next");

// Удаляем каталог .next перед сборкой, чтобы избежать ошибки EACCES
// (старый каталог может принадлежать другому пользователю на Timeweb)
try {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("[start-deploy] Cleared .next cache");
} catch (err) {
  console.warn("[start-deploy] Could not clear .next:", err.message);
}

// 1. Сборка (синхронно)
const build = spawnSync("npm", ["run", "build"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

if (build.status !== 0) {
  console.error("[start-deploy] Build failed, exiting");
  process.exit(build.status ?? 1);
}

// 2. Запуск (неблокирующий) на порту из окружения PORT (fallback 3000)
const port = process.env.PORT || "3000";

const server = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

server.on("error", (err) => {
  console.error("[start-deploy] Failed to start server:", err.message);
  process.exit(1);
});

server.on("exit", (code, signal) => {
  console.log(`[start-deploy] Server exited with code ${code} signal ${signal}`);
});
