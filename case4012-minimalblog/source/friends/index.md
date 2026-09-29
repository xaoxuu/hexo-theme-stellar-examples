---
date: 2022-09-14 16:40
updated: 2026-09-09 23:14
robots: noindex,nofollow
sitemap: false
title: 友链
leftbar:
  widgets: [recent]
rightbar:
  widgets: [welcome, note_202209, toc]
active_menu: friends
article:
  style: story
comments:
  id: /about/
  options:
    data-mapping: number
    data-term: 22
  enabled: true
---

{% box [2025-06] 友链更新说明 %}
友链现在按照文章更新时间排序，数据每天更新一次，还没有设置 RSS 地址的小伙伴请到 [issue](https://github.com/xaoxuu/friends/issues) 中更新。
{% endbox %}

## 友链列表

{% friends posts:true api:https://raw.github.xaox.cc/xaoxuu/friends/output/v2/data.json %}

## 友链失联了怎么办？

{% box %}
添加友链后如果网站长期无法访问，可能会被移出友链列表。如果您的网站恢复了，可以在申请友链时创建的那条 [issue](https://github.com/xaoxuu/friends/issues) 中评论告知。
{% endbox %}

## 如何交换友链？

{% md https://raw.githubusercontent.com/xaoxuu/friends/refs/heads/main/README.md wrap:false %}
