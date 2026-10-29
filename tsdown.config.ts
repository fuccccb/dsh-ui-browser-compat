import { clientBundle } from '/app/packages/client/tsdown.client.ts'

// The preset maps the production `lib/types` shape (tsc output of `src`).
// Realpath keeps the workspace link and this checkout on one package
// identity, so `dsh.client.inject` edges resolve and the module id the
// browser registers matches the row the Graph names.
export default clientBundle(import.meta.dirname, ['lib/types/index.js'])
