/** Compatibility diagnostics locale namespace and dictionaries. */
/** Namespace for the banner and the General settings row. */
export declare const NS = "browserCompat";
/** Simplified Chinese dictionary and key-set source of truth. */
export declare const zh: {
    'banner.title': string;
    'banner.engine': string;
    'banner.engineUnknown': string;
    'banner.missing': string;
    'banner.card': string;
    'banner.step.update': string;
    'banner.step.via': string;
    'banner.details': string;
    'banner.close': string;
    'row.title': string;
    'row.ok': string;
    'row.problem': string;
    'row.required': string;
    'row.missing': string;
    'row.copy': string;
    'row.copied': string;
    'row.copyFailed': string;
    'row.insecure': string;
    'row.refresh': string;
    'feature.module-script': string;
    'feature.web-socket': string;
    'feature.promise': string;
    'feature.fetch': string;
    'feature.object-has-own': string;
    'feature.class-private-field': string;
    'feature.logical-assignment': string;
    'feature.css-has': string;
    'feature.css-color-mix': string;
};
/** The locale key union. */
export type BrowserCompatKey = keyof typeof zh;
/** English dictionary, checked complete against the zh key set. */
export declare const en: Record<BrowserCompatKey, string>;
//# sourceMappingURL=locale.d.ts.map