# Stellar 的四种起点

[简体中文](README.md) · [English](README_EN.md)

Stellar 可以只是一个安静的博客，也可以慢慢长成个人知识库。这里放了四个能真正运行的站点，不是只用来截图的空壳。

![Stellar 的轻博客、经典博客、个人知识库和项目文档](https://xaoxuu.com/wiki/stellar/assets/screenshots/v2/stellar-four-sites.webp)

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

也可以把 `lightblog` 换成 `blog`、`knowledge` 或 `docs`。四个站点使用不同端口，不会互相覆盖。

## 这些示例值得看什么

- `lightblog` 展示单栏阅读、顶部导航和偏长的中文文章。
- `blog` 展示经典侧栏、分类、标签、专栏和连续发布的内容。
- `knowledge` 把博客文章与两套 Wiki 放在一起，方便比较两种内容组织方式。
- `docs` 只有一套项目文档，首页、目录、内容组件和发布清单都围绕同一个项目。

每个目录都有自己的说明，列出最值得修改的配置和内容文件。

## 从示例创建一份副本

Blueprint 创建器会检查目标目录、展示完整计划并拒绝覆盖已有文件。目前还没有公开 Release，所以不要使用 README 之外流传的一键下载地址。

在本仓库中体验创建流程，可以先生成本地制品：

```bash
npm run artifacts
node main.mjs create my-site --blueprint lightblog
```

创建完成后进入 `my-site`，按终端提示安装依赖并启动。正式公开下载要等仓库 Release 中真的出现对应 catalog、校验文件和 Blueprint 归档。

## 仓库命令

```bash
npm run doctor
npm run build
npm run check:outputs
npm run check:blueprints
npm run check
```

`npm run check` 会验证四个站点和 Blueprint 制品。主题候选包的专项验收仍可使用：

```bash
node scripts/blueprint-artifacts.mjs check --theme-tarball /absolute/path/to/hexo-theme-stellar.tgz
```

这个参数只影响临时验收站点，不会改写仓库里的主题版本。

## 版本说明

四个示例当前锁定同一个 Stellar 候选 commit，具体值以 [`blueprints.json`](blueprints.json) 和各站点 `package.json` 为准。Beta、RC 或稳定版是否发布，要看主题与示例仓库的实际 Release，不能从目录名推断。
