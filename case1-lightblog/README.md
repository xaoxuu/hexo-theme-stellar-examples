# 留白：只留写作和阅读

如果你只想找一个安静的地方写长文、随笔和生活记录，从这里开始。

![留白轻博客首页](https://xaoxuu.com/wiki/stellar/assets/screenshots/v2/lightblog-home.webp)

这个示例没有常驻左侧栏。站点名字、菜单和设置放在顶部，文章页需要目录时才出现。它使用 `flat` 外观和偏舒展的正文排版。

在仓库根目录运行：

```bash
npm run dev -- --site lightblog
```

最先修改这几处：

- `_config.yml`：站点名称、网址和文章链接格式；
- `_config.stellar.yml`：顶部导航、排版和外观；
- `source/_posts/`：删掉示例文章，换成自己的内容。

想加入常驻侧栏、分类和专栏时，可以接着看 [`case2-blog`](../case2-blog/)。
