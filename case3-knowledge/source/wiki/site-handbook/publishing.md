---
title: 检查与预览你的站点
description: 核对项目配置、生成页面和实际阅读路径，完成一次博客与 Wiki 的共同验收。
collection:
  profile: wiki
  id: site-handbook
permalink: wiki/site-handbook/publishing/
---

站点增加知识库之后，发布检查不仅包含博客列表，还要确认两个项目都能进入、各自目录没有串页，以及相对链接在部署路径下仍然有效。

## 先确认执行命令的位置

{% tabs %}
<!-- tab examples 仓库 -->
在仓库根目录执行，脚本会自动合并共享 Hexo 配置与 knowledge 示例配置：

```bash
npm run doctor -- --site knowledge
npm run build -- --site knowledge
npm run check:outputs -- --site knowledge
npm run dev -- --site knowledge
```

最后一项启动本地预览，默认地址为 `http://127.0.0.1:4003/`。
<!-- tab 下载后的独立站点 -->
在已经安装依赖的 Blueprint 站点根目录执行：

```bash
npm run doctor
npm run build
npm run server
```

独立站点已有合并后的配置，不需要引用 examples 仓库的 `config/hexo.yml`。预览地址以命令输出为准。
{% endtabs %}

## 用可观察的结果检查内容

Doctor 检查配置与内容关系，构建负责输出页面。两项成功以后，仍然需要从首页走一遍实际路径，检查描述与页面内容是否对应。

{% checkbox checked:false color:cyan 博客列表能打开现有文章，分类与专栏入口保留。 %}
{% checkbox checked:false color:cyan Wiki 列表包含个人知识管理和 Stellar 建站手册。 %}
{% checkbox checked:false color:cyan 每个项目都有四篇文档，并出现在自己的目录中。 %}
{% checkbox checked:false color:cyan 上下篇留在当前项目内，跨项目链接能够正确跳转。 %}
{% checkbox checked:false color:cyan 在窄窗口下能展开目录并正常阅读正文。 %}

## 对照实际发布地址

示例仓库的在线地址包含 `/hexo-theme-stellar-examples/knowledge/` 前缀；下载后的独立站点默认使用根路径。发布前检查 `url` 和 `root` 是否对应自己的域名与部署位置，再从真实发布入口打开一篇内页。

{% folding color:yellow 生成成功，但看到的还是旧内容？ %}
先确认预览服务指向刚刚构建的目录，再检查浏览器打开的地址。若修改了页面地址，旧输出可能仍被已有服务或部署缓存使用；清理并重新生成后，再核对目标文件是否更新。

排查时记录具体 URL 和页面标题，比笼统地描述“没有更新”更容易找到原因。
{% endfolding %}

完成检查后，记下本次新增的项目或页面，以及仍需处理的问题。下一次修改时，从受影响的入口继续检查即可。
