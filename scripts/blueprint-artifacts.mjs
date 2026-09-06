#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { blueprintManifest, sites } from "./examples.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultOutput = path.join(root, "release", blueprintManifest.version);
const excludedNames = new Set(["_multiconfig.yml", "db.json", "node_modules", "public"]);

function option(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return "";
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`--${name} requires a value`);
  return value;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function writeString(buffer, offset, length, value) {
  const encoded = Buffer.from(String(value));
  if (encoded.length > length) throw new Error(`Tar field is too long: ${value}`);
  encoded.copy(buffer, offset);
}

function writeOctal(buffer, offset, length, value) {
  const octal = Math.trunc(value).toString(8).padStart(length - 1, "0");
  writeString(buffer, offset, length, `${octal}\0`);
}

function tarHeader(name, size, mode = 0o644) {
  const header = Buffer.alloc(512);
  let fileName = name;
  let prefix = "";
  if (Buffer.byteLength(fileName) > 100) {
    const segments = fileName.split("/");
    fileName = segments.pop();
    prefix = segments.join("/");
    if (Buffer.byteLength(fileName) > 100 || Buffer.byteLength(prefix) > 155) {
      throw new Error(`Tar path is too long: ${name}`);
    }
  }
  writeString(header, 0, 100, fileName);
  writeOctal(header, 100, 8, mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  writeString(header, 156, 1, "0");
  writeString(header, 257, 6, "ustar\0");
  writeString(header, 263, 2, "00");
  writeString(header, 265, 32, "stellar");
  writeString(header, 297, 32, "stellar");
  writeString(header, 345, 155, prefix);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  writeString(header, 148, 8, `${checksum.toString(8).padStart(6, "0")}\0 `);
  return header;
}

function filesBelow(directory, prefix = "") {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (excludedNames.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Blueprint source cannot contain symlinks: ${relative}`);
    if (entry.isDirectory()) result.push(...filesBelow(absolute, relative));
    else if (entry.isFile()) result.push({ absolute, relative });
  }
  return result;
}

export function createTarGz(directory) {
  const chunks = [];
  for (const file of filesBelow(directory)) {
    const content = fs.readFileSync(file.absolute);
    chunks.push(tarHeader(file.relative, content.length), content);
    const padding = (512 - (content.length % 512)) % 512;
    if (padding > 0) chunks.push(Buffer.alloc(padding));
  }
  chunks.push(Buffer.alloc(1024));
  return zlib.gzipSync(Buffer.concat(chunks), { level: 9 });
}

function copyTree(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const file of filesBelow(source)) {
    const output = path.join(destination, file.relative);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(file.absolute, output);
  }
}

function yamlBlocks(content) {
  const blocks = [];
  let current = null;
  for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s|$)/);
    if (match) {
      current = { key: match[1], lines: [line] };
      blocks.push(current);
    } else if (current) current.lines.push(line);
    else if (line.trim()) throw new Error(`Hexo config must begin with a top-level key: ${line}`);
  }
  return blocks;
}

function mergedSiteConfig(source) {
  const shared = yamlBlocks(fs.readFileSync(path.join(root, "config", "hexo.yml"), "utf8"));
  const site = yamlBlocks(fs.readFileSync(path.join(source, "_config.yml"), "utf8"));
  const siteKeys = new Set(site.map(block => block.key));
  const overridden = new Set(["url", "root"]);
  const selected = [
    ...shared.filter(block => !siteKeys.has(block.key) && !overridden.has(block.key)),
    ...site.filter(block => !overridden.has(block.key))
  ];
  return `${selected.map(block => block.lines.join("\n").trimEnd()).join("\n\n")}\n\nurl: http://localhost:4000\nroot: /\n`;
}

function standalonePackage(source, blueprint) {
  const pkg = JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8"));
  return {
    name: `stellar-${blueprint.id}-site`,
    version: "1.0.0",
    private: true,
    scripts: {
      clean: "hexo clean",
      build: "hexo generate",
      server: "hexo server",
      doctor: "hexo stellar doctor"
    },
    hexo: pkg.hexo,
    dependencies: { ...pkg.dependencies, "hexo-theme-stellar": blueprintManifest.theme.spec }
  };
}

function standaloneLock(source, pkg) {
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  const workspace = path.relative(root, source).split(path.sep).join("/");
  const workspaceEntry = lock.packages?.[workspace];
  const lockedDependencies = workspaceEntry?.dependencies || {};
  const dependencyNames = Object.keys(pkg.dependencies);
  if (!workspaceEntry || dependencyNames.length !== Object.keys(lockedDependencies).length
    || dependencyNames.some(name => lockedDependencies[name] !== pkg.dependencies[name])) {
    throw new Error(`${workspace} dependencies are not synchronized with the root package-lock.json`);
  }
  const prefix = `${workspace}/node_modules/`;
  const packages = {
    "": {
      name: pkg.name,
      version: pkg.version,
      dependencies: pkg.dependencies,
      engines: { node: ">=22" }
    }
  };
  for (const [key, value] of Object.entries(lock.packages)) {
    if (key.startsWith(prefix)) packages[`node_modules/${key.slice(prefix.length)}`] = value;
  }
  if (!packages["node_modules/hexo-theme-stellar"]) {
    throw new Error(`${workspace} lock does not contain hexo-theme-stellar`);
  }
  return {
    name: pkg.name,
    version: pkg.version,
    lockfileVersion: lock.lockfileVersion,
    requires: true,
    packages
  };
}

function run(command, args, directory) {
  const result = spawnSync(command, args, {
    cwd: directory,
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, HEXO_READY: "", npm_config_cache: path.join(root, ".cache", "npm") }
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed in ${directory}\n${result.stdout || ""}${result.stderr || ""}`);
  }
  return result.stdout || "";
}

function filesBelowOutput(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesBelowOutput(target));
    else if (entry.isFile()) result.push(target);
  }
  return result;
}

function localFileSpec(from, target) {
  let relative = path.relative(from, path.resolve(target)).split(path.sep).join("/");
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return `file:${relative}`;
}

function useThemeTarball(target, themeTarball) {
  if (!themeTarball) return;
  const absolute = path.resolve(themeTarball);
  if (!fs.statSync(absolute, { throwIfNoEntry: false })?.isFile()) {
    throw new Error(`Theme tarball does not exist: ${absolute}`);
  }
  const packageFile = path.join(target, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  pkg.dependencies["hexo-theme-stellar"] = localFileSpec(target, absolute);
  fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  run(npm, ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"], target);
}

function checkCreatedBlueprint(release, catalog, site, temporaryRoot, themeTarball) {
  const target = path.join(temporaryRoot, site.id);
  const environment = { ...process.env, STELLAR_BLUEPRINT_CATALOG: path.join(release, "catalog.json") };
  const created = spawnSync(process.execPath, [
    path.join(root, "main.mjs"), "create", target,
    "--blueprint", site.id,
    "--version", catalog.version,
    "--no-install",
    "--non-interactive"
  ], { cwd: root, encoding: "utf8", env: environment });
  if (created.status !== 0) throw new Error(`Unable to create ${site.id}\n${created.stdout || ""}${created.stderr || ""}`);
  useThemeTarball(target, themeTarball);
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  run(npm, ["ci", "--no-audit", "--no-fund"], target);
  const hexo = path.join(target, "node_modules", ".bin", process.platform === "win32" ? "hexo.cmd" : "hexo");
  run(hexo, ["stellar", "doctor", "--format", "text"], target);
  run(hexo, ["generate"], target);
  for (const relative of site.expectedFiles) {
    if (!fs.existsSync(path.join(target, "public", relative))) throw new Error(`${site.id} artifact is missing ${relative}`);
  }
  for (const relative of site.forbiddenFiles) {
    if (fs.existsSync(path.join(target, "public", relative))) throw new Error(`${site.id} artifact generated forbidden ${relative}`);
  }
  const searchable = filesBelowOutput(path.join(target, "public"))
    .filter(file => /\.(?:html|json)$/.test(file))
    .map(file => fs.readFileSync(file, "utf8"))
    .join("\n");
  for (const marker of site.expectedMarkers) {
    if (!searchable.includes(marker)) throw new Error(`${site.id} artifact is missing marker: ${marker}`);
  }
  process.stdout.write(`${site.id}: create → npm ci → doctor → generate passed\n`);
}

function checkCreatedBlueprints(release, catalog, themeTarball) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "stellar-created-sites-"));
  try {
    for (const site of sites) checkCreatedBlueprint(release, catalog, site, temporaryRoot, themeTarball);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function stageBlueprint(blueprint, temporaryRoot, options = {}) {
  const source = path.join(root, blueprint.source);
  const destination = path.join(temporaryRoot, blueprint.id);
  copyTree(source, destination);
  fs.writeFileSync(path.join(destination, "_config.yml"), mergedSiteConfig(source));
  const pkg = standalonePackage(source, blueprint);
  fs.writeFileSync(path.join(destination, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
  fs.writeFileSync(path.join(destination, "README.md"), [
    `# ${blueprint.name}`,
    "",
    `${blueprint.description}`,
    "",
    "此站点由 Stellar Blueprint 创建。开始使用前，请修改 `_config.yml` 中的站点信息与 URL。",
    "",
    "```bash",
    "npm install",
    "npm run server",
    "```",
    ""
  ].join("\n"));
  if (!options.skipLock) {
    fs.writeFileSync(path.join(destination, "package-lock.json"), `${JSON.stringify(standaloneLock(source, pkg), null, 2)}\n`);
  }
  return destination;
}

function releaseUrl(version, file) {
  return `https://github.com/${blueprintManifest.repository}/releases/download/v${version}/${file}`;
}

export function buildArtifacts(options = {}) {
  const output = path.resolve(options.output || defaultOutput);
  if (fs.existsSync(output) && fs.readdirSync(output).length > 0) {
    throw new Error(`Artifact output must be empty: ${output}`);
  }
  fs.mkdirSync(output, { recursive: true });
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "stellar-blueprints-"));
  try {
    const blueprints = [];
    for (const blueprint of blueprintManifest.blueprints) {
      process.stdout.write(`准备 ${blueprint.name} Blueprint 制品……\n`);
      const staged = stageBlueprint(blueprint, temporaryRoot, options);
      const file = `stellar-blueprint-${blueprint.id}-${blueprintManifest.version}.tar.gz`;
      const archive = createTarGz(staged);
      fs.writeFileSync(path.join(output, file), archive);
      blueprints.push({
        id: blueprint.id,
        name: blueprint.name,
        description: blueprint.description,
        appearance: blueprint.appearance,
        archive: releaseUrl(blueprintManifest.version, file),
        file,
        sha256: sha256(archive),
        bytes: archive.length
      });
    }
    const catalog = {
      schema_version: 1,
      version: blueprintManifest.version,
      node: ">=22",
      theme: blueprintManifest.theme,
      blueprints
    };
    const catalogContent = `${JSON.stringify(catalog, null, 2)}\n`;
    fs.writeFileSync(path.join(output, "catalog.json"), catalogContent);
    for (const file of ["main.mjs", "install.sh", "install.ps1"]) {
      fs.copyFileSync(path.join(root, file), path.join(output, file));
    }
    const checksummed = ["catalog.json", "main.mjs", "install.sh", "install.ps1", ...blueprints.map(item => item.file)];
    const checksums = checksummed.map(file => `${sha256(fs.readFileSync(path.join(output, file)))}  ${file}`).join("\n");
    fs.writeFileSync(path.join(output, "checksums.txt"), `${checksums}\n`);
    return { output, catalog };
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) < 22) throw new Error(`Node.js 22 or newer is required, got ${process.version}`);
  const command = process.argv[2] || "build";
  const requestedOutput = option("output");
  const temporaryCheckOutput = command === "check" && !requestedOutput;
  const output = requestedOutput || (temporaryCheckOutput
    ? fs.mkdtempSync(path.join(os.tmpdir(), "stellar-blueprint-check-"))
    : defaultOutput);
  const skipLock = process.argv.includes("--skip-lock");
  const themeTarball = option("theme-tarball") || process.env.STELLAR_BLUEPRINT_THEME_TARBALL || "";
  try {
    const result = buildArtifacts({ output, skipLock });
    process.stdout.write(`Blueprint artifacts created: ${result.output}\n`);
    if (command === "check") {
      const expected = new Set(blueprintManifest.blueprints.map(item => item.id));
      const actual = new Set(result.catalog.blueprints.map(item => item.id));
      if (JSON.stringify([...actual]) !== JSON.stringify([...expected])) throw new Error("Artifact catalog does not match blueprints.json");
      process.stdout.write(`Blueprint catalog passed: ${[...actual].join(", ")}\n`);
      if (!skipLock) checkCreatedBlueprints(result.output, result.catalog, themeTarball);
    } else if (command !== "build") {
      throw new Error("Usage: node scripts/blueprint-artifacts.mjs <build|check> [--output <empty-dir>] [--skip-lock] [--theme-tarball <file>]");
    }
  } finally {
    if (temporaryCheckOutput) fs.rmSync(output, { recursive: true, force: true });
  }
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
