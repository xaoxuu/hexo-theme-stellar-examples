# Stellar examples and Blueprints

[English](README_EN.md) · [简体中文](README.md)

Stellar can be a quiet writing space or grow into a personal knowledge base. This repository maintains a growing collection of runnable Hexo sites with real content and generates Blueprints from the same sources. [`blueprints.json`](blueprints.json) is the catalog of available examples.

## Pick the site closest to what you want

| Directory / Blueprint | Start here when you want… | Preview |
| --- | --- | --- |
| [`case1-lightblog`](case1-lightblog/) / `lightblog` | A quiet home for essays without a permanent sidebar | [Light Blog](https://xaoxuu.github.io/hexo-theme-stellar-examples/lightblog/) |
| [`case2-blog`](case2-blog/) / `blog` | A classic blog with categories, tags, and series | [Blog](https://xaoxuu.github.io/hexo-theme-stellar-examples/blog/) |
| [`case3-knowledge`](case3-knowledge/) / `knowledge` | Articles and long-lived knowledge in the same site | [Knowledge](https://xaoxuu.github.io/hexo-theme-stellar-examples/knowledge/) |
| [`case4-docs`](case4-docs/) / `docs` | Documentation for one project | [Docs](https://xaoxuu.github.io/hexo-theme-stellar-examples/docs/) |

If you are unsure, choose `lightblog`. It gives you the smallest useful Stellar site and leaves the other systems for later.

## Run one locally

You need Node.js 22 or newer:

```bash
git clone https://github.com/xaoxuu/hexo-theme-stellar-examples.git
cd hexo-theme-stellar-examples
npm ci
npm run dev -- --site lightblog
```

To open another site, replace `lightblog` with its Blueprint ID from [`blueprints.json`](blueprints.json). Each example uses its own port, so multiple sites can run at the same time.

Each case directory has a short guide to the result, the files worth editing first, and the command used to run it.

## Create a copy from a Blueprint

The Blueprint creator previews its plan and refuses to overwrite an occupied directory. There is no public examples Release yet, so this README does not advertise a remote one-line installer.

To try the creator from a clone of this repository:

```bash
npm run artifacts
node main.mjs create my-site --blueprint lightblog
```

## Check every registered site

```bash
npm run doctor
npm run build
npm run check:outputs
npm run check:blueprints
npm run check
```

The check commands discover every site registered in the catalog and validate the generated Blueprint artifacts. All cases are pinned to the same Stellar candidate. Read [`blueprints.json`](blueprints.json) and the site package files for the exact commit; do not infer a published version from the repository version string.
