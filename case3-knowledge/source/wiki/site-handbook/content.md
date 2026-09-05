---
title: 组织博客与 Wiki 文档
description: 为文章与项目文档选择合适的位置，用明确的归属和地址维护独立知识库。
collection:
  profile: wiki
  id: site-handbook
permalink: wiki/site-handbook/content/
---

先判断内容准备怎样被使用。如果它描述一次发生过的事情，适合放进博客；如果读者会反复回来查找同一个问题的答案，适合放进 Wiki。选择依据是用途，篇幅长短不是决定因素。

## 两类内容放在不同位置

{% tabs %}
<!-- tab 博客文章 -->
文章放在 `source/_posts/`，通过日期进入 Feed，并可以使用分类、标签和专栏关联。文件名同时参与文章地址，命名后尽量保持稳定。

```yaml
---
title: 第一次整理项目笔记
date: 2026-09-04 09:00
categories:
  - 方法
tags:
  - 知识管理
  - 项目记录
---
```
<!-- tab Wiki 文档 -->
文档放在 `source/wiki/项目ID/`。通过 `collection` 指定项目，使用明确的 `permalink` 对应项目目录中的路径，不会作为普通新文章混入博客 Feed。

```yaml
---
title: 一份新的建站指南
collection:
  profile: wiki
  id: site-handbook
permalink: wiki/site-handbook/new-guide/
---
```
{% endtabs %}

## 一个知识库需要哪些文件

`source/_data/wiki.yml` 登记要展示的项目 ID，`source/_data/wiki/项目ID.yml` 描述项目名称、简介、地址和目录，`source/wiki/项目ID/` 则保存正文。

本示例已经登记 `knowledge-management` 和 `site-handbook`。新增一篇建站指南时，继续使用 `site-handbook`，并将路径加入它的 `navigation.tree`，不需要为每篇文档新建一个项目。

## 每个页面只维护一份正文

博客日志引用知识库时，用一句话说明关系，再给链接。不要把同一段完整教程同时复制到两处，否则修改其中一处后，另一处容易继续提供旧信息。

{% folding color:yellow 想把博客内容整理进 Wiki 怎么办？ %}
保留博客原有的日期与过程记录，从中提炼能够重复使用的方法，写成新的 Wiki 指南。博客中链接到指南，指南只在需要背景时链接回博客。这样既保存当时的经验，也给当前做法留下稳定入口。
{% endfolding %}

写完正文后，继续阅读[为知识库建立导航](../navigation/)，将它放进读者能够找到的位置。
