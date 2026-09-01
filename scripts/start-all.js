const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs");

const runSync = (command, args, env) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false, env });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const run = (command, args, env) => {
  const child = spawn(command, args, { stdio: "inherit", shell: false, env });
  child.on("error", (err) => { console.error(err); process.exit(1); });
};

const port = process.env.PORT || "3000";
// distDir может быть абсолютным (например /home/app/.next)
const distDir = process.env.NEXT_DIST_DIR || ".next";

// Очищаем старый каталог сборки. Если путь абсолютный - удаляем как есть.
try {
  const target = distDir.startsWith("/") ? distDir : `${process.cwd()}/${distDir}`;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`[start-all] Очищен каталог сборки: ${target}`);
} catch (e) {
  console.warn("[start-all] Не удалось очистить distDir:", e.message);
}

const env = { ...process.env, NEXT_DIST_DIR: distDir };

runSync("npm", ["run", "build"], env);
run("node", ["node_modules/next/dist/bin/next", "start", "-p", port, "-H", "0.0.0.0"], env);

