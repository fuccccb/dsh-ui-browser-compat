import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { REQUIRED_CHROME_MAJOR } from "./probe.js";
import css from './CompatibilityBanner.module.css';
/**
 * One engine label for display: `Chrome 92` or the localized fallback.
 * @param report - the current verdict.
 * @param unknown - localized fallback when the agent names no engine.
 * @returns the label text.
 */
function engineLabel(report, unknown) {
    const engine = report.engine;
    if (engine === undefined)
        return unknown;
    return engine.name + ' ' + String(engine.major);
}
/**
 * Render the incompatibility banner.
 * @param props.report - the current verdict.
 * @param props.dismiss - hide the banner for this session.
 * @param props.t - localized copy.
 * @returns the banner, or null when the engine is fine.
 */
export function CompatibilityBanner({ report, dismiss, t }) {
    if (!report.incompatible)
        return null;
    const features = report.missing
        .map((result) => t('feature.' + result.id))
        .join('、');
    const unknown = t('banner.engineUnknown');
    const label = engineLabel(report, unknown);
    return (_jsx("div", { className: css.layer, "data-browser-compat-banner": "", children: _jsxs("div", { className: css.banner, role: "alert", children: [_jsx("div", { className: css.icon, "aria-hidden": "true", children: "!" }), _jsxs("div", { className: css.body, children: [_jsx("div", { className: css.title, children: t('banner.title') }), _jsxs("div", { className: css.meta, children: [label === unknown ? unknown : t('banner.engine', { engine: label }), features === '' ? null : _jsx("span", { className: css.missing, children: t('banner.missing', { features }) })] }), _jsx("div", { className: css.step, children: t('banner.step.update', { version: String(REQUIRED_CHROME_MAJOR) }) }), _jsx("div", { className: css.step, children: t('banner.step.via') })] }), _jsx("div", { className: css.actions, children: _jsx("button", { type: "button", className: css.action, onClick: dismiss, children: t('banner.close') }) })] }) }));
}
//# sourceMappingURL=CompatibilityBanner.js.map