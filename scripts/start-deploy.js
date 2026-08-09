const { spawn, spawnSync } = require("child_process");

console.log("=== build ===");
const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
if (build.status !== 0) {
  console.error("Build failed");
  process.exit(build.status || 1);
}

console.log("=== start ===");
const port = process.env.PORT || "3000";
const child = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code || 0));
