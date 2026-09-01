const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const runSync = (command, args, env) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const run = (command, args, env) => {
  const child = spawn(command, args, { stdio: "inherit", shell: false, env });
  child.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });
};

const port = process.env.PORT || "3000";
const distDir = process.env.NEXT_DIST_DIR || ".next";

// Очищаем старый каталог сборки, чтобы не смешивались артефакты
// прошлых деплоев (причина битых серверных экшенов и цикла перезапуска).
try {
  fs.rmSync(path.join(process.cwd(), distDir), { recursive: true, force: true });
  console.log(`[start-all] Очищен каталог сборки: ${distDir}`);
} catch (e) {
  console.warn("[start-all] Не удалось очистить distDir:", e.message);
}

const env = { ...process.env, NEXT_DIST_DIR: distDir };

runSync("npm", ["run", "build"], env);
run(
  "node",
  ["node_modules/next/dist/bin/next", "start", "-p", port, "-H", "0.0.0.0"],
  env
);
