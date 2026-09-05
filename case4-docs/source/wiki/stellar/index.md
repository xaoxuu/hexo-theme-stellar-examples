---
date: 2022-10-21 13:15
updated: 2026-08-13 01:36
title: 开启您全新的博客之旅
collection:
  profile: wiki
  id: stellar
permalink: /
---

Stellar 是一个内置文档系统的简约商务风 Hexo 主题，提供丰富的标签与动态数据组件，帮助您从容应对各种表达需求，轻松开启全新的博客之旅。

{% toc wiki:Stellar 文档目录 display:mobile %}

## 开始前的准备工作

{% tabs %}

<!-- tab 有 AI -->

新用户无需提前通读全部文档，借助 AI 助手即可快速上手：

1. 让 AI 了解项目：本项目配套了较为完整的 AI 知识库，AI 能更轻松、更准确地理解 Stellar。
2. 向 AI 提出需求：安装配置、页面搭建、主题自定义等任务，都可以让 AI 结合项目文档协助完成。
3. 遇到问题直接询问：边做边学，随时向 AI 提问，或查阅 [Hexo](https://hexo.io/zh-cn/docs/) 中文文档。

<!-- tab 没 AI -->

自建独立博客需要具备一些基础知识：[markdown](https://www.runoob.com/markdown/md-tutorial.html) 常用语法需要掌握；此外，您还需要了解 `yaml` 文件格式和基本的 `git` 操作。如果您还没有使用过 Hexo，建议先通读一遍 [Hexo](https://hexo.io/zh-cn/docs/) 中文文档。

{% link https://hexo.io/zh-cn/docs/ %}

{% endtabs %}

## 环境要求

无论是全新安装，还是从旧版本升级、从其他主题迁移，都建议保持环境版本不低于以下要求，以免出现兼容性问题：

```yaml 建议的版本
Hexo: 6.3.0 ~ latest
hexo-cli: 4.3.0 ~ latest
node: >= 22 # 建议选择 LTS 版本
npm: >= 10
```

## 安装与更新

{% box %}
{% tabs %}

<!-- tab 稳定版 -->

**安装方法**

1. 打开终端并进入博客文件夹，执行：
{% copy npm i hexo-theme-stellar %}

2. 在 `blog/_config.yml` 文件中找到并修改：
{% copy theme: stellar %}

**更新方法**

1. 打开终端并进入博客文件夹，执行：
{% copy npm i hexo-theme-stellar %}

2. 查看 [更新日志](https://github.com/xaoxuu/hexo-theme-stellar/releases)，按说明完成迁移。

{% note color:green 适用范围 稳定版适用于以内容创作为主，不需要自定义主题，追求稳定和可靠性的用户。 %}

<!-- tab 最新版 -->

**安装方法**

1. 把 Stellar 主题仓库添加为博客仓库的子模块
{% copy git submodule add https://github.com/xaoxuu/hexo-theme-stellar.git themes/stellar %}

2. 在 `blog/_config.yml` 文件中找到并修改：
{% copy theme: stellar %}

**更新方法**

1. 打开终端并进入主题文件夹，执行：
{% copy git pull %}

2. 查看 [更新日志](https://github.com/xaoxuu/hexo-theme-stellar/releases)，按说明完成迁移。

{% note color:blue 适用范围 最新版适用于希望第一时间体验新特性的用户。 %}

<!-- tab 自定义 -->

**安装方法**

1. 把 Stellar 主题仓库 [fork](https://github.com/xaoxuu/hexo-theme-stellar) 到您的 GitHub 账号下

2. 把您 fork 的 Stellar 主题仓库添加为博客仓库的子模块
{% copy git submodule add https://github.com/#yourname#/hexo-theme-stellar.git themes/stellar %}

3. 在 `blog/_config.yml` 文件中找到并修改：
{% copy theme: stellar %}

**更新方法**

1. 在您 fork 的 Stellar 主题仓库打开终端，执行：
{% copy git pull %}

2. 查看 [更新日志](https://github.com/xaoxuu/hexo-theme-stellar/releases)，按说明完成迁移。

{% note color:yellow 适用范围 自定义版适用于对主题有自定义需求，且掌握了一定的前端知识和动手能力的用户。 %}

<!-- tab 引用源码 -->

**安装方法**

下载源码放到 `themes/` 文件夹下面试用。

{% note color:error 适用范围 仅适合测试，无法获得更新。 %}

{% endtabs %}
{% endbox %}

## 开始使用

安装并启用主题后，建议按以下顺序阅读文档：

{% navbar [主题配置](https://xaoxuu.com/wiki/stellar/theme-settings/) [页面](https://xaoxuu.com/wiki/stellar/pages/) [侧边栏](https://xaoxuu.com/wiki/stellar/sidebar/) [标签插件](https://xaoxuu.com/wiki/stellar/tag-plugins/) [评论区](https://xaoxuu.com/wiki/stellar/comments/) %}

{% note 小提示 完整文档目录见侧边栏或页面顶部的文档目录；[示例站点](/examples/) 展示了 Stellar 的多种玩法，[更新日志](/releases/) 记录了每个版本的变化。 %}

## 问题排查

遇到问题时，按以下顺序排查：

1. 翻阅和搜索本系列文档
2. 搜索 [issues](https://github.com/xaoxuu/hexo-theme-stellar/issues) 中是否已经有解决办法
3. 如果没有，新建 [issue](https://github.com/xaoxuu/hexo-theme-stellar/issues/new/choose) 并按照要求进行操作，详尽地描述您遇到的问题

## 关于 Stellar

{% quot 真正的简约不止删繁就简，而是在纷繁中建立秩序。它通过克制视觉元素、突出有效信息、删除无效内容，让注意力始终落在真正重要的东西上。 %}

### 支持本项目

本项目永久开源、完全免费。如果您喜欢它，不妨 [点个赞](https://github.com/xaoxuu/hexo-theme-stellar/) 支持一下～

{% image https://star-history.dera.page/svg?repos=xaoxuu/hexo-theme-stellar&type=date&legend=top-left ratio:800/533 %}

### 开源许可协议

{% quot 项目中的许可声明文件应包含在所有副本中 %}

本项目由 [@xaoxuu](https://github.com/xaoxuu) 设计并开发，同时收录了 [开源贡献者](https://xaoxuu.com/wiki/stellar/contributors/) 的代码贡献，采用 [MIT License](https://raw.github.xaox.cc/xaoxuu/hexo-theme-stellar/main/LICENSE) 协议开源。复制、分享或基于本项目进行创作时，请遵守协议内容：

```license
MIT License

Copyright (c) 2021 xaoxuu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 社区分享

{% box 这里展示最新 3 篇「探索号」投稿文章 %}

{% timeline hide:title,footer api:https://api.github.xaox.cc/repos/xaoxuu/hexo-theme-stellar/issues?state=all&labels=分享&per_page=3 %}
{% endtimeline %}

{% navbar [更多文章](https://xaoxuu.com/wiki/stellar/articles/) [投稿](https://github.com/xaoxuu/hexo-theme-stellar/issues/new?template=article-share.md) %}

{% endbox %}
