window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-browser-compat",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region lib/types/client/probe.js
		/**
		* Engine-capability probe for the Web client.
		*
		* Why this module avoids modern syntax: the visitor this plugin exists for
		* runs an engine old enough that the product's own bundles may fail to parse.
		* A diagnostic that is itself unparseable is worthless, so this file stays
		* parseable by a 2015-era engine. ES module output necessarily keeps `import`
		* and `const` (the plugin bundle's own target owns that layer), but it carries
		* no optional chaining, no nullish/logical assignment, no arrow functions, no
		* template literals, and no `Array.prototype.includes`.
		*
		* @module @deepseek-ai/dsh-client-ui-browser-compat/src/client/probe
		*/
		/** The engine floor the Web client's live transport actually needs. */
		const REQUIRED_CHROME_MAJOR = 93;
		/**
		* Evaluate an expression the file's own parser must not see.
		* `eval` keeps optional-chaining-era syntax out of the bundle, so an engine
		* that rejects it reports `false` instead of killing the whole module.
		* @param source - self-contained expression producing a boolean.
		* @returns the expression's `true` result, or false on rejection or throw.
		*/
		function evaluate(source) {
			try {
				return eval(source) === true;
			} catch (error) {
				return false;
			}
		}
		/**
		* Ask the engine whether it accepts one CSS declaration.
		* @param declaration - probe text, e.g. `color: color-mix(...)`.
		* @returns true when the engine parses the declaration as supported.
		*/
		function cssSupport(declaration) {
			if (typeof CSS === "object" && CSS !== null && typeof CSS.supports === "function") try {
				return CSS.supports(declaration) === true;
			} catch (error) {
				return false;
			}
			return false;
		}
		/** Probe definitions. */
		const PROBES = [
			{
				id: "promise",
				since: 32,
				test: function() {
					return typeof Promise === "function";
				}
			},
			{
				id: "fetch",
				since: 42,
				test: function() {
					return typeof fetch === "function";
				}
			},
			{
				id: "web-socket",
				since: 5,
				test: function() {
					return typeof WebSocket === "function";
				}
			},
			{
				id: "object-has-own",
				since: 93,
				test: function() {
					return typeof Object.hasOwn === "function";
				}
			},
			{
				id: "class-private-field",
				since: 84,
				test: function() {
					return evaluate("(function () { class A { #x = 1; get() { return this.#x } } return new A().get() === 1 })()");
				}
			},
			{
				id: "static-class-field",
				since: 72,
				test: function() {
					return evaluate("(function () { class A { static handler = 1 } return A.handler === 1 })()");
				}
			},
			{
				id: "module-script",
				since: 61,
				test: function() {
					return typeof Reflect.getOwnPropertyDescriptor === "function";
				}
			},
			{
				id: "css-has",
				since: 105,
				test: function() {
					return cssSupport("selector(:has(*))");
				}
			},
			{
				id: "css-color-mix",
				since: 111,
				test: function() {
					return cssSupport("color: color-mix(in srgb, #000 50%, #fff)");
				}
			}
		];
		/** Engine families named by user agents, most specific first. */
		const ENGINE_PATTERNS = [
			{
				name: "Edge",
				pattern: /Edg\/(\d+)/
			},
			{
				name: "Chrome",
				pattern: /(?:Chrome|CriOS)\/(\d+)/
			},
			{
				name: "Firefox",
				pattern: /(?:Firefox|FxiOS)\/(\d+)/
			},
			{
				name: "Safari",
				pattern: /Version\/(\d+)[\d.]* Mobile\/\S+ Safari/
			}
		];
		/** Capabilities the live transport itself cannot do without. */
		const TRANSPORT_CRITICAL = [
			"web-socket",
			"fetch",
			"object-has-own",
			"class-private-field",
			"static-class-field"
		];
		/**
		* List the capabilities present in a probe result set.
		* @param results - probed capabilities.
		* @returns the ids that passed.
		*/
		function supportedIds(results) {
			const ids = [];
			for (let index = 0; index < results.length; index += 1) ids.push(results[index].id);
			return ids;
		}
		/**
		* Read the engine family and major version from a user-agent string.
		* @param userAgent - the document's user agent.
		* @returns the parsed engine, or undefined when the agent names no family.
		*/
		function parseEngine(userAgent) {
			for (let index = 0; index < ENGINE_PATTERNS.length; index += 1) {
				const entry = ENGINE_PATTERNS[index];
				const match = entry.pattern.exec(userAgent);
				if (match !== null && match[1] !== void 0) return {
					name: entry.name,
					major: parseInt(match[1], 10)
				};
			}
		}
		/**
		* Report whether the document is a secure context the transport may use.
		* @param location - the document location.
		* @returns true for HTTP on a non-loopback host.
		*/
		function isInsecureTransport(location) {
			if (location.protocol !== "http:") return false;
			const host = location.hostname;
			return host !== "localhost" && host !== "127.0.0.1" && host !== "::1" && host !== "[::1]";
		}
		/**
		* Probe the running engine and decide whether it can hold the live connection.
		* @param userAgent - the document's user agent, for the human-readable report.
		* @param location - the document location, for the secure-context note.
		* @returns the complete verdict.
		*/
		function probeCompatibility(userAgent, location) {
			const missing = [];
			const present = [];
			for (let index = 0; index < PROBES.length; index += 1) {
				const probe = PROBES[index];
				let supported = false;
				try {
					supported = probe.test() === true;
				} catch (error) {
					supported = false;
				}
				const result = {
					id: probe.id,
					since: probe.since,
					supported
				};
				if (supported) present.push(result);
				else missing.push(result);
			}
			const presentIds = supportedIds(present);
			let criticalMissing = false;
			for (let index = 0; index < TRANSPORT_CRITICAL.length; index += 1) {
				const id = TRANSPORT_CRITICAL[index];
				if (presentIds.indexOf(id) === -1) criticalMissing = true;
			}
			return {
				engine: parseEngine(userAgent),
				incompatible: criticalMissing,
				missing,
				present,
				insecureContext: isInsecureTransport(location)
			};
		}
		//#endregion
		//#region lib/types/client/locale.js
		/** Compatibility diagnostics locale namespace and dictionaries. */
		/** Namespace for the banner and the General settings row. */
		const NS = "browserCompat";
		/** Simplified Chinese dictionary and key-set source of truth. */
		const zh = {
			"banner.title": "当前浏览器内核过旧，无法建立实时连接",
			"banner.engine": "检测到内核：{engine}",
			"banner.engineUnknown": "检测到的内核低于本页要求",
			"banner.missing": "缺失能力：{features}",
			"banner.card": "这个页面能否正常使用，取决于 Via 等外壳浏览器实际调用的 Android System WebView 内核。",
			"banner.step.update": "升级 Android System WebView 到 {version} 以上（设置 → 应用 → Android System WebView → 更新），或直接改用 Chrome / Edge 打开。",
			"banner.step.via": "Via 自己不带内核，它跟随系统 WebView；把内核从 X5 切到“系统 WebView”也可以尝试。",
			"banner.details": "查看详情",
			"banner.close": "不再提示",
			"row.title": "浏览器兼容性",
			"row.ok": "当前内核满足要求",
			"row.problem": "当前内核低于最低要求，实时连接可能无法建立",
			"row.required": "最低要求：{version} 及以上",
			"row.missing": "缺失能力：{features}",
			"row.copy": "复制诊断信息",
			"row.copied": "已复制",
			"row.copyFailed": "复制失败，请手动选择文本",
			"row.insecure": "当前通过 HTTP 访问非本机地址，部分浏览器会限制该环境下可用的功能。",
			"row.refresh": "重新检测",
			"feature.module-script": "ES 模块脚本",
			"feature.web-socket": "WebSocket",
			"feature.promise": "Promise",
			"feature.fetch": "fetch",
			"feature.object-has-own": "Object.hasOwn",
			"feature.class-private-field": "类私有字段",
			"feature.logical-assignment": "逻辑赋值运算符",
			"feature.css-has": "CSS :has()",
			"feature.css-color-mix": "CSS color-mix()"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"banner.title": "This browser engine is too old to hold the live connection",
			"banner.engine": "Detected engine: {engine}",
			"banner.engineUnknown": "The detected engine is below what this page requires",
			"banner.missing": "Missing: {features}",
			"banner.card": "Whether this page works depends on the Android System WebView that shell browsers such as Via actually use.",
			"banner.step.update": "Update Android System WebView to {version} or newer (Settings → Apps → Android System WebView → Update), or open this page in Chrome / Edge.",
			"banner.step.via": "Via ships no engine of its own and follows the system WebView; switching its engine from X5 to “System WebView” is also worth trying.",
			"banner.details": "Details",
			"banner.close": "Do not show again",
			"row.title": "Browser compatibility",
			"row.ok": "This engine meets the requirement",
			"row.problem": "This engine is below the minimum; the live connection may not establish",
			"row.required": "Requires: {version} or newer",
			"row.missing": "Missing: {features}",
			"row.copy": "Copy diagnostics",
			"row.copied": "Copied",
			"row.copyFailed": "Copy failed; select the text manually",
			"row.insecure": "This page is reached over plain HTTP on a non-local host; some browsers restrict features in that context.",
			"row.refresh": "Re-check",
			"feature.module-script": "ES module script",
			"feature.web-socket": "WebSocket",
			"feature.promise": "Promise",
			"feature.fetch": "fetch",
			"feature.object-has-own": "Object.hasOwn",
			"feature.class-private-field": "Class private fields",
			"feature.logical-assignment": "Logical assignment operators",
			"feature.css-has": "CSS :has()",
			"feature.css-color-mix": "CSS color-mix()"
		};
		//#endregion
		//#region \0dsh-css:/home/node/default/browser-compat-package/src/client/CompatibilityBanner.module.css.mjs
		const css$1 = ".dF_Ttq_layer{pointer-events:none;z-index:3;justify-content:center;padding:8px 12px 0;display:flex;position:absolute;inset:0 0 auto}.dF_Ttq_banner{pointer-events:auto;box-sizing:border-box;border:.5px solid var(--dsw-alias-state-warn-primary);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-state-warn-tertiary);width:100%;max-width:720px;color:var(--dsw-alias-state-warn-label);align-items:flex-start;gap:10px;padding:10px 12px;display:flex;box-shadow:0 4px 16px #0000001f}.dF_Ttq_icon{background:var(--dsw-alias-state-warn-primary);width:18px;height:18px;color:var(--dsw-alias-label-primary-foreground);text-align:center;border-radius:50%;flex:none;margin-top:2px;font-size:12px;font-weight:600;line-height:18px}.dF_Ttq_body{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.dF_Ttq_title{font-size:13px;font-weight:600;line-height:20px}.dF_Ttq_meta{opacity:.9;flex-wrap:wrap;gap:6px;font-size:12px;line-height:18px;display:flex}.dF_Ttq_missing{overflow-wrap:anywhere}.dF_Ttq_step{overflow-wrap:anywhere;font-size:12px;line-height:18px}.dF_Ttq_actions{flex:none;align-items:center;gap:4px;display:flex}.dF_Ttq_action{border-radius:var(--dsw-radius-sm);height:24px;color:inherit;font:inherit;cursor:pointer;opacity:.8;background:0 0;border:none;padding:0 8px;font-size:12px;line-height:18px}.dF_Ttq_action:hover{opacity:1;background:var(--dsw-alias-button-ghost-active-fill)}@media (width<=560px){.dF_Ttq_banner{flex-wrap:wrap}.dF_Ttq_actions{justify-content:flex-end;width:100%}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-browser-compat/CompatibilityBanner.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-browser-compat";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var CompatibilityBanner_module_css_default = {
			"action": "dF_Ttq_action",
			"actions": "dF_Ttq_actions",
			"banner": "dF_Ttq_banner",
			"body": "dF_Ttq_body",
			"icon": "dF_Ttq_icon",
			"layer": "dF_Ttq_layer",
			"meta": "dF_Ttq_meta",
			"missing": "dF_Ttq_missing",
			"step": "dF_Ttq_step",
			"title": "dF_Ttq_title"
		};
		//#endregion
		//#region lib/types/client/CompatibilityBanner.js
		/**
		* One engine label for display: `Chrome 92` or the localized fallback.
		* @param report - the current verdict.
		* @param unknown - localized fallback when the agent names no engine.
		* @returns the label text.
		*/
		function engineLabel(report, unknown) {
			const engine = report.engine;
			if (engine === void 0) return unknown;
			return engine.name + " " + String(engine.major);
		}
		/**
		* Render the incompatibility banner.
		* @param props.report - the current verdict.
		* @param props.dismiss - hide the banner for this session.
		* @param props.t - localized copy.
		* @returns the banner, or null when the engine is fine.
		*/
		function CompatibilityBanner({ report, dismiss, t }) {
			if (!report.incompatible) return null;
			const features = report.missing.map((result) => t("feature." + result.id)).join("、");
			const unknown = t("banner.engineUnknown");
			const label = engineLabel(report, unknown);
			return (0, react_jsx_runtime.jsx)("div", {
				className: CompatibilityBanner_module_css_default.layer,
				"data-browser-compat-banner": "",
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: CompatibilityBanner_module_css_default.banner,
					role: "alert",
					children: [
						(0, react_jsx_runtime.jsx)("div", {
							className: CompatibilityBanner_module_css_default.icon,
							"aria-hidden": "true",
							children: "!"
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: CompatibilityBanner_module_css_default.body,
							children: [
								(0, react_jsx_runtime.jsx)("div", {
									className: CompatibilityBanner_module_css_default.title,
									children: t("banner.title")
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: CompatibilityBanner_module_css_default.meta,
									children: [label === unknown ? unknown : t("banner.engine", { engine: label }), features === "" ? null : (0, react_jsx_runtime.jsx)("span", {
										className: CompatibilityBanner_module_css_default.missing,
										children: t("banner.missing", { features })
									})]
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: CompatibilityBanner_module_css_default.step,
									children: t("banner.step.update", { version: String(93) })
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: CompatibilityBanner_module_css_default.step,
									children: t("banner.step.via")
								})
							]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: CompatibilityBanner_module_css_default.actions,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: CompatibilityBanner_module_css_default.action,
								onClick: dismiss,
								children: t("banner.close")
							})
						})
					]
				})
			});
		}
		//#endregion
		//#region \0dsh-css:/home/node/default/browser-compat-package/src/client/CompatSettingsRow.module.css.mjs
		const css = "._0LZnJq_row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}._0LZnJq_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:24px;display:flex}._0LZnJq_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}._0LZnJq_ok,._0LZnJq_problem,._0LZnJq_detail{overflow-wrap:anywhere;font-size:12px;line-height:18px}._0LZnJq_ok{color:var(--dsw-alias-state-success-primary)}._0LZnJq_problem{color:var(--dsw-alias-state-error-primary)}._0LZnJq_detail{color:var(--dsw-alias-label-caption)}._0LZnJq_actions{flex:none;align-items:center;gap:4px;display:flex}._0LZnJq_action{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);height:28px;color:var(--dsw-alias-label-primary);font:inherit;white-space:nowrap;cursor:pointer;background:0 0;padding:0 10px;font-size:12px;line-height:18px}._0LZnJq_action:hover{background:var(--dsw-alias-interactive-bg-hover)}";
		const tagId = "@deepseek-ai/dsh-client-ui-browser-compat/CompatSettingsRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-browser-compat";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var CompatSettingsRow_module_css_default = {
			"action": "_0LZnJq_action",
			"actions": "_0LZnJq_actions",
			"detail": "_0LZnJq_detail",
			"ok": "_0LZnJq_ok",
			"problem": "_0LZnJq_problem",
			"row": "_0LZnJq_row",
			"rowText": "_0LZnJq_rowText",
			"title": "_0LZnJq_title"
		};
		//#endregion
		//#region lib/types/client/CompatSettingsRow.js
		/**
		* General Settings row for compatibility diagnostics.
		*
		* The row is the durable half of the feature: the banner is dismissible, the
		* row always answers "why does this page not work?" with the probed capability
		* list, the engine floor, and a copyable report for support threads.
		*/
		/**
		* One copyable diagnostics report.
		* @param report - the current verdict.
		* @returns multi-line plain text.
		*/
		function reportText(report) {
			const engine = report.engine;
			const missing = report.missing.length === 0 ? "none" : report.missing.map((r) => r.id + "(>=" + String(r.since) + ")").join(", ");
			return [
				"engine: " + (engine === void 0 ? "unknown" : engine.name + " " + String(engine.major)),
				"required: Chrome " + String(93) + "+",
				"compatible: " + (report.incompatible ? "no" : "yes"),
				"missing: " + missing,
				"insecure-context: " + String(report.insecureContext),
				"user-agent: " + (typeof navigator === "undefined" ? "unknown" : navigator.userAgent)
			].join("\n");
		}
		/**
		* Render the compatibility row.
		* @param props - the verdict, its refresh action, and localized copy.
		* @returns the settings row.
		*/
		function CompatSettingsRow({ report, refresh, t }) {
			const [copyState, setCopyState] = (0, react.useState)("idle");
			const features = report.missing.map((result) => t("feature." + result.id)).join("、");
			const copy = () => {
				const clipboard = typeof navigator === "undefined" ? void 0 : navigator.clipboard;
				if (clipboard === void 0) {
					setCopyState("failed");
					return;
				}
				clipboard.writeText(reportText(report)).then(() => {
					setCopyState("copied");
				}, () => {
					setCopyState("failed");
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CompatSettingsRow_module_css_default.row,
				"data-browser-compat-row": "",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: CompatSettingsRow_module_css_default.rowText,
					children: [
						(0, react_jsx_runtime.jsx)("div", {
							className: CompatSettingsRow_module_css_default.title,
							children: t("row.title")
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: report.incompatible ? CompatSettingsRow_module_css_default.problem : CompatSettingsRow_module_css_default.ok,
							children: report.incompatible ? t("row.problem") : t("row.ok")
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: CompatSettingsRow_module_css_default.detail,
							children: t("row.required", { version: String(93) })
						}),
						report.incompatible && features !== "" ? (0, react_jsx_runtime.jsx)("div", {
							className: CompatSettingsRow_module_css_default.detail,
							children: t("row.missing", { features })
						}) : null,
						report.insecureContext ? (0, react_jsx_runtime.jsx)("div", {
							className: CompatSettingsRow_module_css_default.detail,
							children: t("row.insecure")
						}) : null
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: CompatSettingsRow_module_css_default.actions,
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: CompatSettingsRow_module_css_default.action,
						onClick: refresh,
						children: t("row.refresh")
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: CompatSettingsRow_module_css_default.action,
						onClick: copy,
						children: copyState === "copied" ? t("row.copied") : copyState === "failed" ? t("row.copyFailed") : t("row.copy")
					})]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Cordis plugin name. */
		const name = "ui-browser-compat";
		/**
		* No required services: the plugin registers into slots the shell provides and
		* owns no transport of its own, so it can activate even where the connection
		* services never come up — which is exactly when it is needed.
		*/
		const inject = [];
		/** Create a source holding one settled value. */
		function createSource(initial) {
			let value = initial;
			const listeners = /* @__PURE__ */ new Set();
			return {
				getSnapshot: () => value,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				set: (next) => {
					if (next === value) return;
					value = next;
					for (const listener of listeners) listener();
				}
			};
		}
		/** Probe a verdict that never claims compatibility outside a document. */
		function readReport() {
			if (typeof navigator === "undefined" || typeof location === "undefined") return {
				engine: void 0,
				incompatible: false,
				missing: [],
				present: [],
				insecureContext: false
			};
			return probeCompatibility(navigator.userAgent, location);
		}
		/**
		* Mount the diagnostics banner and its General settings row.
		* @param ctx - client plugin context owning the overlay and settings seats.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-browser-compat: dictionaries");
			ctx.locale.bind(NS);
			const report = createSource(readReport());
			const dismissed = createSource(false);
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "browser-compat.banner",
				locale: NS,
				inject: () => ({
					hooks: {
						report,
						dismissed
					},
					dismiss: () => {
						dismissed.set(true);
					}
				})
			}, function CompatBannerHost(props) {
				const current = props.useReport();
				if (props.useDismissed()) return null;
				return (0, react_jsx_runtime.jsx)(CompatibilityBanner, {
					report: current,
					dismiss: props.dismiss,
					t: props.t
				});
			}));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "browser-compat.diagnostics",
				locale: NS,
				inject: () => ({
					hooks: { report },
					refresh: () => {
						report.set(readReport());
					}
				})
			}, function CompatRowHost(props) {
				return (0, react_jsx_runtime.jsx)(CompatSettingsRow, {
					report: props.useReport(),
					refresh: props.refresh,
					t: props.t
				});
			}));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map