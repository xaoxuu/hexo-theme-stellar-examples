---
layout: wiki
wiki: hexo-stellar
title: 更新日志与注意事项
---

{% folding 文档更新记录 %}
{% md https://raw.github.xaox.cc/xaoxuu/hexo-theme-stellar-docs/main/README.md %}
{% endfolding %}

版本命名规范：{% mark 大版本 color:red %} {% mark 小版本 color:yellow %} {% mark 修复版本 color:green %}
- {% mark 大版本 color:red %}：较大范围改动和设计调整、重构
- {% mark 小版本 color:yellow %}：较小范围改动、增加删除功能，也可能包含部分修复
- {% mark 修复版本 color:green %}：仅包含修复或代码优化，可放心无缝升级

{% box 如何关注主题更新 %}
例如，您可以在自己博客任意位置用时间线标签显示主题最近一个版本更新内容：
```
{% timeline api:https://api.github.xaox.cc/repos/xaoxuu/hexo-theme-stellar/releases?per_page=1 %}
{% endtimeline %}
```

{% endbox %}

{% timeline api:https://api.github.xaox.cc/repos/xaoxuu/hexo-theme-stellar/releases?per_page=10 %}
{% endtimeline %}
