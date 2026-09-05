---
title: 文档导航与页面地址
date: 2026-09-02 12:00
description: 将文档归属、永久链接和侧栏分组对应起来，维护清晰的单项目站点入口。
tags:
  - 导航
  - 配置
  - Wiki
collection:
  profile: wiki
  id: stellar
permalink: /navigation-guide/
---

在这个单项目示例中，项目首页位于 `/`，其他文档使用 `/authoring-guide/` 这样的顶级地址。新增页面时，需要同时考虑三个问题：它属于哪个项目、使用什么地址，以及出现在导航的哪个分组中。

## 归属与地址分别声明

`collection` 将页面加入 Stellar Wiki 项目，`permalink` 指定页面地址。文件所在目录方便维护者组织源码，访问地址则由页面配置决定，二者不必一一对应。

```yaml
---
title: 文档导航与页面地址
collection:
  profile: wiki
  id: stellar
permalink: /navigation-guide/
---
```

给地址起名时，优先使用能够长期保留的短名称。标题可以逐步润色，已经被分享的链接却需要保持稳定。不要仅仅因为调整了侧栏分组，就顺手更换所有页面地址。

## 把完整路径放进导航树

项目导航在 `source/_data/wiki/stellar.yml` 中维护。下面这组页面对应本站新增的写作与维护指南：

```yaml
navigation:
  tree:
    写作与维护:
      - /authoring-guide/
      - /content-components/
      - /navigation-guide/
      - /publishing-checklist/
```

实际修改时，把这组内容合并进已有的 `navigation.tree`，并保留其他分组。分组按阅读任务命名，比按文件夹名称排列更容易理解；排序则优先考虑读者应该先完成哪一步。

{% note color:yellow 路径写法 这个示例的导航项保留开头和结尾的斜杠，与页面 permalink 对齐，例如 /authoring-guide/。 %}

## 单项目首页仍然使用根路径

项目配置中的 `route.path: /` 与主题配置中的 `profiles.wiki_index.path: null` 一起组成这个示例的入口方式。前者让项目使用根路径，后者关闭 Wiki 列表页。新增指南不需要再增加一个 Wiki 项目。

{% folding color:cyan 页面能打开，为什么导航里找不到？ %}
先检查页面的 `collection.id` 是否为 `stellar`，再比较 `permalink` 与导航项是否一致。尤其注意开头的斜杠、拼写和大小写。

随后重新生成站点，从首页进入文档树查看。只修改源码而不重新生成时，浏览器可能仍在显示上一次的导航。
{% endfolding %}

## 分别检查页面与入口

直接打开页面地址，可以确认文档已生成；从导航点击进入，可以确认入口与归属正确。两种检查都通过后，再看看相邻页面的阅读顺序是否自然，避免只有维护者才知道下一篇在哪里。

{% button color:cyan 查看发布前检查 ../publishing-checklist/ %}
