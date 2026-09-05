# 个人知识库：文章和长期资料放在一起

这里既有按时间发布的文章，也有两套 Wiki。它适合内容已经不只是“最近写了什么”，还需要长期整理和反复查找的时候。

![Stellar 个人知识库首页](https://xaoxuu.com/wiki/stellar/assets/screenshots/v2/knowledge-home.webp)

在仓库根目录运行：

```bash
npm run dev -- --site knowledge
```

最先修改这几处：

- `_config.stellar.yml`：博客与知识库共用的菜单、侧栏和外观；
- `source/_posts/`：随时间发布的文章；
- `source/_data/wiki/`：每套知识项目的名称、路径和目录；
- `source/wiki/`：Wiki 正文。

这个示例刻意保留了文章和 Wiki 的区别。不是所有内容都需要进知识库：有稳定目录、以后会反复补充的主题，再建 Wiki 更合适。
