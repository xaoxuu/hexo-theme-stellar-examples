# 素页：极简侧栏写作博客

这个示例保留常驻侧栏，同时把视觉装饰降到最低。文章、分类、标签和归档各自承担一种查找方式，页面把注意力留给正文。

在仓库根目录运行：

```bash
npm run dev -- --site minimalblog
```

最先修改这几处：

- `_config.yml`：站点信息、分页与分类／标签生成器；
- `_config.stellar.yml`：Brand、主菜单、侧栏和外观；
- `source/_posts/`：文章与专栏成员；
- `source/_data/topic/`：专栏名称、路径和顺序。

它比轻博客多一层侧栏，比卡片博客更克制。需要把项目资料也放进站点时，再看 [`case4021-knowledge`](../case4021-knowledge/)。
