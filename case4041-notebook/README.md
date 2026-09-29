# 随记：笔记优先的个人笔记本

这个示例把站点做成一本持续生长的笔记本：先随手记下想法，再用笔记本与层级标签慢慢整理。素材还没成型、但希望长期留下来时，从这里开始很合适。

在仓库根目录运行：

```bash
npm run dev -- --site notebook
```

最先修改这几处：

- `_config.yml`：站点信息、网址与发布路径；
- `_config.stellar.yml`：Brand、主菜单、侧栏和外观；
- `source/_data/notebooks/`：每本笔记本的名称、路径与排序；
- `source/notebooks/`：笔记本里的 Note，用 `主题/子主题` 标签组织；
- `source/_posts/`：随时间发布的近况。

它把「全部笔记本 → 单本笔记本 → Note」串成一条路径，主页则保留一栏随时间发布的近况。需要更重的目录和文档结构时，可以对照 [`case4021-knowledge`](../case4021-knowledge/)。
