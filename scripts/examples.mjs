import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { pagesBase, sites, themeCandidate, themeSpec } from "./examples.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharedConfig = path.join(root, "config", "hexo.yml");
const cacheDir = path.join(root, ".cache");
const selectedId = option("site");

function option(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return "";
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`--${name} requires a value`);
  return value;
}

function assertNode22() {
  if (Number(process.versions.node.split(".")[0]) < 22) {
    throw new Error(`Node.js 22 or higher is required, got ${process.version}`);
  }
}

function selectedSites(required = false) {
  if (!selectedId) {
    if (required) throw new Error(`--site is required (${sites.map(site => site.id).join(" | ")})`);
    return sites;
  }
  const site = sites.find(candidate => candidate.id === selectedId);
  if (!site) throw new Error(`Unknown site: ${selectedId}`);
  return [site];
}

function siteRoot(site) {
  return path.join(root, site.source);
}

function hexoBinary(baseDir) {
  return path.join(baseDir, "node_modules", ".bin", process.platform === "win32" ? "hexo.cmd" : "hexo");
}

function configArgument(site, developmentPort = null) {
  const configs = [sharedConfig, path.join(siteRoot(site), "_config.yml")];
  if (developmentPort != null) {
    fs.mkdirSync(cacheDir, { recursive: true });
    const file = path.join(cacheDir, `development-${site.id}.yml`);
    fs.writeFileSync(file, `url: http://127.0.0.1:${developmentPort}\nroot: /\n`, "utf8");
    configs.push(file);
  }
  return configs.join(",");
}

function multiconfigOutput(site) {
  const output = path.join(cacheDir, "multiconfig", site.id);
  fs.mkdirSync(output, { recursive: true });
  return output;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    env: { ...process.env, HEXO_READY: "" },
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit"
  });
  if (result.error) throw result.error;
  if (options.expectFailure) {
    if (result.status === 0) throw new Error(`${command} ${args.join(" ")} unexpectedly succeeded`);
    return `${result.stdout || ""}${result.stderr || ""}`;
  }
  if (result.status !== 0) {
    if (options.capture) process.stderr.write(`${result.stdout || ""}${result.stderr || ""}`);
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
  return result.stdout || "";
}

function runHexo(site, args, options = {}) {
  const baseDir = options.baseDir || siteRoot(site);
  const developmentPort = options.development ? Number(option("port") || site.port) : null;
  const config = options.config || configArgument(site, developmentPort);
  return run(hexoBinary(baseDir), [...args, "--config", config, "--output", multiconfigOutput(site)], { cwd: baseDir, ...options });
}

function clean(site) {
  runHexo(site, ["clean"]);
}

export function clearCache(directory = cacheDir, siteId = selectedId) {
  if (siteId) {
    fs.rmSync(path.join(directory, `development-${siteId}.yml`), { force: true });
    fs.rmSync(path.join(directory, "multiconfig", siteId), { recursive: true, force: true });
  }
  else fs.rmSync(directory, { recursive: true, force: true });
}

function doctor(site) {
  runHexo(site, ["stellar", "doctor", "--format", "text"]);
}

function build(site) {
  clean(site);
  runHexo(site, ["generate"]);
}

