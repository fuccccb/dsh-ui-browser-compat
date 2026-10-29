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
export declare const REQUIRED_CHROME_MAJOR = 93;
/** Capability ids stable enough to key a report row. */
export type CapabilityId = 'module-script' | 'web-socket' | 'promise' | 'fetch' | 'object-has-own' | 'class-private-field' | 'static-class-field' | 'css-has' | 'css-color-mix';
/** One probed capability's verdict. */
export interface CapabilityResult {
    readonly id: CapabilityId;
    readonly since: number;
    readonly supported: boolean;
}
/** The complete diagnostic verdict for the current document. */
export interface CompatibilityReport {
    /** Parsed engine family, when the user agent names one. */
    readonly engine: {
        readonly name: string;
        readonly major: number;
    } | undefined;
    /** True when the engine is below the floor the live transport needs. */
    readonly incompatible: boolean;
    /** Capabilities the running engine failed, in probe order. */
    readonly missing: readonly CapabilityResult[];
    /** Capabilities the running engine passed, in probe order. */
    readonly present: readonly CapabilityResult[];
    /** True when the document visits over plain HTTP on a non-loopback host. */
    readonly insecureContext: boolean;
}
/**
 * Read the engine family and major version from a user-agent string.
 * @param userAgent - the document's user agent.
 * @returns the parsed engine, or undefined when the agent names no family.
 */
export declare function parseEngine(userAgent: string): {
    name: string;
    major: number;
} | undefined;
/**
 * Report whether the document is a secure context the transport may use.
 * @param location - the document location.
 * @returns true for HTTP on a non-loopback host.
 */
export declare function isInsecureTransport(location: {
    protocol: string;
    hostname: string;
}): boolean;
/**
 * Probe the running engine and decide whether it can hold the live connection.
 * @param userAgent - the document's user agent, for the human-readable report.
 * @param location - the document location, for the secure-context note.
 * @returns the complete verdict.
 */
export declare function probeCompatibility(userAgent: string, location: {
    protocol: string;
    hostname: string;
}): CompatibilityReport;
//# sourceMappingURL=probe.d.ts.map