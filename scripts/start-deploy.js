
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== clean .next ===");
const nextDir = path.join(__dirname, "..", ".next");
fs.rmSync(nextDir, { recursive: true, force: true });

console.log("=== build ===");
const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
if (build.status !== 0) {
  console.error("Build failed");
  process.exit(build.status || 1);
}

console.log("=== start ===");
const port = process.env.PORT || "3000";
const nextBin = path.join(__dirname, "..", "node_modules", ".bin", "next");
const child = spawn(nextBin, ["start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code || 0));