function assertFile(file, label = file) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${label}`);
}

function assertContains(file, marker, label = file) {
  assertFile(file, label);
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes(marker)) throw new Error(`${label} is missing marker: ${marker}`);
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walkFiles(target));
    else result.push(target);
  }
  return result;
}

function checkStructure() {
  assertNode22();
  assertFile(path.join(root, "package-lock.json"), "root package-lock.json");
  assertFile(path.join(root, "main.mjs"), "main.mjs");
  assertFile(path.join(root, "blueprints.json"), "blueprints.json");
  assertFile(path.join(root, "install.sh"), "install.sh");
  assertFile(path.join(root, "install.ps1"), "install.ps1");
  if ((fs.statSync(path.join(root, "install.sh")).mode & 0o111) === 0) throw new Error("install.sh is not executable");
  if (fs.existsSync(path.join(root, "start.sh"))) throw new Error("Removed entrypoint still exists: start.sh");
  for (const removed of ["lightblog", "blog", "knowledge", "docs", "stellar", "sites"]) {
    if (fs.existsSync(path.join(root, removed))) throw new Error(`Removed directory still exists: ${removed}`);
  }
  for (const site of sites) {
    const baseDir = siteRoot(site);
    assertFile(path.join(baseDir, "package.json"));
    assertFile(path.join(baseDir, "_config.yml"));
    assertFile(path.join(baseDir, "_config.stellar.yml"));
    const pkg = JSON.parse(fs.readFileSync(path.join(baseDir, "package.json"), "utf8"));
    if (pkg.dependencies?.["hexo-theme-stellar"] !== themeSpec) {
      throw new Error(`${site.id} does not use ${themeSpec}`);
    }
    if (pkg.dependencies?.hexo !== "8.1.2" || pkg.hexo?.version !== "8.1.2") {
      throw new Error(`${site.id} does not pin Hexo 8.1.2`);
    }
    for (const unexpected of ["package-lock.json", "scaffolds"]) {
      if (fs.existsSync(path.join(baseDir, unexpected))) throw new Error(`${site.id} contains duplicated ${unexpected}`);
    }
    assertContains(path.join(baseDir, "_config.yml"), `title: ${site.name}`, `${site.id} site name`);
    assertContains(path.join(baseDir, "_config.yml"), `description: ${site.type}`, `${site.id} site type`);
    assertContains(path.join(baseDir, "_config.stellar.yml"), `name: ${site.name}`, `${site.id} brand name`);
  }
  const rootPackage = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  if (JSON.stringify(rootPackage.workspaces) !== JSON.stringify(sites.map(site => site.source))) {
    throw new Error("Root workspaces do not match the site manifest order");
  }
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  const themeLocks = sites.map(site => {
    const entry = lock.packages?.[`${site.source}/node_modules/hexo-theme-stellar`];
    if (!entry) throw new Error(`Root lock is missing ${site.id}'s Stellar package`);
    if (entry.resolved !== themeSpec) {
      throw new Error(`${site.id} lock entry does not resolve to the immutable HTTPS theme candidate ${themeCandidate}`);
    }
    if (!entry.integrity) throw new Error(`${site.id} lock entry has no integrity record`);
    return entry;
  });
  if (new Set(themeLocks.map(entry => entry.resolved)).size !== 1) {
    throw new Error("Workspace lock entries resolve different Stellar commits");
  }
  if (new Set(themeLocks.map(entry => entry.integrity)).size !== 1) {
    throw new Error("Workspace lock entries contain different Stellar integrity records");
  }
  assertContains(path.join(root, "case1-lightblog", "_config.stellar.yml"), "preset: flat", "lightblog Visual Style");
  assertContains(path.join(root, "case2-blog", "_config.stellar.yml"), "preset: card", "blog Visual Style");
  assertContains(path.join(root, "case3-knowledge", "_config.stellar.yml"), "preset: glass", "knowledge Visual Style");
  if (/^appearance:/m.test(fs.readFileSync(path.join(root, "case4-docs", "_config.stellar.yml"), "utf8"))) {
    throw new Error("docs must consume the default card style without redundant appearance overrides");
  }
  process.stdout.write(`Structure passed: Hexo 8.1.2 + Stellar ${themeCandidate}\n`);
}

