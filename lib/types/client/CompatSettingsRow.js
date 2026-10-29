import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * General Settings row for compatibility diagnostics.
 *
 * The row is the durable half of the feature: the banner is dismissible, the
 * row always answers "why does this page not work?" with the probed capability
 * list, the engine floor, and a copyable report for support threads.
 */
import { useState } from 'react';
import { REQUIRED_CHROME_MAJOR } from "./probe.js";
import css from './CompatSettingsRow.module.css';
/**
 * One copyable diagnostics report.
 * @param report - the current verdict.
 * @returns multi-line plain text.
 */
function reportText(report) {
    const engine = report.engine;
    const missing = report.missing.length === 0
        ? 'none'
        : report.missing.map(r => r.id + '(>=' + String(r.since) + ')').join(', ');
    return [
        'engine: ' + (engine === undefined ? 'unknown' : engine.name + ' ' + String(engine.major)),
        'required: Chrome ' + String(REQUIRED_CHROME_MAJOR) + '+',
        'compatible: ' + (report.incompatible ? 'no' : 'yes'),
        'missing: ' + missing,
        'insecure-context: ' + String(report.insecureContext),
        'user-agent: ' + (typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent),
    ].join('\n');
}
/**
 * Render the compatibility row.
 * @param props - the verdict, its refresh action, and localized copy.
 * @returns the settings row.
 */
export function CompatSettingsRow({ report, refresh, t }) {
    const [copyState, setCopyState] = useState('idle');
    const features = report.missing
        .map((result) => t('feature.' + result.id))
        .join('、');
    const copy = () => {
        const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
        if (clipboard === undefined) {
            setCopyState('failed');
            return;
        }
        void clipboard.writeText(reportText(report)).then(() => { setCopyState('copied'); }, () => { setCopyState('failed'); });
    };
    return (_jsxs("div", { className: css.row, "data-browser-compat-row": "", children: [_jsxs("div", { className: css.rowText, children: [_jsx("div", { className: css.title, children: t('row.title') }), _jsx("div", { className: report.incompatible ? css.problem : css.ok, children: report.incompatible ? t('row.problem') : t('row.ok') }), _jsx("div", { className: css.detail, children: t('row.required', { version: String(REQUIRED_CHROME_MAJOR) }) }), report.incompatible && features !== ''
                        ? _jsx("div", { className: css.detail, children: t('row.missing', { features }) })
                        : null, report.insecureContext ? _jsx("div", { className: css.detail, children: t('row.insecure') }) : null] }), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", className: css.action, onClick: refresh, children: t('row.refresh') }), _jsx("button", { type: "button", className: css.action, onClick: copy, children: copyState === 'copied' ? t('row.copied') : copyState === 'failed' ? t('row.copyFailed') : t('row.copy') })] })] }));
}
//# sourceMappingURL=CompatSettingsRow.js.map