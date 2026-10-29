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
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { probeCompatibility, type CompatibilityReport } from './probe.ts'
import { NS, en, zh } from './locale.ts'
import { CompatibilityBanner } from './CompatibilityBanner.tsx'
import { CompatSettingsRow } from './CompatSettingsRow.tsx'

/** Cordis plugin name. */
export const name = 'ui-browser-compat'

/**
 * No required services: the plugin registers into slots the shell provides and
 * owns no transport of its own, so it can activate even where the connection
 * services never come up — which is exactly when it is needed.
 */
export const inject: string[] = []

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Compatibility banner and General settings row copy. */
    browserCompat: import('./locale.ts').BrowserCompatKey
  }
}

/**
 * One settled value and its listener set: the bare-observable shape the
 * renderer binds into a `use<Name>` hook.
 */
interface SettledSource<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

/** Create a source holding one settled value. */
function createSource<T>(initial: T): SettledSource<T> & { set(value: T): void } {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => value,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    set: (next: T) => {
      if (next === value) return
      value = next
      for (const listener of listeners) listener()
    },
  }
}

/** Probe a verdict that never claims compatibility outside a document. */
function readReport(): CompatibilityReport {
  if (typeof navigator === 'undefined' || typeof location === 'undefined') {
    return { engine: undefined, incompatible: false, missing: [], present: [], insecureContext: false }
  }
  return probeCompatibility(navigator.userAgent, location)
}

/**
 * Mount the diagnostics banner and its General settings row.
 * @param ctx - client plugin context owning the overlay and settings seats.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-browser-compat: dictionaries')
  const t = ctx.locale.bind(NS) as (key: string, params?: Record<string, string | number>) => string

  const report = createSource<CompatibilityReport>(readReport())
  const dismissed = createSource<boolean>(false)

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'browser-compat.banner',
    locale: NS,
    inject: () => ({
      hooks: { report, dismissed },
      dismiss: () => { dismissed.set(true) },
    }),
  }, function CompatBannerHost(props: {
    useReport: () => CompatibilityReport
    useDismissed: () => boolean
    dismiss: () => void
    t: typeof t
  }) {
    const current = props.useReport()
    const hidden = props.useDismissed()
    if (hidden) return null
    return <CompatibilityBanner report={current} dismiss={props.dismiss} t={props.t} />
  }))

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'browser-compat.diagnostics',
    locale: NS,
    inject: () => ({
      hooks: { report },
      refresh: () => {
        report.set(readReport())
      },
    }),
  }, function CompatRowHost(props: {
    useReport: () => CompatibilityReport
    refresh: () => void
    t: typeof t
  }) {
    const current = props.useReport()
    return <CompatSettingsRow report={current} refresh={props.refresh} t={props.t} />
  }))
}