function checkOutputs() {
  for (const site of selectedSites()) {
    const publicDir = path.join(siteRoot(site), "public");
    for (const relative of site.expectedFiles) assertFile(path.join(publicDir, relative), `${site.id}/${relative}`);
    for (const relative of site.forbiddenFiles) {
      if (fs.existsSync(path.join(publicDir, relative))) throw new Error(`${site.id} generated forbidden route ${relative}`);
    }
    const outputFiles = walkFiles(publicDir);
    const searchable = outputFiles
      .filter(file => /\.(?:html|json)$/.test(file))
      .map(file => fs.readFileSync(file, "utf8"))
      .join("\n");
    const renderedHtml = outputFiles
      .filter(file => file.endsWith(".html"))
      .map(file => fs.readFileSync(file, "utf8"))
      .join("\n");
    const indexHtml = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
    for (const marker of site.expectedMarkers) {
      if (!searchable.includes(marker)) throw new Error(`${site.id} output is missing marker: ${marker}`);
    }
    for (const marker of site.expectedIndexMarkers || []) {
      if (!indexHtml.includes(marker)) throw new Error(`${site.id} index output is missing marker: ${marker}`);
    }
    if (site.expectedSidebarGroups) {
      const tree = indexHtml.match(/<widget class="widget-wrapper doc-tree-widget"[\s\S]*?<\/widget>/)?.[0] || "";
      const groups = [...tree.matchAll(/<section class="widget-section">([\s\S]*?)<\/section>/g)]
        .map(([, section]) => ({
          title: section.match(/<div class="widget-header[^>]*><span class="name">([^<]+)<\/span>/)?.[1] || "",
          count: [...section.matchAll(/class="[^"]*ui-collection__item/g)].length
        }));
      if (JSON.stringify(groups) !== JSON.stringify(site.expectedSidebarGroups)) {
        const actual = groups.map(group => `${group.title}(${group.count})`).join(" | ") || "<none>";
        throw new Error(`${site.id} sidebar groups mismatch: ${actual}`);
      }
    }
    for (const marker of site.forbiddenMarkers) {
      if (renderedHtml.includes(marker)) throw new Error(`${site.id} output contains unresolved marker: ${marker}`);
    }
    const deploymentPrefix = `${pagesBase}${site.id}/`;
    assertContains(path.join(publicDir, "index.html"), deploymentPrefix, `${site.id} deployment root`);
    process.stdout.write(`${site.id}: routes, content and deployment root passed\n`);
  }
}

