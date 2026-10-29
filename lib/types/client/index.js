import { jsx as _jsx } from "react/jsx-runtime";
import { probeCompatibility } from "./probe.js";
import { NS, en, zh } from "./locale.js";
import { CompatibilityBanner } from "./CompatibilityBanner.js";
import { CompatSettingsRow } from "./CompatSettingsRow.js";
/** Cordis plugin name. */
export const name = 'ui-browser-compat';
/**
 * No required services: the plugin registers into slots the shell provides and
 * owns no transport of its own, so it can activate even where the connection
 * services never come up — which is exactly when it is needed.
 */
export const inject = [];
/** Create a source holding one settled value. */
function createSource(initial) {
    let value = initial;
    const listeners = new Set();
    return {
        getSnapshot: () => value,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        set: (next) => {
            if (next === value)
                return;
            value = next;
            for (const listener of listeners)
                listener();
        },
    };
}
/** Probe a verdict that never claims compatibility outside a document. */
function readReport() {
    if (typeof navigator === 'undefined' || typeof location === 'undefined') {
        return { engine: undefined, incompatible: false, missing: [], present: [], insecureContext: false };
    }
    return probeCompatibility(navigator.userAgent, location);
}
/**
 * Mount the diagnostics banner and its General settings row.
 * @param ctx - client plugin context owning the overlay and settings seats.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-browser-compat: dictionaries');
    const t = ctx.locale.bind(NS);
    const report = createSource(readReport());
    const dismissed = createSource(false);
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'browser-compat.banner',
        locale: NS,
        inject: () => ({
            hooks: { report, dismissed },
            dismiss: () => { dismissed.set(true); },
        }),
    }, function CompatBannerHost(props) {
        const current = props.useReport();
        const hidden = props.useDismissed();
        if (hidden)
            return null;
        return _jsx(CompatibilityBanner, { report: current, dismiss: props.dismiss, t: props.t });
    }));
    ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'browser-compat.diagnostics',
        locale: NS,
        inject: () => ({
            hooks: { report },
            refresh: () => {
                report.set(readReport());
            },
        }),
    }, function CompatRowHost(props) {
        const current = props.useReport();
        return _jsx(CompatSettingsRow, { report: current, refresh: props.refresh, t: props.t });
    }));
}
//# sourceMappingURL=index.js.map