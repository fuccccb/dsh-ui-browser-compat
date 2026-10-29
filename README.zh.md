# dsh-ui-browser-compat

一个 DeepSeek Harness（DSH）Web 客户端插件：把**老内核上无限转“重新连接中”**的沉默失败，
变成一条说清原因、给出解法的提示。

English: [README.md](README.md)

---

## 它解决的问题

DSH 的 Web 界面通过 `/api/remote.mux` 这个 WebSocket 与 Host 通信，服务端每 **2 秒**发一次心跳。
页面加载时还会**在运行时拉取客户端插件包**，而这些包是按现代内核编译的。

在老内核上——通常是 **Android System WebView**，被 **Via**、X5 这类外壳浏览器复用——会发生：

1. 外壳 HTML 能解析，UI 可能挂载成功，所以页面**看起来没有坏**
2. 运行时插件包解析失败，或 WebSocket 撑不住心跳
3. 连接服务永远起不来
4. 界面就一直显示 **“重新连接中”**，不给任何解释

用户完全无从得知：这台设备上这个页面永远不会恢复正常。

## 它做了什么

探测**当前运行的内核**，把结果说清楚：

- 当内核撑不住实时连接时，在 `shell.overlay` 显示**全宽横幅**，写明检测到的内核、缺失的能力、以及确切的修复动作
- 在“设置 → 通用”增加一行**常驻诊断**，并支持**一键复制诊断信息**，便于提交问题

插件不替换传输层，也不会在探测显示有问题时粉饰太平。它是**诊断**，不是兼容垫片——
为什么单靠插件无法让老内核跑起来，见[边界](#边界为什么单靠插件救不了老内核)。

## 截图

![模拟 Chrome 61 内核时的横幅](banner-screenshot.png)

## 安装

这个包设计为放进 DSH 检出里的 `packages/client/ui-browser-compat/`。

```bash
# 在 DSH 仓库根目录执行
cp -r dsh-ui-browser-compat packages/client/ui-browser-compat
```

在 Web 应用的组合文件 `packages/bundle/web-app/cordis.patch.yml` 的浏览器插件清单里注册：

```yaml
    - id: ui-browser-compat
      name: '@deepseek-ai/dsh-client-ui-browser-compat'
```

然后重新构建客户端产物与 Web 外壳：

```bash
pnpm run build:lib:client
pnpm run build:web
```

重启 `dsh web` 进程并刷新页面。

## 探测了哪些能力

| 能力 | 最低内核 | 为什么重要 |
|---|---|---|
| `Promise` | Chrome 32 | 外壳里所有异步路径 |
| `fetch` | Chrome 42 | 传输层与 RPC |
| `WebSocket` | Chrome 5 | 实时连接本身 |
| `Object.hasOwn` | **Chrome 93** | 运行时插件包使用 |
| 类私有字段 `#x` | **Chrome 84** | 运行时插件包使用 |
| 类静态字段 | Chrome 72 | 运行时插件包使用 |
| ES 模块脚本 | Chrome 61 | 整个外壳 |
| CSS `:has()` | Chrome 105 | 布局正确性（菜单、行） |
| CSS `color-mix()` | Chrome 111 | 主题配色 |

传输关键子集（`WebSocket`、`fetch`、`Object.hasOwn`、类私有字段、静态字段）决定
`incompatible` 结论。CSS 缺失会报告，但单独不会触发横幅——它影响样式，不至于让连接断掉。

## 为什么探测代码刻意用老语法写

这是最容易做错的地方：**一个老内核解析不了的诊断，等于没有。**

所以 `src/client/probe.ts` 里没有 `?.`、没有 `??`、没有 `??=` / `||=`、没有箭头函数、
没有模板字符串、没有 `Array.prototype.includes`。老解析器会直接拒绝的语法（类私有字段、
静态字段）被隔离在 `eval` 里，于是拒绝执行的内核得到的是 `false`，而不是整个模块崩掉。

目前这一点靠源码约定和代码评审保证，加构建门禁在待办里。

## 构建

本包使用 DSH 的客户端预设（`packages/client/tsdown.client.ts`），产出客户端模块表期望的
`window.__ModuleLoader__.load({ id, factory })` 闭包工厂产物。

```bash
pnpm --filter @deepseek-ai/dsh-client-ui-browser-compat run bundle
```

仓库里的 `lib/` 是由 `src/` 构建出的产物。提交它是为了让读者能直接看到真实交付内容，
但正式安装时应当在目标检出里重新构建。

## 验证

`verify/` 里是开发时用的独立验证宿主：

- `server.mjs` 用**真实的** index 注入管线提供 DSH 的 `index.html`，加载**真实的**已构建 bundle，
  并用一个最小 Cordis 形状的上下文调用 `apply`
- `verify.mjs` 用 Playwright 驱动它，通过删除现代能力和改写 UA 来伪造老内核

它证明了什么：bundle 以自己的包名注册、`apply` 注册了两个槽位、注入面产出探测结论、
横幅带正确插值渲染、关闭按钮可用。
它证明不了什么：在真实 DSH Host 内部的行为——那需要真实安装。

## 边界：为什么单靠插件救不了老内核

客户端插件无法修复一个连产品本身都解析不了的内核。具体来说：

- 主外壳 bundle 用 Vite `target: 'es2022'` 构建
- **每一个**运行时插件包（包括本插件）都由客户端预设以 `target: 'es2024'` 构建
- `:has()` 与 `color-mix()` 目前完全没有降级

真要支持老 WebView，需要在**包层**加一个 legacy 构建变体：降级构建目标、CSS 降级并为
`:has()` 提供回退、以及由任何模块之前注入的 API polyfill。那是平台级改动，不是插件。

如果内核老到连外壳本身都解析不了，本横幅也渲染不出来。

## 状态

基于 DSH 0.2.1-rc.3 检出开发并验证。探测逻辑、bundle 构建、槽位注册、横幅渲染与关闭都在
独立宿主中测试通过。**尚未**在真实 DSH Host 内运行——因为开发环境的检出是只读挂载的。

## 许可

MIT
