/**
 * Frame-wide compatibility banner registered into `shell.overlay`.
 *
 * The banner states the one fact the reconnect loop hides: the engine cannot
 * hold the transport, so retrying will not help. It stays dismissible for the
 * session — a visitor who knows the cause should not be nagged.
 */
import type { CapabilityId, CompatibilityReport } from './probe.ts'
import { REQUIRED_CHROME_MAJOR } from './probe.ts'
import css from './CompatibilityBanner.module.css'

/** Localized copy the host binds for this surface. */
export interface CompatCopy {
  (key: string, params?: Record<string, string | number>): string
}

/** Injected business face of the banner. */
export interface CompatBannerInjected {
  /** Take the banner down for this page session. */
  readonly dismiss: () => void
}

/** Full component props injected by the host render wrapper. */
export interface CompatBannerProps extends CompatBannerInjected {
  /** Current verdict, read through the host's `useReport` hook. */
  readonly report: CompatibilityReport
  /** Localized copy. */
  readonly t: CompatCopy
}

/**
 * One engine label for display: `Chrome 92` or the localized fallback.
 * @param report - the current verdict.
 * @param unknown - localized fallback when the agent names no engine.
 * @returns the label text.
 */
function engineLabel(report: CompatibilityReport, unknown: string): string {
  const engine = report.engine
  if (engine === undefined) return unknown
  return engine.name + ' ' + String(engine.major)
}

/**
 * Render the incompatibility banner.
 * @param props.report - the current verdict.
 * @param props.dismiss - hide the banner for this session.
 * @param props.t - localized copy.
 * @returns the banner, or null when the engine is fine.
 */
export function CompatibilityBanner({ report, dismiss, t }: CompatBannerProps) {
  if (!report.incompatible) return null
  const features = report.missing
    .map((result: { id: CapabilityId }) => t('feature.' + result.id))
    .join('、')
  const unknown = t('banner.engineUnknown')
  const label = engineLabel(report, unknown)
  return (
    <div className={css.layer} data-browser-compat-banner="">
      <div className={css.banner} role="alert">
        <div className={css.icon} aria-hidden="true">!</div>
        <div className={css.body}>
          <div className={css.title}>{t('banner.title')}</div>
          <div className={css.meta}>
            {label === unknown ? unknown : t('banner.engine', { engine: label })}
            {features === '' ? null : <span className={css.missing}>{t('banner.missing', { features })}</span>}
          </div>
          <div className={css.step}>{t('banner.step.update', { version: String(REQUIRED_CHROME_MAJOR) })}</div>
          <div className={css.step}>{t('banner.step.via')}</div>
        </div>
        <div className={css.actions}>
          <button type="button" className={css.action} onClick={dismiss}>{t('banner.close')}</button>
        </div>
      </div>
    </div>
  )
}
