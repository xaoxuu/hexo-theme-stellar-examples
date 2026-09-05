# 项目文档：只围绕一个项目展开

这个示例没有博客首页。打开站点就是项目介绍，左侧是文档目录，右侧是当前页面的大纲。

![Stellar 项目文档首页](https://xaoxuu.com/wiki/stellar/assets/screenshots/v2/docs-home.webp)

在仓库根目录运行：

```bash
npm run dev -- --site docs
```

最先修改这几处：

- `_config.yml`：项目站点地址与基础信息；
- `_config.stellar.yml`：文档站导航和外观；
- `source/_data/wiki/stellar.yml`：项目名称、首页、目录和仓库信息；
- `source/wiki/stellar/`：每一篇文档正文。

目录适合放稳定的使用旅程，不必把每个内部模块都变成一篇页面。只有几篇说明时，一份 README 可能已经够用。
