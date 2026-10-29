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
export const REQUIRED_CHROME_MAJOR = 93

/** Capability ids stable enough to key a report row. */
export type CapabilityId =
  | 'module-script'
  | 'web-socket'
  | 'promise'
  | 'fetch'
  | 'object-has-own'
  | 'class-private-field'
  | 'static-class-field'
  | 'css-has'
  | 'css-color-mix'

/** One probed capability and the engine floor it implies. */
interface CapabilityProbe {
  /** Stable id, used as the report's row key. */
  readonly id: CapabilityId
  /** Lowest engine major that ships the feature. */
  readonly since: number
  /** Proves the feature at runtime rather than trusting a version string. */
  readonly test: () => boolean
}

/** One probed capability's verdict. */
export interface CapabilityResult {
  readonly id: CapabilityId
  readonly since: number
  readonly supported: boolean
}

/** The complete diagnostic verdict for the current document. */
export interface CompatibilityReport {
  /** Parsed engine family, when the user agent names one. */
  readonly engine: { readonly name: string; readonly major: number } | undefined
  /** True when the engine is below the floor the live transport needs. */
  readonly incompatible: boolean
  /** Capabilities the running engine failed, in probe order. */
  readonly missing: readonly CapabilityResult[]
  /** Capabilities the running engine passed, in probe order. */
  readonly present: readonly CapabilityResult[]
  /** True when the document visits over plain HTTP on a non-loopback host. */
  readonly insecureContext: boolean
}

/**
 * Evaluate an expression the file's own parser must not see.
 * `eval` keeps optional-chaining-era syntax out of the bundle, so an engine
 * that rejects it reports `false` instead of killing the whole module.
 * @param source - self-contained expression producing a boolean.
 * @returns the expression's `true` result, or false on rejection or throw.
 */
function evaluate(source: string): boolean {
  try {
    return eval(source) === true
  } catch (error) {
    return false
  }
}

/**
 * Ask the engine whether it accepts one CSS declaration.
 * @param declaration - probe text, e.g. `color: color-mix(...)`.
 * @returns true when the engine parses the declaration as supported.
 */
function cssSupport(declaration: string): boolean {
  if (typeof CSS === 'object' && CSS !== null && typeof CSS.supports === 'function') {
    try {
      return CSS.supports(declaration) === true
    } catch (error) {
      return false
    }
  }
  return false
}

/** Probe definitions. */
const PROBES: readonly CapabilityProbe[] = [
  { id: 'promise', since: 32, test: function () { return typeof Promise === 'function' } },
  { id: 'fetch', since: 42, test: function () { return typeof fetch === 'function' } },
  { id: 'web-socket', since: 5, test: function () { return typeof WebSocket === 'function' } },
  { id: 'object-has-own', since: 93, test: function () { return typeof Object.hasOwn === 'function' } },
  {
    id: 'class-private-field',
    since: 84,
    test: function () {
      return evaluate('(function () { class A { #x = 1; get() { return this.#x } } return new A().get() === 1 })()')
    },
  },
  {
    id: 'static-class-field',
    since: 72,
    test: function () {
      return evaluate('(function () { class A { static handler = 1 } return A.handler === 1 })()')
    },
  },
  {
    id: 'module-script',
    since: 61,
    test: function () { return typeof Reflect.getOwnPropertyDescriptor === 'function' },
  },
  { id: 'css-has', since: 105, test: function () { return cssSupport('selector(:has(*))') } },
  { id: 'css-color-mix', since: 111, test: function () { return cssSupport('color: color-mix(in srgb, #000 50%, #fff)') } },
]

/** Engine families named by user agents, most specific first. */
const ENGINE_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: 'Edge', pattern: /Edg\/(\d+)/ },
  { name: 'Chrome', pattern: /(?:Chrome|CriOS)\/(\d+)/ },
  { name: 'Firefox', pattern: /(?:Firefox|FxiOS)\/(\d+)/ },
  { name: 'Safari', pattern: /Version\/(\d+)[\d.]* Mobile\/\S+ Safari/ },
]

/** Capabilities the live transport itself cannot do without. */
const TRANSPORT_CRITICAL: readonly CapabilityId[] = [
  'web-socket', 'fetch', 'object-has-own', 'class-private-field', 'static-class-field',
]

/**
 * List the capabilities present in a probe result set.
 * @param results - probed capabilities.
 * @returns the ids that passed.
 */
function supportedIds(results: readonly CapabilityResult[]): CapabilityId[] {
  const ids: CapabilityId[] = []
  for (let index = 0; index < results.length; index += 1) ids.push((results[index] as CapabilityResult).id)
  return ids
}

/**
 * Read the engine family and major version from a user-agent string.
 * @param userAgent - the document's user agent.
 * @returns the parsed engine, or undefined when the agent names no family.
 */
export function parseEngine(userAgent: string): { name: string; major: number } | undefined {
  for (let index = 0; index < ENGINE_PATTERNS.length; index += 1) {
    const entry = ENGINE_PATTERNS[index] as { name: string; pattern: RegExp }
    const match = entry.pattern.exec(userAgent)
    if (match !== null && match[1] !== undefined) {
      return { name: entry.name, major: parseInt(match[1], 10) }
    }
  }
  return undefined
}

/**
 * Report whether the document is a secure context the transport may use.
 * @param location - the document location.
 * @returns true for HTTP on a non-loopback host.
 */
export function isInsecureTransport(location: { protocol: string; hostname: string }): boolean {
  if (location.protocol !== 'http:') return false
  const host = location.hostname
  return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1' && host !== '[::1]'
}

/**
 * Probe the running engine and decide whether it can hold the live connection.
 * @param userAgent - the document's user agent, for the human-readable report.
 * @param location - the document location, for the secure-context note.
 * @returns the complete verdict.
 */
export function probeCompatibility(
  userAgent: string,
  location: { protocol: string; hostname: string },
): CompatibilityReport {
  const missing: CapabilityResult[] = []
  const present: CapabilityResult[] = []
  for (let index = 0; index < PROBES.length; index += 1) {
    const probe = PROBES[index] as CapabilityProbe
    let supported = false
    try {
      supported = probe.test() === true
    } catch (error) {
      supported = false
    }
    const result: CapabilityResult = { id: probe.id, since: probe.since, supported: supported }
    if (supported) present.push(result)
    else missing.push(result)
  }
  const presentIds = supportedIds(present)
  let criticalMissing = false
  for (let index = 0; index < TRANSPORT_CRITICAL.length; index += 1) {
    const id = TRANSPORT_CRITICAL[index] as CapabilityId
    if (presentIds.indexOf(id) === -1) criticalMissing = true
  }
  return {
    engine: parseEngine(userAgent),
    incompatible: criticalMissing,
    missing: missing,
    present: present,
    insecureContext: isInsecureTransport(location),
  }
}
