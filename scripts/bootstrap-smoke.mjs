import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "blueprints.json"), "utf8"));
const assets = path.join(root, "release", manifest.version);
const mode = process.argv[2];

function run(command, args, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, env: environment, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${command} exited ${code}\n${stdout}${stderr}`)));
  });
}

if (!fs.existsSync(path.join(assets, "main.mjs"))) throw new Error(`Build release assets first: ${assets}`);
if (!["posix", "powershell"].includes(mode)) throw new Error("Usage: node scripts/bootstrap-smoke.mjs <posix|powershell>");

const server = http.createServer((request, response) => {
  const name = path.posix.basename(new URL(request.url, "http://localhost").pathname);
  if (!["main.mjs", "checksums.txt"].includes(name)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": "application/octet-stream" });
  fs.createReadStream(path.join(assets, name)).pipe(response);
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

try {
  const address = server.address();
  const environment = { ...process.env, STELLAR_INSTALL_BASE_URL: `http://127.0.0.1:${address.port}` };
  const result = mode === "posix"
    ? await run(path.join(root, "install.sh"), ["--help"], environment)
    : await run("pwsh", ["-NoProfile", "-Command", `& '${path.join(root, "install.ps1").replaceAll("'", "''")}' -CliArguments @('--help')`], environment);
  if (!result.stdout.includes("Usage: node main.mjs")) throw new Error(`Bootstrap did not launch main.mjs\n${result.stdout}${result.stderr}`);
  process.stdout.write(`${mode} bootstrap download, checksum and launch passed\n`);
} finally {
  await new Promise(resolve => server.close(resolve));
}
