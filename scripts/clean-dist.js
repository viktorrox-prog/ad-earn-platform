const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", ".next");

try {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log(`[clean-dist] Удалён каталог .next`);
} catch (err) {
  console.error(`[clean-dist] Не удалось очистить distDir: ${err.message}`);
}
