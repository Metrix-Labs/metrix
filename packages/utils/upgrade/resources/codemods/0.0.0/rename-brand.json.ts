import type { modules } from '../../../dist';

/**
 * JSON/textual replacements for brand rename.
 * Applies to package.json and other JSON configs ingested by the JSON runner.
 *
 * Rules:
 * - package.json name & deps: @metrix/* -> @metrix/*; @metrix/metrix -> @metrix/metrix
 * - Scripts and bin fields referencing "metrix" CLI -> "metrix"
 * - Env keys STRAPI_* -> METRIX_*
 */

const transform: modules.runner.json.JSONTransform = (file, params) => {
  const { json } = params;
  const j = json(file.json);

  // Replace package name and bin/scripts in package.json only
  if (file.path.endsWith('package.json')) {
    if (j.has('name')) {
      const name = j.get('name');
      if (typeof name === 'string') {
        j.set('name', renamePackageScope(name));
      }
    }

    // Dependencies/devDependencies/peerDependencies
    for (const section of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ]) {
      if (j.has(section)) {
        const deps = j.get(section);
        if (deps && typeof deps === 'object') {
          for (const key of Object.keys(deps)) {
            const newKey = renamePackageScope(key);
            if (newKey !== key) {
              const version = deps[key];
              delete deps[key];
              deps[newKey] = version;
            }
          }
        }
      }
    }

    // scripts: replace command invocations of `metrix` -> `metrix`
    if (j.has('scripts')) {
      const scripts = j.get('scripts') as Record<string, string>;
      for (const k of Object.keys(scripts ?? {})) {
        const v = scripts[k];
        if (typeof v === 'string') scripts[k] = renameCli(v);
      }
    }

    // bin fields
    if (j.has('bin')) {
      const bin = j.get('bin');
      if (typeof bin === 'string') {
        j.set('bin', renameCli(bin));
      } else if (bin && typeof bin === 'object') {
        for (const key of Object.keys(bin)) {
          const newKey = key === 'metrix' ? 'metrix' : key;
          const val = renameCli(bin[key]);
          delete bin[key];
          bin[newKey] = val;
        }
      }
    }
  }

  return j.root();
};

export default transform;

const renamePackageScope = (name: string): string => {
  if (name === '@metrixlabs/metrix') return '@metrixlabs/metrix';
  if (name.startsWith('@metrixlabs/')) return `@metrixlabs/${name.slice('@metrixlabs/'.length)}`;
  return name;
};

const renameCli = (value: string): string => {
  // Replace standalone `metrix` bin invocations and scoped imports
  return value
    .replaceAll('@metrixlabs/metrix', '@metrixlabs/metrix')
    .replaceAll('@metrixlabs/', '@metrixlabs/')
    .replace(/\bstrapi\b/g, 'metrix');
};
