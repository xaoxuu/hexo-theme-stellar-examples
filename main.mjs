#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { emitKeypressEvents } from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const DEFAULT_VERSION = "2.0.0-alpha.1";
const DEFAULT_REPOSITORY = "xaoxuu/hexo-theme-stellar-examples";
const scriptFile = fileURLToPath(import.meta.url);
const scriptRoot = path.dirname(scriptFile);
const repoMarker = path.join(scriptRoot, "blueprints.json");
const isExamplesRepository = fs.existsSync(repoMarker)
  && JSON.parse(fs.readFileSync(repoMarker, "utf8")).repository === DEFAULT_REPOSITORY;

function assertNode22() {
  if (Number(process.versions.node.split(".")[0]) < 22) {
    throw new Error(`Stellar Blueprint requires Node.js 22 or newer, got ${process.version}`);
  }
}

function parseArguments(argv) {
  const result = { command: "", target: "", version: "", blueprint: "", install: null, nonInteractive: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--install") result.install = true;
    else if (argument === "--no-install") result.install = false;
    else if (argument === "--non-interactive") result.nonInteractive = true;
    else if (["--version", "--blueprint"].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      result[argument.slice(2)] = value;
      index += 1;
    } else if (argument.startsWith("--version=")) result.version = argument.slice(10);
    else if (argument.startsWith("--blueprint=")) result.blueprint = argument.slice(12);
    else if (argument.startsWith("--")) throw new Error(`Unknown option: ${argument}`);
    else positional.push(argument);
  }
  result.command = positional[0] || "";
  result.target = positional[1] || "";
  if (positional.length > 2) throw new Error(`Unexpected argument: ${positional[2]}`);
  return result;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function releaseBase(version) {
  return `https://github.com/${DEFAULT_REPOSITORY}/releases/download/v${version}`;
}

async function download(url, label) {
  process.stdout.write(`  下载 ${label}……\n`);
  if (typeof url === "string" && fs.existsSync(path.resolve(url))) return fs.readFileSync(path.resolve(url));
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${label} 下载失败：HTTP ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

function checksumMap(content) {
  const result = new Map();
  for (const line of content.toString("utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/i);
    if (!match) throw new Error(`checksums.txt 包含无效行：${line}`);
    result.set(match[2], match[1].toLowerCase());
  }
  return result;
}

function validateCatalog(catalog, version) {
  if (!catalog || catalog.schema_version !== 1 || catalog.version !== version || !Array.isArray(catalog.blueprints)) {
    throw new Error(`Blueprint catalog 与版本 ${version} 不匹配`);
  }
  const ids = new Set();
  for (const item of catalog.blueprints) {
    if (!item || typeof item.id !== "string" || !/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) {
      throw new Error("Blueprint catalog 包含无效或重复 id");
    }
    if (![item.name, item.description, item.appearance, item.preview, item.archive, item.sha256].every(value => typeof value === "string" && value.length > 0)) {
      throw new Error(`Blueprint ${item.id} 元数据不完整`);
    }
    if (!/^[a-f0-9]{64}$/i.test(item.sha256)) throw new Error(`Blueprint ${item.id} SHA-256 无效`);
    ids.add(item.id);
  }
  if (ids.size === 0) throw new Error("Blueprint catalog 不能为空");
  return catalog;
}

async function loadCatalog(version) {
  const override = process.env.STELLAR_BLUEPRINT_CATALOG;
  const local = override || (isExamplesRepository ? path.join(scriptRoot, "release", version, "catalog.json") : "");
  if (local && fs.existsSync(path.resolve(local))) {
    const catalogFile = path.resolve(local);
    const catalog = validateCatalog(JSON.parse(fs.readFileSync(catalogFile, "utf8")), version);
    return {
      ...catalog,
      blueprints: catalog.blueprints.map(item => ({ ...item, archive: path.join(path.dirname(catalogFile), item.file) }))
    };
  }
  const base = releaseBase(version);
  const checksums = checksumMap(await download(`${base}/checksums.txt`, "版本校验文件"));
  const expected = checksums.get("catalog.json");
  if (!expected) throw new Error("版本校验文件缺少 catalog.json");
  const content = await download(`${base}/catalog.json`, "Blueprint catalog");
  if (sha256(content) !== expected) throw new Error("Blueprint catalog SHA-256 校验失败");
  return validateCatalog(JSON.parse(content.toString("utf8")), version);
}

function tarString(buffer, offset, length) {
  const end = buffer.indexOf(0, offset);
  return buffer.subarray(offset, end >= offset && end < offset + length ? end : offset + length).toString("utf8").trim();
}

function tarNumber(buffer, offset, length) {
  const value = tarString(buffer, offset, length).replace(/\0/g, "").trim();
  return value ? Number.parseInt(value, 8) : 0;
}

function safeArchivePath(value) {
  if (!value || value.includes("\\") || value.split("/").includes("..") || path.posix.isAbsolute(value) || /^[A-Za-z]:/.test(value)) {
    throw new Error(`Blueprint 归档包含不安全路径：${value || "<empty>"}`);
  }
  const normalized = path.posix.normalize(value);
  if (normalized === "." || normalized.startsWith("../")) throw new Error(`Blueprint 归档包含不安全路径：${value}`);
  return normalized;
}

export function extractTarGz(archive, destination) {
  const tar = zlib.gunzipSync(archive);
  let offset = 0;
  let files = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const storedChecksum = tarNumber(header, 148, 8);
    const checksumHeader = Buffer.from(header);
    checksumHeader.fill(0x20, 148, 156);
    const actualChecksum = checksumHeader.reduce((sum, byte) => sum + byte, 0);
    if (storedChecksum !== actualChecksum) throw new Error("Blueprint 归档 header checksum 无效");
    const prefix = tarString(header, 345, 155);
    const name = safeArchivePath([prefix, tarString(header, 0, 100)].filter(Boolean).join("/"));
    const type = String.fromCharCode(header[156] || 0);
    const size = tarNumber(header, 124, 12);
    const contentStart = offset + 512;
    const contentEnd = contentStart + size;
    if (contentEnd > tar.length) throw new Error(`Blueprint 归档文件不完整：${name}`);
    const output = path.resolve(destination, name);
    const root = path.resolve(destination);
    if (!output.startsWith(`${root}${path.sep}`)) throw new Error(`Blueprint 归档路径逃逸：${name}`);
    if (type === "0" || type === "\0") {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, tar.subarray(contentStart, contentEnd), { flag: "wx" });
      files += 1;
    } else if (type === "5") {
      fs.mkdirSync(output, { recursive: true });
    } else {
      throw new Error(`Blueprint 归档包含不支持的条目类型：${name}`);
    }
    offset = contentStart + Math.ceil(size / 512) * 512;
  }
  if (files === 0) throw new Error("Blueprint 归档没有文件");
  return files;
}

function targetState(target) {
  if (!fs.existsSync(target)) return "missing";
  if (!fs.statSync(target).isDirectory()) return "occupied";
  return fs.readdirSync(target).length === 0 ? "empty" : "occupied";
}

function runNpmInstall(target) {
  process.stdout.write("  安装依赖……\n");
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(command, [fs.existsSync(path.join(target, "package-lock.json")) ? "ci" : "install", "--no-audit", "--no-fund"], {
    cwd: target,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    throw new Error(`站点已创建，但依赖安装失败。请进入 ${target} 后重新运行 npm install`);
  }
}

async function createFromSelection({ catalog, blueprint, target, install }) {
  const absoluteTarget = path.resolve(target);
  const state = targetState(absoluteTarget);
  if (state === "occupied") throw new Error(`目标必须不存在或为空目录：${absoluteTarget}`);
  const parent = path.dirname(absoluteTarget);
  fs.mkdirSync(parent, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(parent, ".stellar-create-"));
  const staged = path.join(temporary, "site");
  fs.mkdirSync(staged);
  let moved = false;
  try {
    const archive = await download(blueprint.archive, `${blueprint.name} Blueprint`);
    process.stdout.write("  校验 SHA-256……\n");
    if (sha256(archive) !== blueprint.sha256.toLowerCase()) throw new Error(`${blueprint.id} Blueprint SHA-256 校验失败`);
    process.stdout.write("  解包 Blueprint……\n");
    extractTarGz(archive, staged);
    for (const required of ["package.json", "_config.yml", "_config.stellar.yml"]) {
      if (!fs.existsSync(path.join(staged, required))) throw new Error(`Blueprint 缺少 ${required}`);
    }
    if (targetState(absoluteTarget) === "empty") fs.rmdirSync(absoluteTarget);
    else if (targetState(absoluteTarget) !== "missing") throw new Error(`创建期间目标目录发生变化：${absoluteTarget}`);
    fs.renameSync(staged, absoluteTarget);
    moved = true;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
  if (install) runNpmInstall(absoluteTarget);
  process.stdout.write(["", "Stellar 站点创建完成。", `  cd ${JSON.stringify(path.relative(process.cwd(), absoluteTarget) || ".")}`, install ? "  npm run server" : "  npm install\n  npm run server", ""].join("\n"));
  return { target: absoluteTarget, blueprint: blueprint.id, version: catalog.version, installed: install, moved };
}

function createInput() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

async function ask(input, question, fallback = "") {
  const suffix = fallback ? ` [${fallback}]` : "";
  const value = (await input.question(`${question}${suffix}: `)).trim();
  return value || fallback;
}

async function askKey(question, choices) {
  const allowed = new Set(choices.map(choice => choice.toLowerCase()));
  process.stdout.write(`${question}: `);
  emitKeypressEvents(process.stdin);
  const wasRaw = process.stdin.isRaw;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return await new Promise((resolve, reject) => {
    const finish = value => {
      process.stdin.off("keypress", onKeypress);
      process.stdin.setRawMode(Boolean(wasRaw));
      process.stdin.pause();
      process.stdout.write(`${value}\n`);
      resolve(value);
    };
    const onKeypress = (value, key = {}) => {
      if (key.ctrl && key.name === "c") {
        process.stdin.off("keypress", onKeypress);
        process.stdin.setRawMode(Boolean(wasRaw));
        process.stdin.pause();
        process.stdout.write("\n");
        const error = new Error("已取消");
        error.code = "ABORT_ERR";
        reject(error);
        return;
      }
      const choice = String(value || key.sequence || "").toLowerCase();
      if (allowed.has(choice)) finish(choice);
    };
    process.stdin.on("keypress", onKeypress);
  });
}

function createPrompter(input) {
  if (input) {
    return {
      ask: (question, fallback = "") => ask(input, question, fallback),
      choose: (question, choices, fallback = "") => {
        void choices;
        return ask(input, question, fallback);
      }
    };
  }
  return {
    ask: async (question, fallback = "") => {
      const lineInput = createInput();
      try {
        return await ask(lineInput, question, fallback);
      } finally {
        lineInput.close();
      }
    },
    choose: (question, choices) => askKey(question, choices)
  };
}

async function selectBlueprint(prompt, catalog, requested) {
  if (requested) {
    const blueprint = catalog.blueprints.find(item => item.id === requested);
    if (!blueprint) throw new Error(`未知 Blueprint：${requested}`);
    return blueprint;
  }
  process.stdout.write("\n可用 Blueprint：\n\n");
  catalog.blueprints.forEach((item, index) => {
    process.stdout.write(`  ${index + 1}. ${item.name} · ${item.appearance}\n     ${item.description}\n`);
  });
  const choices = catalog.blueprints.map((_, index) => String(index + 1));
  const choice = Number(await prompt.choose("选择 Blueprint", choices, "1"));
  if (!Number.isInteger(choice) || choice < 1 || choice > catalog.blueprints.length) throw new Error("Blueprint 选项无效");
  return catalog.blueprints[choice - 1];
}

async function createCommand(args, options = {}) {
  if (args.nonInteractive && (!args.blueprint || !args.target)) {
    throw new Error("--non-interactive 必须同时提供目标目录和 --blueprint");
  }
  const prompt = args.nonInteractive ? null : createPrompter(options.input);
  const version = args.version || (prompt ? await prompt.ask("版本", DEFAULT_VERSION) : DEFAULT_VERSION);
  const catalog = await loadCatalog(version);
  const blueprint = await selectBlueprint(prompt, catalog, args.blueprint);
  const target = args.target || await prompt.ask("项目目录", `stellar-${blueprint.id}`);
  const install = args.install == null
    ? (prompt ? /^y$/i.test(await prompt.choose("创建后安装依赖？(y/n)", ["y", "n"], "y")) : true)
    : args.install;
  process.stdout.write(["", "创建计划：", `  Blueprint  ${blueprint.name} (${blueprint.id})`, `  外观       ${blueprint.appearance}`, `  版本       ${catalog.version}`, `  目标       ${path.resolve(target)}`, `  安装依赖   ${install ? "是" : "否"}`, ""].join("\n"));
  if (prompt) {
    const confirmed = await prompt.choose("开始创建？(y/n)", ["y", "n"], "n");
    if (!/^y$/i.test(confirmed)) {
      process.stdout.write("已取消，未写入文件。\n");
      return null;
    }
  }
  return await createFromSelection({ catalog, blueprint, target, install });
}

function maintenanceCommand(args, options = {}) {
  const result = spawnSync(process.execPath, [path.join(scriptRoot, "scripts", "examples.mjs"), ...args], {
    cwd: scriptRoot,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: options.capture ? "utf8" : undefined
  });
  if (result.status !== 0) throw new Error(`examples.mjs ${args.join(" ")} failed`);
}

async function startLocalPreviews() {
  const child = spawn(process.execPath, [path.join(scriptRoot, "scripts", "examples.mjs"), "start-all"], { cwd: scriptRoot, stdio: "inherit" });
  const wasRaw = process.stdin.isRaw;
  const stopOnZero = input => {
    const value = input.toString();
    if ((value.includes("0") || value.includes("\u0003")) && child.exitCode === null) child.kill("SIGINT");
  };
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", stopOnZero);
  try {
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => code === 0 || code === 130 || code === 143 || signal === "SIGINT" || signal === "SIGTERM"
        ? resolve()
        : reject(new Error(`本地预览异常退出：${code ?? signal}`)));
    });
  } finally {
    process.stdin.off("data", stopOnZero);
    process.stdin.setRawMode(Boolean(wasRaw));
    process.stdin.pause();
  }
}

