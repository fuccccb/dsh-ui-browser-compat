/**
 * Browser compatibility diagnostics.
 *
 * The Web client's live transport needs an engine modern enough to parse the
 * plugin bundles it fetches at runtime. An older engine (an Android WebView
 * behind a shell browser such as Via) loads the shell, mounts the UI, and then
 * fails on those bundles — which the user sees as a permanent "Reconnecting".
 *
 * This plugin turns that silent failure into a statement of cause: it probes
 * the running engine, names the missing capabilities, and pairs them with the
 * action that fixes them. It never replaces the transport and never claims the
 * engine is fine when the probes say otherwise.
 *
 * @module @deepseek-ai/dsh-client-ui-browser-compat/client
 */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis plugin name. */
export declare const name = "ui-browser-compat";
/**
 * No required services: the plugin registers into slots the shell provides and
 * owns no transport of its own, so it can activate even where the connection
 * services never come up — which is exactly when it is needed.
 */
export declare const inject: string[];
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Compatibility banner and General settings row copy. */
        browserCompat: import('./locale.ts').BrowserCompatKey;
    }
}
/**
 * Mount the diagnostics banner and its General settings row.
 * @param ctx - client plugin context owning the overlay and settings seats.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map