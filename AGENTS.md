# AGENTS.md

## 事实只有一个 owner

每个事实只允许有一个来源，其余位置从它派生。改一个事实时需要同步改第二处，说明派生漏了一环——先补派生，再改。重复的事实必然漂移，而且漂移是静默发生的。

- 站点事实（标题、描述、标语、外观 preset、内容）的 owner 是 `case<端口>-*` 目录自己的 `_config.yml`、`_config.stellar.yml` 与内容文件。
- 仓库事实（蓝图 id、源目录、端口、蓝图简介、验收清单）的 owner 是 `blueprints.json` 与 `scripts/examples.config.mjs`。
- 主题版本 owner 是 `blueprints.json` 的 `theme.version`，写成 `2.0.x` 这样的 npm 范围；各示例站的 `package.json` 声明这条范围，锁文件钉住实际安装的补丁版本，范围与安装版本是否一致由 `check:structure` 调 `npm ls` 判断。
- 仓库不发布 npm：根与各示例站的 `package.json` 只描述工作区与依赖，不写 `version`。
- 制品目录、catalog、归档命名与 Release tag 都从 `theme.version` 派生，只有 `main.mjs` 自带副本，因为发布制品要脱离仓库独立运行。
- Node 最低版本 owner 是 `package.json` 的 `engines.node`；workflows 与仓库脚本读它，`main.mjs`、`install.sh`、`install.ps1` 因为要脱离仓库单独运行而自带副本。
- 生成物与机器状态（`db.json`、`node_modules`、`public`、`_multiconfig.yml`…）的 owner 是 `.gitignore`；Blueprint 制品收录版本控制的站点文件。
- 仓库身份（`org/name`）owner 是 `blueprints.json` 的 `repository`；`main.mjs` 因发布制品随附的文件只有 `main.mjs`、`install.*` 与 `catalog.json` 而自带副本。
- Hexo 版本由各示例站自己的 `package.json` 锁定，站点之间必须一致，检查从这些文件读出数值后比对。

派生入口统一放在 `scripts/examples.config.mjs`：`type`、`tagline`、`appearance` 都是在那里当场从站点配置读出来的，清单里只放这些派生结果的引用。

允许的重复只有两类：

- **验收断言**（`expectedFiles`、`expectedMarkers`、`forbidden*`）检查的是构建产物，必须独立于来源，页面悄悄丢内容时靠它测出来。
- **钉住的副本**（上面的主题版本、`main.mjs` 的版本副本、Node 最低版本）——副本必须由断言钉住，见下。

## 检查

`npm run check` 是唯一入口：`check:blueprints` 验清单与发布制品，`check:structure` 验布局、派生关系与各处副本是否一致，`check-outputs` 验每个示例站的构建产物。新增事实时顺手在 `scripts/examples.mjs` 加一条断言，让漂移在检查时立刻失败。

## 写法

文档写正向描述：每条规则给出要做的动作。
