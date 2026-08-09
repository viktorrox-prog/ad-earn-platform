const { spawnSync } = require("child_process");

console.log("=== start:deploy: build ===");
const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
if (build.status !== 0) {
  console.error("Build failed");
  process.exit(build.status || 1);
}

console.log("=== start:deploy: start ===");
const start = spawnSync("npm", ["run", "start:prod"], { stdio: "inherit", shell: true });
process.exit(start.status || 0);
