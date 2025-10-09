## 项目简介：Incognito Session Bridge

一个用于在网站之间读取与应用会话数据（Cookies、LocalStorage、SessionStorage）的浏览器扩展。定位是“轻权限、广适配”，默认不申请 `cookies` 权限，仅使用页面上下文的 `document.cookie` 与脚本注入来完成大多数同域/子域写入场景；并提供可选的调试与增强能力。

### 核心功能
- 复制会话到剪贴板：读取当前标签页的会话数据（含 Cookies、LocalStorage、SessionStorage）并以 JSON 复制。
- 应用会话到当前站点：将剪贴板中的会话写回当前站点。
- 跨域写入策略：
  - 同域：来源域与当前域相同或满足父/子域关系时，尽可能保留原有 Cookie 属性。
  - 跨域：来源域与当前域不同，Cookies 与 Storage 仅落在“当前域”，不做跨站强写。
- 即时反馈：通过 `StatusBar` 在 UI 展示“同域/跨域”写入类型、成功/失败摘要与建议操作（如刷新页面）。
- 调试工具：一键对比“按 URL”与“按 Domain”两种方式读取到的 Cookies 数量与 HttpOnly 统计，并输出完整明细，便于排查。

### 工作方式（简述）
1) 读取
   - Cookies：优先按当前标签页 `url` 读取（可统计到 HttpOnly），若为空再按 `domain` 回退。
   - Storage：通过脚本注入读取 `localStorage` 与 `sessionStorage`。
2) 写入（默认无权限模式）
   - Cookies：在页面上下文使用 `document.cookie` 写入，支持 `path`、`expires`、`samesite`、`secure(https)`；不支持 HttpOnly 设置；不可跨站设置。
   - Storage：在页面上下文直接写入 `localStorage`、`sessionStorage`。
3) 写入策略判定
   - `sameDomain`：来源与目标满足相同/父子域关系→尽量保留域路径属性（若不匹配则跳过避免跨站失败）。
   - `crossDomain`：一律落到当前域，不附加原 `domain` 属性。

### 限制与边界
- 无法设置或读取 HttpOnly（仅 `document.cookie` 模式）；若需写入 HttpOnly，需启用 `chrome.cookies` 权限并使用增强 API（本项目已留有实现但默认不启用）。
- 不能跨站设置 Cookies（不同 eTLD+1）。
- `secure` 仅在 https 页面生效；严格的 SameSite、分区/第三方 Cookie、容器/隐私策略可能导致写入被丢弃。

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
