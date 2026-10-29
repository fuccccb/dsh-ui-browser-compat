/**
 * General Settings row for compatibility diagnostics.
 *
 * The row is the durable half of the feature: the banner is dismissible, the
 * row always answers "why does this page not work?" with the probed capability
 * list, the engine floor, and a copyable report for support threads.
 */
import { useState } from 'react'
import type { CapabilityId, CompatibilityReport } from './probe.ts'
import { REQUIRED_CHROME_MAJOR } from './probe.ts'
import type { CompatCopy } from './CompatibilityBanner.tsx'
import css from './CompatSettingsRow.module.css'

/** Injected business face of the settings row. */
export interface CompatSettingsRowInjected {
  /** Re-run the probes and republish the verdict. */
  readonly refresh: () => void
}

/** Full component props injected by the host render wrapper. */
export interface CompatSettingsRowProps extends CompatSettingsRowInjected {
  /** Current verdict, read through the host's `useReport` hook. */
  readonly report: CompatibilityReport
  /** Localized copy. */
  readonly t: CompatCopy
}

/**
 * One copyable diagnostics report.
 * @param report - the current verdict.
 * @returns multi-line plain text.
 */
function reportText(report: CompatibilityReport): string {
  const engine = report.engine
  const missing = report.missing.length === 0
    ? 'none'
    : report.missing.map(r => r.id + '(>=' + String(r.since) + ')').join(', ')
  return [
    'engine: ' + (engine === undefined ? 'unknown' : engine.name + ' ' + String(engine.major)),
    'required: Chrome ' + String(REQUIRED_CHROME_MAJOR) + '+',
    'compatible: ' + (report.incompatible ? 'no' : 'yes'),
    'missing: ' + missing,
    'insecure-context: ' + String(report.insecureContext),
    'user-agent: ' + (typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent),
  ].join('\n')
}

/**
 * Render the compatibility row.
 * @param props - the verdict, its refresh action, and localized copy.
 * @returns the settings row.
 */
export function CompatSettingsRow({ report, refresh, t }: CompatSettingsRowProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const features = report.missing
    .map((result: { id: CapabilityId }) => t('feature.' + result.id))
    .join('、')
  const copy = (): void => {
    const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
    if (clipboard === undefined) {
      setCopyState('failed')
      return
    }
    void clipboard.writeText(reportText(report)).then(
      () => { setCopyState('copied') },
      () => { setCopyState('failed') },
    )
  }
  return (
    <div className={css.row} data-browser-compat-row="">
      <div className={css.rowText}>
        <div className={css.title}>{t('row.title')}</div>
        <div className={report.incompatible ? css.problem : css.ok}>
          {report.incompatible ? t('row.problem') : t('row.ok')}
        </div>
        <div className={css.detail}>{t('row.required', { version: String(REQUIRED_CHROME_MAJOR) })}</div>
        {report.incompatible && features !== ''
          ? <div className={css.detail}>{t('row.missing', { features })}</div>
          : null}
        {report.insecureContext ? <div className={css.detail}>{t('row.insecure')}</div> : null}
      </div>
      <div className={css.actions}>
        <button type="button" className={css.action} onClick={refresh}>{t('row.refresh')}</button>
        <button type="button" className={css.action} onClick={copy}>
          {copyState === 'copied' ? t('row.copied') : copyState === 'failed' ? t('row.copyFailed') : t('row.copy')}
        </button>
      </div>
    </div>
  )
}
