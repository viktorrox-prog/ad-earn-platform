const { spawn } = require("child_process");
const { spawnSync } = require("child_process");

console.log("=== build ===");
const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
if (build.status !== 0) {
  process.exit(build.status || 1);
}

console.log("=== start ===");
const child = spawn("npm", ["run", "start"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code || 0));
