// 最小验证宿主：真实 index 注入管线 + 真实插件路由 + 总线，用 dsh 真实的
// index.html 和已构建的插件 bundle 验证横幅能不能挂上去。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { renderIndexInjections } from '/app/packages/host/webserver/lib/index.js'

const BUNDLE = '/home/node/default/browser-compat-package/lib/client.js'
const PUBLIC = '/app/apps/web/dist'

// 与 dsh 的 web 组合对齐：bootstrap 阶段先加载 modules facade，再按行拉插件。
const ROWS = [
  { kind: 'global', name: '__DSH_BOOT__', value: { rev: 'harness', basePath: '/dsh' } },
  {
    kind: 'script',
    placement: 'body',
    text: 'window.__ModuleLoader__ = (function () { var reg = {}; return { load: function (m) { reg[m.id] = m.factory }, get: function (id) { return reg[id] }, all: reg } })()',
  },
]

// 一个最小 modules 门面：把插件 bundle 注册进模块表，再按真实 Cordis 契约调 apply。
const REACT_BOOT = `
document.write('<script src="/dsh/vendor/react.js"><\\/script>')
document.write('<script src="/dsh/vendor/react-dom.js"><\\/script>')
`
const FACADE = `
window.__ModuleLoader__.load({ id: '__boot__', factory: function () {} })
`

const indexHtml = await readFile('/app/apps/web/dist/index.html', 'utf8')

function page() {
  const simUa = `window.__HARNESS_UA = ${JSON.stringify(process.env.SIM_UA || '')};window.__realHasOwn = Object.hasOwn; try{delete Object.hasOwn}catch(e){}Object.defineProperty(Navigator.prototype,'userAgent',{get:function(){return window.__HARNESS_UA}})`
  let html = indexHtml.replace(/<head(\s[^>]*)?>/i, m => m + '<script>' + simUa + '</script>')
  html = html.replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, '')
  html = html.replace(/<link rel="modulepreload"[^>]*>/, '')
  html = html.replace(/<link rel="stylesheet"[^>]*>/, '')
  return renderIndexInjections(html, [
    { kind: 'script-src', placement: 'head', src: '/dsh/vendor/react.js' },
    { kind: 'script-src', placement: 'head', src: '/dsh/vendor/react-dom.js' },
    ...ROWS,
    { kind: 'script-src', placement: 'body', src: '/dsh/plugins/entry.js' },
  ])
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const path = url.pathname.replace(/^\/dsh/, '') || '/'
  if (path === '/' || path === '/dsh/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(page())
    return
  }
  if (path === '/vendor/react.js' || path === '/vendor/react-dom.js') {
    res.writeHead(200, { 'content-type': 'text/javascript' })
    res.end(await readFile('/tmp/harness/vendor' + path.replace('/vendor', ''), 'utf8'))
    return
  }
  if (path === '/plugins/entry.js') {
    res.writeHead(200, { 'content-type': 'text/javascript' })
    res.end(bundleEntry())
    return
  }
  if (path === '/plugins/compat/client.js') {
    res.writeHead(200, { 'content-type': 'text/javascript' })
    res.end(await readFile(BUNDLE, 'utf8'))
    return
  }
  try {
    const body = await readFile(PUBLIC + path)
    const type = path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : 'application/octet-stream'
    res.writeHead(200, { 'content-type': type })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
})

function bundleEntry() {
  // 入口脚本：注册插件 bundle，然后起一个最小 Cordis 上下文调用 apply，
  // 把它注册进 slots 与 locale —— 只为验证“能不能渲染出来”。
  return `
;(function () {
  // 模拟老内核：删掉现代能力，UA 保持真实内核一致，只看特性探测
  try { delete Object.hasOwn } catch (e) {}
  Object.defineProperty(Navigator.prototype, 'userAgent', {
    get: function () { return window.__HARNESS_UA || navigator.userAgent },
  })
})()
${FACADE}
;(function () {
  var slots = { registered: [] }
  var locale = { registered: [] }
  var dicts = {}
  var s = document.createElement('script')
  s.src = '/dsh/plugins/compat/client.js'
  s.onload = function () {
    var entry = window.__ModuleLoader__.get('@deepseek-ai/dsh-client-ui-browser-compat')
    if (entry === undefined) { console.error('[harness] plugin bundle did not register'); return }
    var React = window.React
    var jsx = { jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment }
    var mod = entry(function (id) { if (id === 'react') return React; if (id === 'react/jsx-runtime') return jsx; throw new Error('unexpected require ' + id) })
    var ctx = {
      effect: function (fn) { fn(); return function () {} },
      locale: {
        register: function (ns, d) { locale.registered.push(ns); dicts[ns] = d },
        bind: function (ns) {
          return function (k, p) {
            var tpl = dicts[ns].zh[k] !== undefined ? dicts[ns].zh[k] : k
            if (!p) return tpl
            return tpl.replace(/[{]([\\w]+)[}]/g, function (m, nm) { return window.__realHasOwn(p, nm) ? String(p[nm]) : m })
          }
        },
      },
      slots: {
        inject: function (name, fn) { fn() },
        register: function (def, Component) {
          slots.registered.push({ name: def.name, id: def.id, Component: Component, def: def })
        },
      },
    }
    try { mod.apply(ctx) } catch (e) { console.error('[harness] apply threw', e); return }
    console.log('[harness] registered: ' + slots.registered.map(function (r) { return r.name + '/' + r.id }).join(', '))
    // 渲染 banner：先跑注入钩子取业务面，再按真实 slots 契约组装 props
    var banner = slots.registered.filter(function (r) { return r.name === 'shell.overlay' })[0]
    if (banner === undefined) { console.error('[harness] no overlay registration'); return }
    var faces = banner.def.inject()
    window.__harnessRawT = function (k, p) { return ctx.locale.bind("browserCompat")(k, p) }
    window.__harnessFaces = function () { return { dismissedSnapshot: faces.hooks ? faces.hooks.dismissed.getSnapshot() : null, keys: Object.keys(faces), hooks: faces.hooks ? Object.keys(faces.hooks) : null, report: faces.hooks ? faces.hooks.report.getSnapshot() : null } }

    var useSource = function (source) {
      return React.useSyncExternalStore(
        function (cb) { return source.subscribe(cb) },
        function () { return source.getSnapshot() },
        function () { return source.getSnapshot() },
      )
    }
    window.__harnessBanner = function () {
      return React.createElement(banner.Component, Object.assign({}, faces, { t: ctx.locale.bind('browserCompat'),
        useReport: function () { return useSource(faces.hooks.report) },
        useDismissed: function () { return useSource(faces.hooks.dismissed) } }))
    }
    var root = document.createElement('div'); root.id = 'harness-root'
    document.body.append(root)
    ReactDOM.createRoot(root).render(window.__harnessBanner())
    console.log('[harness] banner rendered')
  }
  document.head.append(s)
})()
`
}

server.listen(4173, '127.0.0.1', () => console.log('harness on http://127.0.0.1:4173/dsh/'))
