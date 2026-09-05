---
title: 发布前，把文档走一遍
date: 2026-09-01 12:00
description: 区分配置检查、站点构建与页面阅读，完成一次可以重复执行的文档发布检查。
tags:
  - 发布
  - 检查清单
  - 工作流
collection:
  profile: wiki
  id: stellar
permalink: /publishing-checklist/
---

一篇文档能够生成，不代表它已经能帮助读者完成任务。发布前需要分别确认配置关系、页面输出和阅读路径；每一步回答的问题不同，不能只靠最后一条成功日志判断全部完成。

## 按顺序检查三个层次

{% timeline %}
<!-- node 配置：内容属于哪里 -->
运行配置检查，确认项目、页面与导航引用能够被主题识别。如果新增了文档，尤其检查项目 ID 和页面地址。
<!-- node 构建：页面是否生成 -->
生成站点，查看输出中是否包含预期页面。遇到错误时，先定位具体文件和字段，再重新执行受影响的检查。
<!-- node 阅读：能否完成任务 -->
从首页找到这篇文档，按正文完成一次操作。检查代码是否可复制，链接是否到达正确页面，以及结尾是否交代了预期结果。
{% endtimeline %}

## 根据项目位置选择命令

{% tabs %}
<!-- tab 下载后的独立站点 -->
在下载并安装好依赖的 Blueprint 站点根目录执行：

```bash
npm run doctor
npm run build
npm run server
```

前两项用于检查与生成，最后一项启动本地预览。预览地址以命令输出为准。
<!-- tab examples 仓库 -->
在 examples 仓库根目录执行，脚本会合并共享配置与 docs 站点配置：

```bash
npm run doctor -- --site docs
npm run build -- --site docs
npm run check:outputs -- --site docs
npm run dev -- --site docs
```

最后一项启动 docs 示例的本地预览，默认地址为 `http://127.0.0.1:4004/`。
{% endtabs %}

## 用读者的路径核对

下面的方框用来辅助当次阅读检查，不保存跨页面或跨设备的完成进度。需要保留验收结果时，将日期、结果与待办写进自己的发布记录。

{% checkbox checked:false color:cyan 从项目首页可以找到新增文档。 %}
{% checkbox checked:false color:cyan 导航分组与当前页面的标题一致。 %}
{% checkbox checked:false color:cyan 命令说明了执行目录和必要的前置条件。 %}
{% checkbox checked:false color:cyan 窄窗口下仍能阅读表格、代码和提示内容。 %}
{% checkbox checked:false color:cyan 正文中的站内链接都能到达预期页面。 %}

{% folding color:yellow 线上地址与本地预览不同时检查什么？ %}
先比较站点的 `url`、`root` 与实际发布位置。子路径部署需要相应的路径前缀，独立域名根目录则通常使用 `/`。同时确认线上文件来自这次构建，而不是旧的输出目录。

本地开发命令会使用本地预览地址，不能仅凭本地链接正常，就判断发布路径也正确。部署后仍需重新从线上首页打开一篇内页。
{% endfolding %}

最后记录这次新增了哪些页面、哪些检查已经完成，还有哪些问题需要处理。下次更新从这份记录接着做，就不必重新猜测上一次停在哪里。
