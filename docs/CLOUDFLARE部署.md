# Cloudflare Workers 免费静态部署

项目使用 **Workers Static Assets**，不需要 Worker 业务代码、数据库、KV、D1、R2、付费 API 或自定义域名。`wrangler.jsonc` 已配置静态目录与 SPA 路由回退。Wrangler 已锁定在项目开发依赖中。

## 当前交付状态

已完成：生产构建、Wrangler `deploy --dry-run`、本地 Workers 静态服务验证、深层页面 HTML 回退验证。未完成：Cloudflare 账号授权、GitHub 连接授权、线上发布与公网验证。当前云环境没有 Cloudflare 凭据，代理也限制 Cloudflare 外网访问；**部署预检通过不等于已经部署成功**。

## 推荐：在网页控制台连接当前 GitHub 仓库

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，选择自己的账号，进入 **Workers & Pages**。
2. 点击 **Create application／创建应用**，选择导入 Git 仓库的入口（**Import repository／Connect to Git**），创建 **Workers** 项目。此项目采用 Workers Static Assets，不选择 Pages 配置。
3. 选择 **GitHub**，按网页提示完成授权；可只允许访问 `songyuling343-boop/wanhua-red-sugar-mall` 这个仓库。授权必须由账号所有者在网页完成。
4. 选中该仓库，生产分支设为 **main**，项目根目录保持仓库根目录（`.`，界面默认 `/` 也表示根目录）。
5. 检查下面的构建设置，然后点击 **Deploy／部署**。不要勾选付费升级，也不要创建数据库或存储绑定。
6. 等日志显示构建与部署成功，打开项目 **Settings → Domains & Routes**（或项目首页域名区域）提供的 **workers.dev** 链接。如果首次使用 Workers，按提示免费创建自己的 workers.dev 子域名。
7. 用手机打开该链接，确认首页、欢迎弹窗与下单流程。直接打开 `/member/blindbox`、`/product/qiaojia-gift`、`/story` 并刷新，均应正常呈现。

Cloudflare 控制台文字可能随版本变更，关键是选 **GitHub 仓库 → Workers → 以下构建参数**。若界面提示账号授权或套餐升级，停在该步骤检查；本项目不需要升级套餐。

| 配置 | 值 |
| --- | --- |
| Worker／项目名称 | `wanhua-red-sugar-mall`，与 `wrangler.jsonc` 的 `name` 保持一致 |
| 仓库 | `songyuling343-boop/wanhua-red-sugar-mall` |
| 生产分支 | `main` |
| 根目录 | 仓库根目录 `.` |
| Build Command | `npm run build` |
| Deploy Command | `npx wrangler deploy`（也可使用 `npm run deploy`） |
| Output Directory | `dist`；Workers 由 `assets.directory: "./dist"` 指定，通常没有单独输出目录输入框 |
| Node.js | 推荐 24；若界面需要变量可填 `NODE_VERSION=24` |
| 配置文件 | 已提交 `wrangler.jsonc`；不需要再创建 `wrangler.toml` |
| 业务环境变量／Secrets | 无；GitHub 与 Cloudflare 授权按控制台提示完成 |
| Bindings | 无 |
| 域名 | 控制台生成的免费 `workers.dev` 域名 |

Cloudflare Git 构建会依据 `package-lock.json` 安装依赖。若界面要求手动填写完整构建命令，可用 `npm ci && npm run build`；不要把 `dist` 作为项目根目录。

## 可选：在自己已授权的电脑使用命令行

```bash
npm ci
npm run build
npm run deploy:check
npx wrangler login
npm run deploy
```

`wrangler login` 会打开浏览器，由你本人完成账号授权。部署成功后 CLI 会打印真实地址；在此之前不能把预计地址当成已上线地址。不要将 API Token 写进仓库或聊天。

## SPA 与本地核验

配置关键部分：

```json
"assets": {
  "directory": "./dist",
  "not_found_handling": "single-page-application"
}
```

它让真实导航到 React Router 深层路径时返回 `index.html`。无需 Pages `_redirects`，也不需要写真实后台 Worker。可以运行 `npm run preview:worker` 检查 Workers 本地静态路由；运行前先 `npm run build`。

当前受限云环境将 Wrangler 本地配置目录放在 `/tmp`：

```bash
XDG_CONFIG_HOME=/tmp/wanhua-wrangler-config WRANGLER_SEND_METRICS=false npm run deploy:check
XDG_CONFIG_HOME=/tmp/wanhua-wrangler-config WRANGLER_SEND_METRICS=false npm run preview:worker
```

普通电脑有正常用户目录时无需这两个变量。它们不属于商城运行配置。

## 发布后的验收

- 用无痕窗口检查首次弹窗，关闭后刷新不再出现。
- 测试三个品牌筛选、真实商品图片、购物车、部分结算与立即购买。
- 确认模拟支付提醒、支付成功、订单记录、积分成长、升级弹窗、签到、券兑换和盲盒收藏。
- 刷新深层路径，检查没有服务器 404、横向滚动或图片失败。
- 点开两个外部活动链接，在你自己的网络确认可用性。本云环境代理对两站返回 CONNECT 403，只验证了正确链接和导航动作，未证明外部站点在线。
- 若需要现场恢复效果，从会员中心底部版本号进入演示设置；确认恢复后刷新首页。

## 演示数据与限制

数据只存在访问者本机的 localStorage，不会上传收货信息。换浏览器、清除站点数据、换预览／正式域名会得到独立演示账号。此项目没有真实支付、真实配送、用户数据库或多设备账户同步。规则和参考价格均为比赛策划展示。免费额度与账户状态以 Cloudflare 控制台为准；本配置没有请求任何付费服务。
