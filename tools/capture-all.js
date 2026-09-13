const { spawnSync } = require("child_process");
const path = require("path");

const projects = ["ai-product-launch", "automate-video-ia", "mimis-2.0", "dropship-system", "ai-bos"];

for (const slug of projects) {
  console.log("\n=== " + slug + " ===");
  const r = spawnSync(process.execPath, ["capture.js", slug], {
    cwd: __dirname,
    encoding: "utf8",
    timeout: 120000,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.error) console.error("ERR", r.error.message);
  if (r.status !== 0) console.error("exit", r.status);
}