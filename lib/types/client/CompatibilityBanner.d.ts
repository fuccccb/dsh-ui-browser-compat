/**
 * Frame-wide compatibility banner registered into `shell.overlay`.
 *
 * The banner states the one fact the reconnect loop hides: the engine cannot
 * hold the transport, so retrying will not help. It stays dismissible for the
 * session — a visitor who knows the cause should not be nagged.
 */
import type { CompatibilityReport } from './probe.ts';
/** Localized copy the host binds for this surface. */
export interface CompatCopy {
    (key: string, params?: Record<string, string | number>): string;
}
/** Injected business face of the banner. */
export interface CompatBannerInjected {
    /** Take the banner down for this page session. */
    readonly dismiss: () => void;
}
/** Full component props injected by the host render wrapper. */
export interface CompatBannerProps extends CompatBannerInjected {
    /** Current verdict, read through the host's `useReport` hook. */
    readonly report: CompatibilityReport;
    /** Localized copy. */
    readonly t: CompatCopy;
}
/**
 * Render the incompatibility banner.
 * @param props.report - the current verdict.
 * @param props.dismiss - hide the banner for this session.
 * @param props.t - localized copy.
 * @returns the banner, or null when the engine is fine.
 */
export declare function CompatibilityBanner({ report, dismiss, t }: CompatBannerProps): import("react").JSX.Element | null;
//# sourceMappingURL=CompatibilityBanner.d.ts.map