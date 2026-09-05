import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import { after, before, test } from "node:test";

import { buildArtifacts } from "../scripts/blueprint-artifacts.mjs";
import { clearCache } from "../scripts/examples.mjs";
import { createCommand, createFromSelection, loadCatalog, parseArguments, safeArchivePath, validateCatalog } from "../main.mjs";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "stellar-blueprint-tests-"));
const release = path.join(temporary, "release");
let catalog;

before(() => {
  catalog = buildArtifacts({ output: release }).catalog;
});

after(() => {
  fs.rmSync(temporary, { recursive: true, force: true });
});

test("CLI 参数同时支持交互默认值和非交互创建", () => {
  assert.deepEqual(parseArguments(["create", "my-site", "--blueprint", "blog", "--no-install", "--non-interactive"]), {
    command: "create",
    target: "my-site",
    version: "",
    blueprint: "blog",
    install: false,
    nonInteractive: true
  });
  assert.throws(() => parseArguments(["create", "site", "--force"]), /Unknown option/);
});

test("catalog 拒绝版本漂移与重复 Blueprint", () => {
  assert.equal(validateCatalog(catalog, catalog.version), catalog);
  assert.throws(() => validateCatalog(catalog, "0.0.0"), /版本/);
  assert.throws(() => validateCatalog({ ...catalog, blueprints: [catalog.blueprints[0], catalog.blueprints[0]] }, catalog.version), /重复 id/);
});

test("归档路径拒绝绝对路径、父目录与 Windows 路径", () => {
  for (const value of ["../escape", "/escape", "C:/escape", "source\\escape.md"]) {
    assert.throws(() => safeArchivePath(value), /不安全路径/);
  }
  assert.equal(safeArchivePath("source/_posts/hello.md"), "source/_posts/hello.md");
});

test("非交互 CLI 从本地版本制品创建单个完整站点", () => {
  const target = path.join(temporary, "created-blog");
  fs.mkdirSync(target);
  const result = spawnSync(process.execPath, [
    path.resolve("main.mjs"), "create", target,
    "--blueprint", "blog",
    "--version", catalog.version,
    "--no-install",
    "--non-interactive"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8",
    env: { ...process.env, STELLAR_BLUEPRINT_CATALOG: path.join(release, "catalog.json") }
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  for (const relative of ["package.json", "package-lock.json", "_config.yml", "_config.stellar.yml", "source/_posts/welcome-to-xingji.md"]) {
    assert.equal(fs.existsSync(path.join(target, relative)), true, relative);
  }
  assert.match(fs.readFileSync(path.join(target, "_config.yml"), "utf8"), /root: \/\n/);

  const conflict = spawnSync(process.execPath, [
    path.resolve("main.mjs"), "create", target,
    "--blueprint", "blog", "--version", catalog.version,
    "--no-install", "--non-interactive"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8",
    env: { ...process.env, STELLAR_BLUEPRINT_CATALOG: path.join(release, "catalog.json") }
  });
  assert.notEqual(conflict.status, 0);
  assert.match(conflict.stderr, /不存在或为空目录/);
});

test("交互创建在最终确认取消后不写入目标", async () => {
  const target = path.join(temporary, "cancelled-site");
  const answers = [catalog.version, "1", target, "N", "N"];
  const input = { question: async () => answers.shift(), close: () => assert.fail("injected input must not be closed") };
  const previous = process.env.STELLAR_BLUEPRINT_CATALOG;
  process.env.STELLAR_BLUEPRINT_CATALOG = path.join(release, "catalog.json");
  try {
    assert.equal(await createCommand(parseArguments(["create"]), { input }), null);
  } finally {
    if (previous == null) delete process.env.STELLAR_BLUEPRINT_CATALOG;
    else process.env.STELLAR_BLUEPRINT_CATALOG = previous;
  }
  assert.equal(fs.existsSync(target), false);
});

test("错误版本与下载失败都不会创建目标", async () => {
  const previous = process.env.STELLAR_BLUEPRINT_CATALOG;
  process.env.STELLAR_BLUEPRINT_CATALOG = path.join(release, "catalog.json");
  try {
    await assert.rejects(loadCatalog("0.0.0"), /版本/);
  } finally {
    if (previous == null) delete process.env.STELLAR_BLUEPRINT_CATALOG;
    else process.env.STELLAR_BLUEPRINT_CATALOG = previous;
  }
  const target = path.join(temporary, "download-failed");
  const blueprint = { ...catalog.blueprints[0], archive: "http://127.0.0.1:1/missing.tar.gz" };
  await assert.rejects(createFromSelection({ catalog, blueprint, target, install: false }), /fetch failed|下载失败/);
  assert.equal(fs.existsSync(target), false);
});

test("校验通过但内容非法的归档仍被拒绝", async () => {
  const archiveFile = path.join(temporary, "empty.tar.gz");
  const archive = zlib.gzipSync(Buffer.alloc(1024));
  fs.writeFileSync(archiveFile, archive);
  const blueprint = { ...catalog.blueprints[0], archive: archiveFile, sha256: crypto.createHash("sha256").update(archive).digest("hex") };
  const target = path.join(temporary, "invalid-archive");
  await assert.rejects(createFromSelection({ catalog, blueprint, target, install: false }), /没有文件/);
  assert.equal(fs.existsSync(target), false);
});

test("创建器在错误 SHA-256 时不留下目标目录", async () => {
  const blueprint = { ...catalog.blueprints[0], archive: path.join(release, catalog.blueprints[0].file), sha256: "0".repeat(64) };
  const target = path.join(temporary, "corrupt-target");
  await assert.rejects(
    createFromSelection({ catalog, blueprint, target, install: false }),
    /SHA-256 校验失败/
  );
  assert.equal(fs.existsSync(target), false);
});

test("维护命令清理全部缓存或单站开发缓存", () => {
  const cache = path.join(temporary, "maintenance-cache");
  fs.mkdirSync(cache);
  fs.writeFileSync(path.join(cache, "development-blog.yml"), "root: /\n");
  fs.writeFileSync(path.join(cache, "development-docs.yml"), "root: /\n");
  fs.mkdirSync(path.join(cache, "multiconfig", "blog"), { recursive: true });
  fs.mkdirSync(path.join(cache, "multiconfig", "docs"), { recursive: true });
  clearCache(cache, "blog");
  assert.equal(fs.existsSync(path.join(cache, "development-blog.yml")), false);
  assert.equal(fs.existsSync(path.join(cache, "multiconfig", "blog")), false);
  assert.equal(fs.existsSync(path.join(cache, "development-docs.yml")), true);
  assert.equal(fs.existsSync(path.join(cache, "multiconfig", "docs")), true);
  clearCache(cache, "");
  assert.equal(fs.existsSync(cache), false);
});

test("多配置命令不在示例目录残留 _multiconfig.yml", () => {
  const site = path.resolve("case1-lightblog");
  const generated = path.join(site, "_multiconfig.yml");
  fs.rmSync(generated, { force: true });
  try {
    const result = spawnSync(process.execPath, [
      path.resolve("scripts/examples.mjs"), "doctor", "--site", "lightblog"
    ], {
      cwd: path.resolve("."),
      encoding: "utf8"
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.equal(fs.existsSync(generated), false);
  } finally {
    fs.rmSync(generated, { force: true });
  }
});
