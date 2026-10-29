import type { CompatibilityReport } from './probe.ts';
import type { CompatCopy } from './CompatibilityBanner.tsx';
/** Injected business face of the settings row. */
export interface CompatSettingsRowInjected {
    /** Re-run the probes and republish the verdict. */
    readonly refresh: () => void;
}
/** Full component props injected by the host render wrapper. */
export interface CompatSettingsRowProps extends CompatSettingsRowInjected {
    /** Current verdict, read through the host's `useReport` hook. */
    readonly report: CompatibilityReport;
    /** Localized copy. */
    readonly t: CompatCopy;
}
/**
 * Render the compatibility row.
 * @param props - the verdict, its refresh action, and localized copy.
 * @returns the settings row.
 */
export declare function CompatSettingsRow({ report, refresh, t }: CompatSettingsRowProps): import("react").JSX.Element;
//# sourceMappingURL=CompatSettingsRow.d.ts.map