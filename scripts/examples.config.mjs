import fs from "node:fs";

const blueprintManifest = JSON.parse(fs.readFileSync(new URL("../blueprints.json", import.meta.url), "utf8"));
const metadata = new Map(blueprintManifest.blueprints.map(blueprint => [blueprint.id, blueprint]));

export const repositoryName = "hexo-theme-stellar-examples";
export const pagesBase = `/${repositoryName}/`;
export const themeCandidate = "9714968ece8ff6e328423dbb40c72b7c5796273d";
export const themeSpec = blueprintManifest.theme.spec;
export { blueprintManifest };

export const sites = Object.freeze([
  Object.freeze({
    id: "lightblog",
    name: "留白",
    type: "单栏极简风博客",
    tagline: "留一处安静的写作空间",
    blueprint: "lightblog",
    style: "flat",
    port: 4001,
    path: "/lightblog/",
    expectedFiles: [
      "index.html",
      "posts/a-quiet-place-to-write/index.html",
      "posts/reading-in-the-morning/index.html",
      "search.json"
    ],
    expectedMarkers: ["留白", "单栏极简风博客", "留一处安静的写作空间"],
    forbiddenMarkers: ["default:bookmark"],
    forbiddenFiles: ["archives/index.html", "categories/index.html", "tags/index.html", "topic/index.html", "wiki/index.html"],
    ...metadata.get("lightblog")
  }),
  Object.freeze({
    id: "blog",
    name: "星迹",
    type: "经典侧边栏卡片博客",
    tagline: "记录技术、阅读与生活的轨迹",
    blueprint: "blog",
    style: "card",
    port: 4002,
    path: "/blog/",
    expectedFiles: [
      "index.html",
      "archives/index.html",
      "categories/index.html",
      "tags/index.html",
      "topic/index.html",
      "posts/welcome-to-xingji/index.html",
      "posts/independent-blog-first-week/index.html",
      "search.json"
    ],
    expectedMarkers: ["星迹", "经典侧边栏卡片博客", "独立博客实践", "color-scheme-switch"],
    forbiddenMarkers: [],
    forbiddenFiles: ["wiki/index.html", "notebooks/index.html"],
    ...metadata.get("blog")
  }),
  Object.freeze({
    id: "knowledge",
    name: "个人知识库",
    type: "内容聚合型知识博客",
    tagline: "记录、连接并重新发现知识",
    blueprint: "knowledge",
    style: "glass",
    port: 4003,
    path: "/knowledge/",
    expectedFiles: [
      "index.html",
      "page/2/index.html",
      "archives/index.html",
      "categories/index.html",
      "tags/index.html",
      "topic/index.html",
      "posts/system-thinking/index.html",
      "wiki/index.html",
      "wiki/knowledge-management/index.html",
      "wiki/knowledge-management/capture/index.html",
      "wiki/knowledge-management/organize/index.html",
      "wiki/knowledge-management/review/index.html",
      "wiki/site-handbook/index.html",
      "wiki/site-handbook/content/index.html",
      "wiki/site-handbook/navigation/index.html",
      "wiki/site-handbook/publishing/index.html",
      "search.json"
    ],
    expectedMarkers: ["个人知识库", "从这里开始整理知识", "系统化整理", "个人知识管理", "Stellar 建站手册"],
    forbiddenMarkers: ["default:archive", "default:folder", "default:tag", "default:book"],
    forbiddenFiles: [],
    ...metadata.get("knowledge")
  }),
  Object.freeze({
    id: "docs",
    name: "项目文档",
    type: "单项目 Wiki 文档站",
    tagline: "从安装到配置的完整使用旅程",
    blueprint: "docs",
    style: "card",
    port: 4004,
    path: "/docs/",
    expectedFiles: [
      "index.html",
      "build-this-site/index.html",
      "examples/index.html",
      "releases/index.html",
      "articles/index.html",
      "todo/index.html",
      "contributors/index.html",
      "search.json"
    ],
    expectedMarkers: ["项目文档", "开启您全新的博客之旅", "Demo 文档示例", "社区支持", "复刻这个单项目站点", "使用 Stellar 主题的博客", "更新日志与注意事项", "探索号 🛰️ 文章分享", "项目进度和近期计划", "开发者和社区支持"],
    expectedIndexMarkers: ["开启您全新的博客之旅", "galaxy", "npm i hexo-theme-stellar", "/examples/"],
    expectedSidebarGroups: [
      { title: "快速开始", count: 3 },
      { title: "Demo 文档示例", count: 1 },
      { title: "写作与维护", count: 4 },
      { title: "社区支持", count: 3 }
    ],
    forbiddenMarkers: ["default:book"],
    forbiddenFiles: ["archives/index.html", "categories/index.html", "tags/index.html", "topic/index.html", "wiki/index.html", "wiki/stellar/index.html", "wiki/stellar/build-this-site/index.html", "wiki/stellar/examples/index.html", "wiki/stellar/releases/index.html", "wiki/stellar/articles/index.html", "wiki/stellar/todo/index.html", "wiki/stellar/contributors/index.html", "page/2/index.html"],
    ...metadata.get("docs")
  })
]);