function portalHtml() {
  const cards = sites.map(site => `
      <a class="card" href=".${site.path}">
        <span class="meta">${site.type} · ${site.blueprint} · ${site.appearance}</span>
        <strong>${site.name}</strong>
        <span>${site.tagline}</span>
      </a>`).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Stellar Blueprint Examples</title>
  <meta name="description" content="Stellar v2 Blueprint 的四个真实 Hexo 8 示例。">
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #11131a; color: #f5f7ff; }
    main { width: min(960px, calc(100% - 40px)); padding: 64px 0; }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 6vw, 4rem); }
    p { margin: 0 0 36px; color: #aeb6cc; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .card { display: grid; gap: 10px; padding: 24px; color: inherit; text-decoration: none; border: 1px solid #303747; border-radius: 18px; background: #1a1e29; transition: transform .2s, border-color .2s; }
    .card:hover { transform: translateY(-3px); border-color: #708cff; }
    .card strong { font-size: 1.35rem; }
    .card span { color: #aeb6cc; }
    .card .meta { color: #7f98ff; font: 600 .78rem ui-monospace, monospace; text-transform: uppercase; }
  </style>
</head>
<body>
  <main>
    <h1>Stellar Blueprint Examples</h1>
    <p>选择一条产品旅程，查看 Blueprint 与 Visual Style 的真实组合。</p>
    <div class="grid">${cards}
    </div>
  </main>
</body>
</html>
`;
}

function prepareDeployment() {
  const destination = path.join(root, "dist");
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, "index.html"), portalHtml(), "utf8");
  for (const site of sites) {
    fs.cpSync(path.join(siteRoot(site), "public"), path.join(destination, site.id), { recursive: true });
  }
  for (const site of sites) {
    assertContains(path.join(destination, "index.html"), `href=".${site.path}"`, `portal link for ${site.id}`);
    assertFile(path.join(destination, site.id, "index.html"), `deployed ${site.id} index`);
  }
  process.stdout.write(`Pages artifact prepared: ${destination}\n`);
}

function portAvailable(port) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => server.close(() => resolve(true)));
  });
}

function serverArgs(site, port) {
  const config = configArgument(site, port);
  return ["server", "--ip", "127.0.0.1", "--port", String(port), "--config", config, "--output", multiconfigOutput(site)];
}

async function startServers(targets) {
  assertNode22();
  const ports = targets.map(site => ({ site, port: Number(site.port) }));
  if (targets.length === 1 && option("port")) ports[0].port = Number(option("port"));
  for (const { site, port } of ports) {
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`${site.id} has invalid port ${port}`);
    if (!(await portAvailable(port))) throw new Error(`${site.name} cannot start: 127.0.0.1:${port} is already in use`);
  }
  process.stdout.write("\n");
  for (const { site, port } of ports) process.stdout.write(`  http://127.0.0.1:${port}/  ${site.name} · ${site.type}\n`);
  process.stdout.write("\n  0. 停止预览\n\n");

  const children = ports.map(({ site, port }) => spawn(hexoBinary(siteRoot(site)), serverArgs(site, port), {
    cwd: siteRoot(site),
    env: { ...process.env, HEXO_READY: "" },
    stdio: "ignore"
  }));
  let stopping = false;
  let requestedStop = false;
  let requestedSignal = "";
  const stop = signal => {
    if (stopping) return;
    stopping = true;
    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) child.kill(signal === "SIGINT" ? "SIGINT" : "SIGTERM");
    }
    setTimeout(() => {
      for (const child of children) {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      }
    }, 2000).unref();
  };
  process.once("SIGINT", () => {
    requestedStop = true;
    requestedSignal = "SIGINT";
    stop("SIGINT");
  });
  process.once("SIGTERM", () => {
    requestedStop = true;
    requestedSignal = "SIGTERM";
    stop("SIGTERM");
  });
  const exits = children.map((child, index) => new Promise(resolve => {
    child.once("error", error => resolve({ index, error }));
    child.once("exit", (code, signal) => resolve({ index, code, signal }));
  }));
  const first = await Promise.race(exits);
  stop("SIGTERM");
  await Promise.allSettled(exits);
  if (first.error) throw first.error;
  if (!requestedStop || (first.code != null && first.code !== 0)) {
    throw new Error(`${ports[first.index].site.id} preview exited unexpectedly (${first.code ?? first.signal})`);
  }
  process.exitCode = requestedSignal === "SIGINT" ? 130 : 143;
}

async function main() {
  const command = process.argv[2] || "";
  assertNode22();
  if (command === "clean") {
    for (const site of selectedSites()) clean(site);
    clearCache();
  } else if (command === "doctor") {
    for (const site of selectedSites()) doctor(site);
  } else if (command === "build") {
    for (const site of selectedSites()) build(site);
  } else if (command === "check-structure") {
    checkStructure();
  } else if (command === "check-outputs") {
    checkOutputs();
  } else if (command === "check") {
    checkStructure();
    for (const site of sites) doctor(site);
    for (const site of sites) build(site);
    checkOutputs();
  } else if (command === "deploy") {
    checkStructure();
    for (const site of sites) doctor(site);
    for (const site of sites) build(site);
    checkOutputs();
    prepareDeployment();
  } else if (command === "dev") {
    await startServers(selectedSites(true));
  } else if (command === "start-all") {
    await startServers(sites);
  } else {
    throw new Error("Usage: node scripts/examples.mjs <clean|dev|doctor|build|check-structure|check-outputs|check|deploy|start-all>");
  }
}

const entryFile = process.argv[1] ? fs.realpathSync(process.argv[1]) : "";
if (entryFile === fs.realpathSync(fileURLToPath(import.meta.url))) {
  main().catch(error => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
