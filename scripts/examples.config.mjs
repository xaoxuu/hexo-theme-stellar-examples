import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const blueprintManifest = JSON.parse(fs.readFileSync(new URL("../blueprints.json", import.meta.url), "utf8"));
const metadata = new Map(blueprintManifest.blueprints.map(blueprint => [blueprint.id, blueprint]));

// 仓库身份只在 blueprints.json 的 repository 里写一次。
export const repositoryName = blueprintManifest.repository.split("/").pop();
export const pagesBase = `/${repositoryName}/`;
export const themeSpec = blueprintManifest.theme.spec;
// 主题 commit 直接从 spec 里读，避免和锁定版本各写一份而对不上。
export const themeCandidate = themeSpec.match(/[a-f0-9]{40}/)?.[0] || themeSpec;
// Node 最低版本只在 package.json engines 里写一次，脚本与制品都读它。
export const nodeEngine = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).engines.node;
export { blueprintManifest };

// 示例站的类型、标语与外观只写在站点自己的配置里，这里按蓝图 id 读出来。
// 调整示例的样式或文案时只改对应的示例站目录，不需要再同步任何清单。
export function configValue(source, file, trail, fallback = "") {
  const stack = [];
  for (const line of fs.readFileSync(path.join(root, source, file), "utf8").split(/\r?\n/)) {
    const match = line.match(/^(\s*)([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) continue;
    const [, spaces, key, raw = ""] = match;
    while (stack.length > 0 && stack[stack.length - 1].indent >= spaces.length) stack.pop();
    const keys = [...stack.map(entry => entry.key), key];
    const value = raw.trim().replace(/^["']|["']$/g, "");
    // "*" 匹配任意一层键，用来读 topbar 或 leftbar 下的 brand 块。
    if (!value) stack.push({ indent: spaces.length, key });
    else if (keys.length === trail.length && trail.every((segment, index) => segment === "*" || segment === keys[index])) return value;
  }
  if (fallback) return fallback;
  throw new Error(`${source}/${file} 缺少 ${trail.join(".")}`);
}

function siteFacts(source) {
  const preset = configValue(source, "_config.stellar.yml", ["appearance", "preset"], "card");
  return {
    // 站点描述即该蓝图演示的产品场景。
    type: configValue(source, "_config.yml", ["description"]),
    tagline: configValue(source, "_config.stellar.yml", ["*", "brand", "tagline"]),
    // 外观取自示例站自己的 appearance.preset；未声明时按主题默认的 card。
    appearance: preset.charAt(0).toUpperCase() + preset.slice(1)
  };
}

function site(id, extras) {
  const blueprint = metadata.get(id);
  if (!blueprint) throw new Error(`blueprints.json 里没有 ${id}`);
  return Object.freeze({ id, ...blueprint, ...siteFacts(blueprint.source), ...extras });
}

export const sites = Object.freeze([
  site("lightblog", {
    port: 4011,
    expectedFiles: [
      "index.html",
      "posts/a-quiet-place-to-write/index.html",
      "posts/reading-in-the-morning/index.html",
      "search.json"
    ],
    expectedMarkers: ["留白", "单栏极简风博客", "留一处安静的写作空间"],
    expectedFooterSections: [
      { title: "开始阅读", items: ["最近文章", "留一处安静的写作空间"] },
      { title: "生活随笔", items: ["给星期天留半天空白", "雨停以后，绕一条远路回家", "一张书桌，只放这个季节的东西"] },
      { title: "阅读与笔记", items: ["清晨阅读札记", "把读书笔记写在问题旁边"] }
    ],
    forbiddenMarkers: ["default:bookmark"],
    forbiddenFiles: ["archives/index.html", "categories/index.html", "tags/index.html", "topic/index.html", "wiki/index.html"]
  }),
  site("minimalblog", {
    port: 4012,
    expectedFiles: [
      "index.html",
      "archives/index.html",
      "categories/index.html",
      "tags/index.html",
      "topic/index.html",
      "posts/one-paragraph-before-the-title/index.html",
      "posts/a-reusable-publishing-checklist/index.html",
      "search.json"
    ],
    expectedMarkers: ["素页", "极简侧栏写作博客", "把注意力留给文字本身", "color-scheme-switch"],
    expectedFooterSections: [
      { title: "浏览素页", items: ["最近文章", "内容归档"] },
      { title: "分类查找", items: ["分类", "标签", "专栏"] },
      { title: "联系与关于", items: ["关于", "友链"] }
    ],
    forbiddenMarkers: [],
    forbiddenFiles: ["wiki/index.html", "notebooks/index.html"]
  }),
  site("notebook", {
    port: 4041,
    expectedFiles: [
      "index.html",
      "archives/index.html",
      "tags/index.html",
      "notebooks/index.html",
      "notebooks/reading/index.html",
      "notebooks/dev/index.html",
      "notebooks/life/index.html",
      "posts/welcome-to-suiji/index.html",
      "search.json"
    ],
    expectedMarkers: ["随记", "笔记优先的个人笔记本", "读书笔记", "开发随记", "生活观察"],
    expectedFooterSections: [
      { title: "浏览笔记本", items: ["全部笔记本", "读书笔记", "开发随记", "生活观察"] },
      { title: "最近更新", items: ["近况", "内容归档"] }
    ],
    forbiddenMarkers: [],
    forbiddenFiles: ["wiki/index.html", "topic/index.html"]
  }),
  site("knowledge", {
    port: 4021,
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
    expectedFooterSections: [
      { title: "浏览知识库", items: ["最近文章", "知识库目录", "内容归档"] },
      { title: "知识管理专题", items: ["个人知识管理入门", "收集材料时保留上下文", "将材料整理成独立笔记", "让回访产生一个实际结果"] },
      { title: "建站手册专题", items: ["Stellar 建站手册导读", "组织博客与 Wiki 文档", "为知识库建立导航", "检查与预览你的站点"] },
      { title: "分类查找", items: ["分类", "标签", "专栏"] }
    ],
    forbiddenMarkers: ["default:archive", "default:folder", "default:tag", "default:book"],
    forbiddenFiles: []
  }),
  site("docs", {
    port: 4031,
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
    expectedFooterSections: [
      { title: "浏览文档", items: ["文档首页", "使用 Stellar 主题的博客", "更新日志与注意事项", "复刻本站"] },
      { title: "写作与维护", items: ["写好第一篇使用指南", "用标签组件组织复杂说明", "文档导航与页面地址", "发布前，把文档走一遍"] },
      { title: "社区支持", items: ["探索号 🛰️ 文章分享", "项目进度和近期计划", "开发者和社区支持"] }
    ],
    expectedIndexMarkers: ["开启您全新的博客之旅", "galaxy", "npm i hexo-theme-stellar", "/examples/"],
    expectedSidebarGroups: [
      { title: "快速开始", count: 3 },
      { title: "Demo 文档示例", count: 1 },
      { title: "写作与维护", count: 4 },
      { title: "社区支持", count: 3 }
    ],
    forbiddenMarkers: ["default:book"],
    forbiddenFiles: ["archives/index.html", "categories/index.html", "tags/index.html", "topic/index.html", "wiki/index.html", "wiki/stellar/index.html", "wiki/stellar/build-this-site/index.html", "wiki/stellar/examples/index.html", "wiki/stellar/releases/index.html", "wiki/stellar/articles/index.html", "wiki/stellar/todo/index.html", "wiki/stellar/contributors/index.html", "page/2/index.html"]
  })
]);