async function interactiveMenu() {
  while (true) {
    process.stdout.write(`\n欢迎使用 Stellar\n\n  1. 创建新站点\n${isExamplesRepository ? "  2. 安装示例依赖\n  3. 预览本地示例\n  4. 清除示例缓存\n" : ""}\n`);
    const choice = await askKey("请选择操作", isExamplesRepository ? ["1", "2", "3", "4"] : ["1"]);
    if (choice === "1") {
      await createCommand(parseArguments(["create"]));
      return;
    }
    if (choice === "2" && isExamplesRepository) {
      const command = process.platform === "win32" ? "npm.cmd" : "npm";
      const result = spawnSync(command, ["install"], { cwd: scriptRoot, stdio: "inherit" });
      if (result.status !== 0) throw new Error("依赖安装失败");
    } else if (choice === "3" && isExamplesRepository) await startLocalPreviews();
    else if (choice === "4" && isExamplesRepository) maintenanceCommand(["clean"]);
    else process.stdout.write(`无效选项：${choice}\n`);
  }
}

async function main() {
  assertNode22();
  if (process.argv.slice(2).some(argument => argument === "--help" || argument === "-h")) {
    process.stdout.write("Usage: node main.mjs [create <target> --blueprint <id> --version <version> --install|--no-install --non-interactive]\n");
    return;
  }
  const args = parseArguments(process.argv.slice(2));
  if (!args.command) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("交互式 CLI 需要终端；自动化请使用 create --non-interactive");
    await interactiveMenu();
  } else if (args.command === "create") await createCommand(args);
  else throw new Error("Usage: node main.mjs [create <target> --blueprint <id> --version <version> --install|--no-install --non-interactive]");
}

const entryFile = process.argv[1] ? fs.realpathSync(process.argv[1]) : "";
if (entryFile === fs.realpathSync(scriptFile)) {
  main().catch(error => {
    if (error.code === "ABORT_ERR") {
      process.exitCode = 130;
      return;
    }
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}

export { createCommand, createFromSelection, loadCatalog, parseArguments, safeArchivePath, validateCatalog };
