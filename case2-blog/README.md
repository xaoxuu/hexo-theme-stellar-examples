# 星迹：经典侧栏博客

这个示例适合持续发布技术、阅读和生活内容。左侧栏保留站点身份与主菜单，文章可以按分类、标签、归档和专栏重新找到。

![星迹博客首页](https://xaoxuu.com/wiki/stellar/assets/screenshots/v2/blog-home.webp)

在仓库根目录运行：

```bash
npm run dev -- --site blog
```

最先修改这几处：

- `_config.yml`：站点信息、分页与分类／标签生成器；
- `_config.stellar.yml`：Brand、主菜单、侧栏和文章外观；
- `source/_posts/`：文章与专栏成员；
- `source/_data/topic/`：专栏名称、路径和顺序。

它比轻博客多一些导航，但仍以文章为中心。需要把项目资料也放进站点时，再看 [`case3-knowledge`](../case3-knowledge/)。
