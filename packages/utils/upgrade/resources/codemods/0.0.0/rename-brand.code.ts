import { Transform, JSCodeshift, Collection } from 'jscodeshift';

/**
 * Rename Strapi brand tokens to Metrix in code files.
 *
 * - Import/require sources: "@metrixlabs/*" -> "@metrixlabs/*"
 *   Special-case: "@metrixlabs/metrix" -> "@metrixlabs/metrix"
 * - Relative import sources containing "/metrix/" segment -> "/metrix/"
 * - Identifier renames (safe subset):
 *   - Any identifier starting with "metrix" -> "metrix" + rest (e.g., strapiFunction -> metrixFunction)
 *   - Any identifier containing "Strapi" -> replace to "Metrix"
 *   - Do NOT touch object property keys, class method names, or member expression property identifiers
 *     to reduce risk on object shapes and external interfaces.
 * - Env vars: process.env.METRIX_* -> process.env.METRIX_*
 */

const PACKAGE_SCOPE_FROM = '@metrixlabs/';
const PACKAGE_SCOPE_TO = '@metrixlabs/';
const SPECIAL_FROM = '@metrixlabs/metrix';
const SPECIAL_TO = '@metrixlabs/metrix';

const renameImportSource = (value: string): string => {
  if (value === SPECIAL_FROM) return SPECIAL_TO;
  if (value.startsWith(PACKAGE_SCOPE_FROM)) {
    return PACKAGE_SCOPE_TO + value.slice(PACKAGE_SCOPE_FROM.length);
  }
  // Relative path segments
  if (value.includes('/metrix/')) {
    return value.replaceAll('/metrix/', '/metrix/');
  }
  return value;
};

const transformImportSources = (root: Collection, j: JSCodeshift) => {
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.value.source?.value;
    if (typeof source === 'string') {
      const next = renameImportSource(source);
      if (next !== source) {
        path.value.source = j.literal(next);
      }
    }
  });

  root
    .find(j.CallExpression, {
      callee: { type: 'Identifier', name: 'require' },
      arguments: (args: unknown[]) => Array.isArray(args) && args.length > 0,
    })
    .forEach((path) => {
      const arg = path.value.arguments[0];
      if (arg && arg.type === 'Literal' && typeof arg.value === 'string') {
        const next = renameImportSource(arg.value);
        if (next !== arg.value) {
          path.value.arguments[0] = j.literal(next);
        }
      }
    });
};

const shouldSkipPropertyKey = (p: any) => {
  const parent = p.parent?.value ?? p.parentPath?.value;
  if (!parent) return false;
  // Skip keys in object/class property definitions
  if (parent.type === 'Property' && parent.key === p.value) return true;
  if (parent.type === 'ObjectProperty' && parent.key === p.value) return true;
  if (parent.type === 'MethodDefinition' && parent.key === p.value) return true;
  // Skip member expression properties: obj.metrix -> keep property name
  if (parent.type === 'MemberExpression' && parent.property === p.value && !parent.computed)
    return true;
  return false;
};

const renameIdentifier = (name: string): string => {
  if (name.startsWith('metrix')) {
    return 'metrix' + name.slice('metrix'.length);
  }
  if (name.includes('Strapi')) {
    return name.replaceAll('Strapi', 'Metrix');
  }
  return name;
};

const transformIdentifiers = (root: Collection, j: JSCodeshift) => {
  root.find(j.Identifier).forEach((p) => {
    if (shouldSkipPropertyKey(p)) return;
    const current = p.value.name;
    const next = renameIdentifier(current);
    if (next !== current) {
      p.value.name = next;
    }
  });
};

const transformEnvVars = (root: Collection, j: JSCodeshift) => {
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

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  transformImportSources(root, j);
  transformIdentifiers(root, j);
  transformEnvVars(root, j);

  return root.toSource();
};

export const parser = 'tsx';

export default transform;
