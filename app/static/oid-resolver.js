((root, factory) => {
  let bundledNames = {};
  if (typeof module === 'object' && module.exports) {
    bundledNames = require('./oids.json');
  } else if (root?.PkiStudioOidNames) {
    bundledNames = root.PkiStudioOidNames;
  }

  const api = factory(bundledNames);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PkiStudioOidResolver = api;
})(typeof globalThis !== 'undefined' ? globalThis : undefined, (bundledNames) => {
  function normalizeNames(names) {
    if (!names) return {};
    if (typeof names !== 'object' || Array.isArray(names)) {
      throw new Error('OID names must be an object keyed by dotted OID strings');
    }
    return names;
  }

  function create(extraNames = {}, options = {}) {
    const baseNames = normalizeNames(options.baseNames || bundledNames);
    const names = Object.freeze({ ...baseNames, ...normalizeNames(extraNames) });

    return Object.freeze({
      names,
      resolve(oid) {
        return names[String(oid)] || '';
      },
      create(nextNames = {}) {
        return create(nextNames, { baseNames: names });
      }
    });
  }

  const defaultResolver = create();

  return Object.freeze({
    names: defaultResolver.names,
    resolve: defaultResolver.resolve,
    create
  });
});
