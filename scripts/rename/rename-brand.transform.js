/**
 * jscodeshift transform: Rename Strapi -> Metrix in code.
 */

const PACKAGE_SCOPE_FROM = '@metrix/';
const PACKAGE_SCOPE_TO = '@metrix/';
const SPECIAL_FROM = '@metrix/metrix';
const SPECIAL_TO = '@metrix/metrix';

const renameImportSource = (value) => {
  if (value === SPECIAL_FROM) return SPECIAL_TO;
  if (typeof value === 'string' && value.startsWith(PACKAGE_SCOPE_FROM)) {
    return PACKAGE_SCOPE_TO + value.slice(PACKAGE_SCOPE_FROM.length);
  }
  if (typeof value === 'string' && value.includes('/metrix/')) {
    return value.replaceAll('/metrix/', '/metrix/');
  }
  return value;
};

const transformImportSources = (root, j) => {
  root.find(j.ImportDeclaration).forEach((p) => {
    const src = p.value.source && p.value.source.value;
    if (typeof src === 'string') {
      const next = renameImportSource(src);
      if (next !== src) p.value.source = j.literal(next);
    }
  });

  root
    .find(j.CallExpression, {
      callee: { type: 'Identifier', name: 'require' },
    })
    .forEach((p) => {
      const arg = p.value.arguments && p.value.arguments[0];
      if (arg && arg.type === 'Literal' && typeof arg.value === 'string') {
        const next = renameImportSource(arg.value);
        if (next !== arg.value) p.value.arguments[0] = j.literal(next);
      }
    });
};

const shouldSkipPropertyKey = (p) => {
  const parent = (p.parent && p.parent.value) || (p.parentPath && p.parentPath.value);
  if (!parent) return false;
  if (parent.type === 'Property' && parent.key === p.value) return true;
  if (parent.type === 'ObjectProperty' && parent.key === p.value) return true;
  if (parent.type === 'MethodDefinition' && parent.key === p.value) return true;
  if (parent.type === 'MemberExpression' && parent.property === p.value && !parent.computed)
    return true;
  return false;
};

const renameIdentifier = (name) => {
  if (name.startsWith('metrix')) return 'metrix' + name.slice('metrix'.length);
  if (name.includes('Strapi')) return name.replaceAll('Strapi', 'Metrix');
  return name;
};

const transformIdentifiers = (root, j) => {
  root.find(j.Identifier).forEach((p) => {
    if (shouldSkipPropertyKey(p)) return;
    const current = p.value.name;
    const next = renameIdentifier(current);
    if (next !== current) p.value.name = next;
  });
};

const transformEnvVars = (root, j) => {
  root
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'process' },
        property: { type: 'Identifier', name: 'env' },
      },
      property: { type: 'Identifier' },
      computed: false,
    })
    .forEach((p) => {
      const prop = p.value.property;
      if (prop.type === 'Identifier' && prop.name.startsWith('STRAPI_')) {
        prop.name = 'METRIX_' + prop.name.slice('STRAPI_'.length);
      }
    });
};

module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  transformImportSources(root, j);
  transformIdentifiers(root, j);
  transformEnvVars(root, j);
  return root.toSource();
};

module.exports.parser = 'tsx';


