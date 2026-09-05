---
title: 复刻这个单项目站点
collection:
  profile: wiki
  id: stellar
permalink: /build-this-site/
---

这个示例把一个 Wiki 项目直接放在站点根路径：访问 `/` 就进入项目首页，文档页使用 `/build-this-site/`、`/examples/` 等顶级地址，不经过 `/wiki/` 列表页。

下面从一个空目录开始，复刻与当前 Blueprint 相同的结构、Hero 和导航。

## 准备项目

Node.js 需要 22 或更高版本。创建目录并安装 Hexo、Stellar 及示例所需依赖：

```bash
mkdir my-project-docs
cd my-project-docs
npm init -y
npm install hexo@8.1.2 hexo-front-matter@4.2.1 hexo-renderer-marked@7.0.1 hexo-server@3.0.0 hexo-util@4.0.0 hexo-theme-stellar
```

在 `package.json` 中加入常用命令：

```json
{
  "scripts": {
    "clean": "hexo clean",
    "build": "hexo generate",
    "server": "hexo server",
    "doctor": "hexo stellar doctor"
  }
}
```

完成后的核心目录如下：

```text
my-project-docs/
├── _config.yml
├── _config.stellar.yml
├── package.json
└── source/
    ├── _data/
    │   ├── wiki.yml
    │   └── wiki/
    │       └── stellar.yml
    └── wiki/
        └── stellar/
            ├── index.md
            ├── build-this-site.md
            ├── examples.md
            └── releases.md
```

## 配置 Hexo

在站点根目录创建 `_config.yml`。部署地址按自己的域名填写；本地或部署在域名根路径时，`root` 使用 `/`：

```yaml
title: 项目文档
description: 单项目 Wiki 文档站
theme: stellar
url: https://docs.example.com
root: /
permalink: pages/:title/

language: zh-CN
timezone: Asia/Shanghai
source_dir: source
public_dir: public
```

如果部署到子路径，例如 `https://example.com/docs/`，应同时修改：

```yaml
url: https://example.com/docs
root: /docs/
```

{% note 路径必须成对配置 `url` 和 `root` 必须与实际部署位置一致；本仓库的在线示例使用 `/hexo-theme-stellar-examples/docs/`，下载 Blueprint 后则默认使用 `/`。 %}

## 配置站点 Brand 与页面入口

创建 `_config.stellar.yml`，让 Topbar 拥有独立的 Brand 与菜单：

```yaml
topbar:
  brand:
    name: 项目文档
    tagline: 从安装到配置的完整使用旅程
  menu:
    - type: search
    - id: wiki
      title: 文档
      icon: default:documents
      url: /
      accent: '#1BCDFC'
```

接着指定单项目站点的页面行为。`wiki_index.path: null` 关闭默认 Wiki 列表页；进入文档页后启用 Topbar，Brand 会自动显示在固定槽位中：

```yaml
profiles:
  wiki_index:
    path: null
  wiki:
    active_menu: wiki
    topbar:
      enabled: true
      widgets:
        - spacer
        - menu
        - settings
```

## 注册唯一的 Wiki 项目

创建 `source/_data/wiki.yml`，这里只登记一个项目：

```yaml
- stellar
```

然后创建 `source/_data/wiki/stellar.yml`。`route.path: /` 是单项目根路径的关键配置；Hero、终端预览和分组导航也都在这里定义：

```yaml
name: Stellar
headline: 每个人的独立博客
tagline: 基于 Hexo 的全能型个人知识库
tags:
  - 博客主题
audience: 独立博主
icon: https://res.xaox.cc/posts/20260820232643597.webp-hd
cover: https://res.xaox.cc/posts/20260820225153501.png-hd
hero:
  enabled: true
  background:
    effect:
      type: galaxy
      options: {}
  preview:
    type: terminal
    commands:
      - label: npm
        codes: |
          npm i hexo-theme-stellar
          npx hexo config theme stellar
      - label: pnpm
        codes: |
          pnpm add hexo-theme-stellar
          pnpm exec hexo config theme stellar
  actions:
    - title: 在线演示
      url: /examples/
      icon: default:monitor
description: Stellar 是一个内置文档系统的简约商务风 Hexo 主题，支持丰富的标签和动态数据组件。
source:
  repository: xaoxuu/hexo-theme-stellar
route:
  path: /
navigation:
  tree:
    快速开始:
      - /
      - /examples/
      - /releases/
    Demo 文档示例:
      - /build-this-site/
    写作与维护:
      - /authoring-guide/
      - /content-components/
      - /navigation-guide/
      - /publishing-checklist/
    社区支持:
      - /articles/
      - /todo/
      - /contributors/
```

## 创建文档页面

文档放在 `source/wiki/stellar/`。每页通过 `collection.id` 加入刚才注册的 Wiki 项目，并显式指定顶级路由：

```yaml
---
title: 复刻这个单项目站点
collection:
  profile: wiki
  id: stellar
permalink: /build-this-site/
---
```

项目首页同样是一篇 Wiki 文档，但固定使用根路径：

```yaml
---
title: 开启您全新的博客之旅
collection:
  profile: wiki
  id: stellar
permalink: /
---
```

根路由文档站的页面路径带有前导 `/`，因此导航树也使用 `/build-this-site/`、`/examples/` 和 `/releases/` 这样的绝对路径，才能保留配置中的分组。新增页面时，同时把完整页面路径加入 `navigation.tree`。

“写作与维护”分组的四篇页面也使用相同的元数据结构，地址分别为 `/authoring-guide/`、`/content-components/`、`/navigation-guide/` 和 `/publishing-checklist/`。从零创建站点时，为导航中的每个地址创建对应页面；下载 docs Blueprint 则已经包含这些内容。

## 检查并启动

先让 Stellar 检查配置与内容关系，再生成站点：

```bash
npm run doctor
npm run build
```

两项都通过后启动本地服务：

```bash
npm run server
```

打开 `http://localhost:4000/`，应当直接看到带 Galaxy Hero 的项目首页；访问 `/build-this-site/` 时，左侧显示完整文档树。生成结果中不应出现 `/wiki/` 或 `/wiki/stellar/` 列表路由。

{% note 下一步 可以直接下载 `docs` Blueprint 获得完整文件，再替换项目名称、Hero 内容、导航树和正文。 %}
