# Stellar 示例站与 Blueprints

[简体中文](README.md) · [English](README_EN.md)

Stellar 可以只是一个安静的博客，也可以慢慢长成个人知识库。这个仓库维护一组包含真实内容、可以直接运行的 Hexo 示例站，并从同一份来源生成 Blueprints。可用示例以 [`blueprints.json`](blueprints.json) 为准。

## 先选一个最像你的

| 目录 / Blueprint | 适合你，如果…… | 打开看看 |
| --- | --- | --- |
| [`case1-lightblog`](case1-lightblog/) / `lightblog` | 只想安静写文章，不需要常驻侧栏 | [留白](https://xaoxuu.github.io/hexo-theme-stellar-examples/lightblog/) |
| [`case2-blog`](case2-blog/) / `blog` | 喜欢经典博客，想保留分类、标签和专栏 | [星迹](https://xaoxuu.github.io/hexo-theme-stellar-examples/blog/) |
| [`case3-knowledge`](case3-knowledge/) / `knowledge` | 想把文章、项目资料和长期主题放在一起 | [个人知识库](https://xaoxuu.github.io/hexo-theme-stellar-examples/knowledge/) |
| [`case4-docs`](case4-docs/) / `docs` | 正在给一个项目维护完整文档 | [项目文档](https://xaoxuu.github.io/hexo-theme-stellar-examples/docs/) |

拿不准时从 `lightblog` 开始。它保留写作和阅读需要的部分，其它能力等以后真的用到再加。

## 在本地打开

准备 Node.js 22 或更高版本，然后克隆仓库并安装一次依赖：

```bash
git clone https://github.com/xaoxuu/hexo-theme-stellar-examples.git
cd hexo-theme-stellar-examples
npm ci
```

打开轻博客：

```bash
npm run dev -- --site lightblog
```

要打开其它站点，把 `lightblog` 换成 [`blueprints.json`](blueprints.json) 中对应的 Blueprint ID。各示例使用独立端口，可以同时运行。

## 这些示例值得看什么

- `lightblog` 展示单栏阅读、顶部导航和偏长的中文文章。
- `blog` 展示经典侧栏、分类、标签、专栏和连续发布的内容。
- `knowledge` 把博客文章与两套 Wiki 放在一起，方便比较两种内容组织方式。
- `docs` 只有一套项目文档，首页、目录、内容组件和发布清单都围绕同一个项目。

每个目录都有自己的说明，列出最值得修改的配置和内容文件。

## 从示例创建一份副本

Blueprint 创建器会检查目标目录、展示完整计划并拒绝覆盖已有文件。当前可以直接从 main 分支启动创建器，不依赖尚未发布的 Release：

```bash
curl -fsSL https://github.com/xaoxuu/hexo-theme-stellar-examples/raw/main/install.sh | sh -s -- create my-site --blueprint=lightblog --non-interactive
```

命令需要 Node.js 22+、Git 和 npm；创建器会在临时目录生成并校验蓝图制品，完成后自动清理。

在本仓库中体验创建流程，可以先生成本地制品：

```bash
npm run artifacts
node main.mjs create my-site --blueprint lightblog
```

创建完成后进入 `my-site`，按终端提示启动站点。

## 仓库命令

```bash
npm run doctor
npm run build
npm run check:outputs
npm run check:blueprints
npm run check
```

`npm run check` 会验证清单中登记的全部站点和 Blueprint 制品。主题候选包的专项验收仍可使用：

```bash
node scripts/blueprint-artifacts.mjs check --theme-tarball /absolute/path/to/hexo-theme-stellar.tgz
```

这个参数只影响临时验收站点，不会改写仓库里的主题版本。

## 版本说明

仓库中的示例锁定同一个 Stellar 候选 commit，具体值以 [`blueprints.json`](blueprints.json) 和各站点 `package.json` 为准。Beta、RC 或稳定版是否发布，要看主题与示例仓库的实际 Release，不能从目录名推断。
