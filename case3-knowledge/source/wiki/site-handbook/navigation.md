---
title: 为知识库建立导航
description: 配好站点入口、项目列表和分组目录，让读者从首页走到具体文档。
collection:
  profile: wiki
  id: site-handbook
permalink: wiki/site-handbook/navigation/
---

多知识库站点需要两层导航：站点菜单负责进入知识库列表，项目目录负责找到某一篇文档。先将这条路径连起来，再补充标签筛选和相关推荐，读者就能知道自己在哪里。

## 在站点菜单中提供入口

本站的“知识库”菜单指向 `/wiki/`。对应配置位于 `_config.stellar.yml` 的 `menu.items` 中，与文章、归档和其他入口并列。

```yaml
- id: wiki
  title: 知识库
  icon: default:documents
  url: /wiki/
  accent: '#3DC550'
```

Wiki 列表和文档页面的 `active_menu` 都设置为 `wiki`，让用户进入内页以后仍能辨认当前所在的内容系统。此片段应合并到现有配置中，不要覆盖其他菜单项。

## 登记项目并维护独立目录

`source/_data/wiki.yml` 的内容决定哪些知识库上架到列表：

```yaml
- knowledge-management
- site-handbook
```

两个 ID 分别对应同名的项目 YAML。每个项目都有自己的 `route.path`，目录项使用相对于该路径的页面名。例如，本手册的目录这样配置：

```yaml
route:
  path: /wiki/site-handbook/
navigation:
  tree:
    开始建站:
      - index
      - content
    导航与发布:
      - navigation
      - publishing
```

其中 `index` 对应项目首页，`content` 对应 `/wiki/site-handbook/content/`。页面的 `permalink` 从 `wiki/` 开始填写站内路径，例如 `wiki/site-handbook/content/`；目录项则只写 `content`，不重复项目路径。

{% note color:cyan 分组按任务命名 “开始建站”和“导航与发布”说明了阅读阶段；分组内的顺序则对应读者通常先做什么、后做什么。 %}

## 用三次点击验证路径

{% timeline %}
<!-- node 从首页进入知识库列表 -->
点击“知识库”，确认列表中能看到两个项目，各自的标题与简介说明不同用途。
<!-- node 从列表进入项目首页 -->
打开「Stellar 建站手册」，左侧目录应显示这个项目的四篇文档，而不是另一个项目的内容。
<!-- node 从目录进入具体指南 -->
打开“组织博客与 Wiki 文档”，核对当前项高亮，再检查上下篇是否仍在同一个知识库里。
{% endtimeline %}

如果页面可以直接打开，却无法从目录进入，优先检查页面路径是否已登记、项目 ID 是否一致。目录与正文同时维护，新增内容才不会变成只有作者知道地址的孤立页面。
