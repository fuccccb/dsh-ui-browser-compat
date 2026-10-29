/** Compatibility diagnostics locale namespace and dictionaries. */

/** Namespace for the banner and the General settings row. */
export const NS = 'browserCompat'

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'banner.title': '当前浏览器内核过旧，无法建立实时连接',
  'banner.engine': '检测到内核：{engine}',
  'banner.engineUnknown': '检测到的内核低于本页要求',
  'banner.missing': '缺失能力：{features}',
  'banner.card': '这个页面能否正常使用，取决于 Via 等外壳浏览器实际调用的 Android System WebView 内核。',
  'banner.step.update': '升级 Android System WebView 到 {version} 以上（设置 → 应用 → Android System WebView → 更新），或直接改用 Chrome / Edge 打开。',
  'banner.step.via': 'Via 自己不带内核，它跟随系统 WebView；把内核从 X5 切到“系统 WebView”也可以尝试。',
  'banner.details': '查看详情',
  'banner.close': '不再提示',
  'row.title': '浏览器兼容性',
  'row.ok': '当前内核满足要求',
  'row.problem': '当前内核低于最低要求，实时连接可能无法建立',
  'row.required': '最低要求：{version} 及以上',
  'row.missing': '缺失能力：{features}',
  'row.copy': '复制诊断信息',
  'row.copied': '已复制',
  'row.copyFailed': '复制失败，请手动选择文本',
  'row.insecure': '当前通过 HTTP 访问非本机地址，部分浏览器会限制该环境下可用的功能。',
  'row.refresh': '重新检测',
  'feature.module-script': 'ES 模块脚本',
  'feature.web-socket': 'WebSocket',
  'feature.promise': 'Promise',
  'feature.fetch': 'fetch',
  'feature.object-has-own': 'Object.hasOwn',
  'feature.class-private-field': '类私有字段',
  'feature.logical-assignment': '逻辑赋值运算符',
  'feature.css-has': 'CSS :has()',
  'feature.css-color-mix': 'CSS color-mix()',
} satisfies Record<string, string>

/** The locale key union. */
export type BrowserCompatKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en: Record<BrowserCompatKey, string> = {
  'banner.title': 'This browser engine is too old to hold the live connection',
  'banner.engine': 'Detected engine: {engine}',
  'banner.engineUnknown': 'The detected engine is below what this page requires',
  'banner.missing': 'Missing: {features}',
  'banner.card': 'Whether this page works depends on the Android System WebView that shell browsers such as Via actually use.',
  'banner.step.update': 'Update Android System WebView to {version} or newer (Settings → Apps → Android System WebView → Update), or open this page in Chrome / Edge.',
  'banner.step.via': 'Via ships no engine of its own and follows the system WebView; switching its engine from X5 to “System WebView” is also worth trying.',
  'banner.details': 'Details',
  'banner.close': 'Do not show again',
  'row.title': 'Browser compatibility',
  'row.ok': 'This engine meets the requirement',
  'row.problem': 'This engine is below the minimum; the live connection may not establish',
  'row.required': 'Requires: {version} or newer',
  'row.missing': 'Missing: {features}',
  'row.copy': 'Copy diagnostics',
  'row.copied': 'Copied',
  'row.copyFailed': 'Copy failed; select the text manually',
  'row.insecure': 'This page is reached over plain HTTP on a non-local host; some browsers restrict features in that context.',
  'row.refresh': 'Re-check',
  'feature.module-script': 'ES module script',
  'feature.web-socket': 'WebSocket',
  'feature.promise': 'Promise',
  'feature.fetch': 'fetch',
  'feature.object-has-own': 'Object.hasOwn',
  'feature.class-private-field': 'Class private fields',
  'feature.logical-assignment': 'Logical assignment operators',
  'feature.css-has': 'CSS :has()',
  'feature.css-color-mix': 'CSS color-mix()',
}
