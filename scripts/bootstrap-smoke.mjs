import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

if (!["posix", "powershell"].includes(mode)) throw new Error("Usage: node scripts/bootstrap-smoke.mjs <posix|powershell>");

const environment = {
  ...process.env,
  STELLAR_INSTALL_REPOSITORY: root,
  STELLAR_INSTALL_REF: ""
};
const result = mode === "posix"
  ? await run(path.join(root, "install.sh"), ["--help"], environment)
  : await run("pwsh", ["-NoProfile", "-Command", `& '${path.join(root, "install.ps1").replaceAll("'", "''")}' -CliArguments @('--help')`], environment);
if (!result.stdout.includes("Usage: node main.mjs")) throw new Error(`Bootstrap did not launch main.mjs\n${result.stdout}${result.stderr}`);
process.stdout.write(`${mode} source bootstrap and launch passed\n`);
