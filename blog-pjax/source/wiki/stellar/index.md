---
wiki: hexo-stellar
title: 开始您全新的博客之旅
---

Stellar 是一个内置文档系统的简约商务风 Hexo 主题，支持丰富的标签和动态数据组件，帮助您简单从容地应对各种表达需求，十分推荐内容创作者使用 Stellar 开始您全新的博客之旅。

{% folding 了解 Stellar 如何在混乱中建立秩序 %}

**“真正的简约远不止删繁就简，而是在纷繁中建立秩序。”**

人的注意力是有限的，要提高有效信息的醒目程度，就必须降低不重要信息醒目程度，删除所有无效信息。

**降低视觉密度**

- 增加留白，增加间距。
- 减少颜色丰富度，大面积出现的是中性色，彩色必须有其特殊意义，意义相同的元素使用同一种颜色。

**提高有效信息优先级**

- 文章标题永远是最大的，对比度最高的
- 不可交互的不重要的小标题（如侧边栏某个插件的标题）降低对比度
- 与文章相关的不重要的小标题，使用小号字体

**删掉无效信息**

- 文章标签、字数、阅读量、评论数
- 网站访问量、字数、搭建时间
- 全局播放器（除了特殊文章）

{% endfolding %}

## 开始前的准备工作

尽管我们致力于降低使用门槛，但是自建独立博客仍然需要一定的相关知识，[markdown](https://www.runoob.com/markdown/md-tutorial.html) 常用语法是必须要掌握的，除此之外，您还需要知道 `yaml` 文件格式、简单的 `git` 知识，最最重要的是，遇到问题知道该如何高效地寻找答案：

{% checkbox checked:true 翻阅和搜索文档 %}
{% checkbox checked:true 搜索 issues 中是否已经有解决办法 %}
{% checkbox checked:true 如果没有，新建 issue 并按照要求进行操作，详尽地描述您遇到的问题 %}

**如果您没有使用过 Hexo 也不要着急，我十分建议您去通读一遍 [Hexo](https://hexo.io/zh-cn/docs/) 中文文档**。

{% link https://hexo.io/zh-cn/docs/ %}

此外，如果您从旧版本更新或者其它主题迁移，请确保环境版本不要太低，否则会产生兼容性问题：

```yaml 建议的版本
Hexo: 6.3.0 ~ latest
hexo-cli: 4.3.0 ~ latest
node: 14.17.3 ～ latest LTS # 建议选择 LTS 版本，过高的版本 hexo 还没有进行兼容。
npm: 6.14.13 ~ latest
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

2. 阅读 [更新日志](https://github.com/xaoxuu/hexo-theme-stellar/releases) 进行迁移操作。

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

2. 阅读 [更新日志](https://github.com/xaoxuu/hexo-theme-stellar/releases) 进行迁移操作。

{% note color:blue 适用范围 最新版适用于以内容创作为主，不需要自定义主题，追求新特性的用户。 %}

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

2. 阅读 [更新日志](https://github.com/xaoxuu/hexo-theme-stellar/releases) 进行迁移操作。

{% note color:yellow 适用范围 自定义版适用于对主题有自定义需求，且掌握了一定的前端知识和动手能力的用户。 %}

<!-- tab 引用源码 -->

**安装方法**

下载源码放到 `themes/` 文件夹下面试用。

{% note color:error 适用范围 仅适合测试，无法获得更新。 %}

{% endtabs %}
{% endbox %}

{% toc wiki:Stellar 文档目录 display:mobile %}

## 关于 Stellar 

### Star History

本项目永久开源免费，如果您喜欢本项目，请 [点个赞](https://github.com/xaoxuu/hexo-theme-stellar/) 支持一下吧～

{% image https://starchart.cc/xaoxuu/hexo-theme-stellar.svg  ratio:1024/400 %}

### 开源许可协议

{% quot 项目中的许可声明文件应包含在所有副本中 %}

本项目是由 [@xaoxuu](https://github.com/xaoxuu) 设计和开发，后期也合并了 [开源贡献者](https://xaoxuu.com/wiki/stellar/contributors.html) 提交的代码，使用 [MIT License](https://raw.github.xaox.cc/xaoxuu/hexo-theme-stellar/main/LICENSE) 开源许可协议进行授权，拷贝、分享或基于此进行创作时请遵守协议内容：

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

## 探索 Stellar

{% box 这里展示最新3篇探索号投稿文章 %}

{% timeline hide:title,footer api:https://api.github.xaox.cc/repos/xaoxuu/hexo-theme-stellar/issues?state=all&labels=分享&per_page=3 %}
{% endtimeline %}

{% navbar [更多文章](https://xaoxuu.com/wiki/stellar/articles.html) [投稿](https://github.com/xaoxuu/hexo-theme-stellar/issues/new?template=article-share.md) %}

{% endbox %}