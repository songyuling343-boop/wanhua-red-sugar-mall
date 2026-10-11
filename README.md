# 万华巧家小碗红糖官方商城 · 比赛演示版

基于企业真实品牌与产品资料的高保真手机端商城原型。第一阶段完成首页、分类、商品详情，以及购物车和会员中心页面框架。全部使用免费开源工具，无后端、数据库、支付、短信或付费 API。

## 本地运行

推荐 Node.js 22.12+（已在 Node.js 24.19.0、npm 11.9.0 环境验证）。

```bash
npm install
npm run dev
```

可重复安装使用 `npm ci`。生产检查：

```bash
npm run build
npm run preview
```

技术栈：React 19、TypeScript、Vite、Tailwind CSS 4（通过 Vite 插件启用）、React Router、Lucide Icons。全局组件样式位于 `src/styles/index.css`，包含 Tailwind 主题色与手机端适配。网页使用系统中文字体，不加载付费字体或远程字体服务。

## 页面与交互

- `/`：品牌首页、三张自动／手动／滑动轮播、万巧巧欢迎区、四专区、五个商品板块、品牌文化、两项外部活动入口。
- `/category`：品牌／系列筛选、商品与口味搜索、价格排序、分组筛选。筛选状态保留在 URL。
- `/product/:id`：企业产品图、规格、可选口味／配料包、数量、收藏、加入购物车、立即购买、使用场景、品牌故事、相关推荐。立即购买添加所选商品并进入购物车展示框架。
- `/cart`：本地加入的商品、所选口味、数量、演示合计；没有结算、支付或订单。
- `/member`：演示访客框架、本地收藏、活动入口；没有注册、登录、积分或会员等级。

375–430px 优先适配，桌面主体最大 430px 居中。底部导航及详情购买栏固定，适配安全区域。首次邀请弹窗使用 `localStorage` 记录“已展示”，支持关闭、Escape、键盘焦点循环。收藏和购物袋仅保存在当前浏览器，不会同步到服务器。清除站点存储可重新体验首次弹窗。

## 集中配置与资料依据

- `src/data/site.ts`：商城名、品牌故事、外部链接、素材路径、演示声明、存储键、会员服务占位配置。
- `src/data/products.ts`：14 个商品条目、规格、口味、演示价格、PDF 页码、标签、板块排序。
- `src/context/ShopContext.tsx`：本地购物袋和收藏状态。
- `reference/README.md`：原始资料索引、产品表、视觉分析、读取边界与原始资料冲突。保持原有整理文件不变。
- `public/images/sources.json`：从产品 PDF 提取的图片与原始页码、对象编号映射。
- `scripts/extract-reference-images.py`：直接导出 PDF 内嵌图及复制品牌 PNG，不重绘；仅重新生成图片时需要 Python + PyMuPDF，日常 npm 安装、构建、运行无需 Python。

纳入金沙唐韵 8 款（包含家庭装橙色系列）、上古·红糖公主 3 款、呵糖产妇红糖 3 种包装。口味、规格、归属来自企业产品册第 2–13 页。不把所有产品统一标为有机，不使用未经核验的认证、销量或医学功效文案。

官方 Logo、万巧巧 IP、三个子品牌展示原图均来自 `reference/brand/`。商品图直接提取企业 PDF 的包装／照片，可能同时展示系列的多个口味或规格，详情已注明图片边界，不宣称是所选 SKU 的独立官方实拍。

全部价格为比赛演示价，页面标注“价格为策划展示参考，非官方实际售价”。本周热销仅为比赛演示排序，无虚构销量。新品专区展示红糖咖啡与天麻红糖的资料线索；上市状态与规格待确认，未作为可购买 SKU。万巧巧盲盒是 IP 互动衍生系列，不列为正式企业子品牌。

## 验证

```bash
npm run build
npm run test:e2e
```

Playwright 测试使用生产预览服务器，覆盖首次弹窗与记忆、活动链接和轮播、品牌／系列／搜索／排序、口味与数量、收藏／购物袋持久化、立即购买跳转、全部 14 个详情、异常数据恢复及 375／390／430／1280px 布局与图片加载。

测试优先使用系统 `/usr/bin/chromium`，不存在时使用 Playwright 安装的 Chromium；其他机器可安装免费 Chromium：

```bash
npx playwright install chromium
npm run test:e2e
```

如需指定其他浏览器路径，可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`。

两项外部活动：
- https://wanhua-red-sugar-quiz.pages.dev/
- https://wanqiaoqiao-blindbox.pages.dev/

应用使用直接 HTTPS 链接，测试核对链接目标。当前云环境的网络代理对两站返回 CONNECT 403，未验证站点在线状态；不影响本地页面运行。

本阶段未进行 Cloudflare 部署，也未实现结算、会员积分或订单。后续可部署静态构建产物，但部署与第二阶段功能需另行确认。
