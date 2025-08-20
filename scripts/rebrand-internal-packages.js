'use strict';

/**
 * Re-scope internal Strapi packages to @metrixlabs without introducing new configs.
 * - Rename package names: @strapi/* -> @metrixlabs/* (special: @strapi/strapi -> @metrixlabs/metrix)
 * - Update dependencies/devDependencies/peerDependencies across the repo accordingly
 * - Add publishConfig.access = "public" for internal packages
 * - Rewrite import/require specifiers for internal packages in source files
 * - Leave external @strapi libs (design-system, icons, eslint-config, ts-zen, sdk-plugin) untouched
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function readJson(filePath) {
  const data = await fsp.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeJson(filePath, json) {
  const data = JSON.stringify(json, null, 2) + '\n';
  await fsp.writeFile(filePath, data, 'utf8');
}

async function* walk(dir, { include = () => true, excludeDir = () => false } = {}) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludeDir(full)) continue;
      yield* walk(full, { include, excludeDir });
    } else {
      if (include(full)) yield full;
    }
  }
}

function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function buildMapping(internalStrapiNames) {
  const mapping = new Map();
  for (const name of internalStrapiNames) {
    if (name === '@strapi/strapi') {
      mapping.set(name, '@metrixlabs/metrix');
    } else {
      mapping.set(name, name.replace(/^@strapi\//, '@metrixlabs/'));
    }
  }
  return mapping;
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');

  // 1) Discover internal packages under packages/**
  const internalPkgJsonFiles = [];
  for await (const file of walk(path.join(repoRoot, 'packages'), {
    include: (p) => p.endsWith('package.json'),
    excludeDir: (d) => d.includes('node_modules'),
  })) {
    internalPkgJsonFiles.push(file);
  }

  const internalStrapiNames = new Set();
  for (const pkgJsonPath of internalPkgJsonFiles) {
    const pkg = await readJson(pkgJsonPath);
    if (typeof pkg.name === 'string' && pkg.name.startsWith('@strapi/')) {
      internalStrapiNames.add(pkg.name);
    }
  }

  // 2) Build mapping @strapi/* -> @metrixlabs/* (with special case) from pre-rename state
  const nameMapping = buildMapping(internalStrapiNames);

  // Also collect current internal @metrixlabs/* package names (post-rename state)
  const internalMetrixNames = new Set();
  for (const pkgJsonPath of internalPkgJsonFiles) {
    const pkg = await readJson(pkgJsonPath);
    if (typeof pkg.name === 'string' && pkg.name.startsWith('@metrixlabs/')) {
      internalMetrixNames.add(pkg.name);
    }
  }

  // External @strapi libs to keep as-is
  const externalKeep = new Set([
    '@strapi/design-system',
    '@strapi/icons',
    '@strapi/eslint-config',
    '@strapi/ts-zen',
    '@strapi/sdk-plugin',
  ]);

  // Helper to decide if a given package name is internal and should be remapped
  function shouldRemap(depName) {
    if (!depName || !depName.startsWith || !depName.startsWith('@strapi/')) return false;
    if (externalKeep.has(depName)) return false;
    if (nameMapping.has(depName)) return true;
    // Fallback: if a corresponding @metrixlabs/<pkg> exists, remap it
    const parts = depName.split('/');
    const candidate = depName === '@strapi/strapi'
      ? '@metrixlabs/metrix'
      : `@metrixlabs/${parts[1]}`;
    return internalMetrixNames.has(candidate);
  }

  function remapName(depName) {
    if (nameMapping.has(depName)) return nameMapping.get(depName);
    const parts = depName.split('/');
    if (depName === '@strapi/strapi') return '@metrixlabs/metrix';
    return `@metrixlabs/${parts[1]}`;
  }

  // 3) Update internal packages' own package.json (name + deps + publishConfig)
  for (const pkgJsonPath of internalPkgJsonFiles) {
    const pkg = await readJson(pkgJsonPath);
    if (typeof pkg.name === 'string' && nameMapping.has(pkg.name)) {
      pkg.name = nameMapping.get(pkg.name);
      pkg.publishConfig = pkg.publishConfig || {};
      if (!pkg.publishConfig.access) {
        pkg.publishConfig.access = 'public';
      }
    }

    for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[field];
      if (!deps) continue;
      const updated = { ...deps };
      let changed = false;
      for (const [depName, version] of Object.entries(deps)) {
        if (shouldRemap(depName)) {
          const newName = remapName(depName);
          delete updated[depName];
          updated[newName] = version;
          changed = true;
        }
      }
      if (changed) {
        pkg[field] = sortObjectKeys(updated);
      }
    }

    await writeJson(pkgJsonPath, pkg);
  }

  // 4) Update all other package.json files in the repo (dependencies only)
  const otherPkgJsonFiles = [];
  for await (const file of walk(repoRoot, {
    include: (p) => p.endsWith('package.json'),
    excludeDir: (d) => d.includes('node_modules') || d.includes(path.join('packages')),
  })) {
    otherPkgJsonFiles.push(file);
  }

  for (const pkgJsonPath of otherPkgJsonFiles) {
    const pkg = await readJson(pkgJsonPath);
    let touched = false;
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[field];
      if (!deps) continue;
      const updated = { ...deps };
      let changed = false;
      for (const [depName, version] of Object.entries(deps)) {
        if (shouldRemap(depName)) {
          const newName = remapName(depName);
          delete updated[depName];
          updated[newName] = version;
          changed = true;
        }
      }
      if (changed) {
        pkg[field] = sortObjectKeys(updated);
        touched = true;
      }
    }
    if (touched) {
      await writeJson(pkgJsonPath, pkg);
    }
  }

  // 5) Rewrite import/require specifiers for internal packages across source files
  const exts = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'];
  const sourceFiles = [];
  for await (const file of walk(repoRoot, {
    include: (p) => exts.some((e) => p.endsWith(e)),
    excludeDir: (d) => d.includes('node_modules') || d.includes('dist') || d.includes('build'),
  })) {
    sourceFiles.push(file);
  }

  // Match module specifiers we need to rewrite; capture the module string as group 2
  const importRegexes = [
    /(from\s+['"])(@strapi\/[^'"\n]+)(['"])/g,
    /(require\(\s*['"])(@strapi\/[^'"\n]+)(['"]\s*\))/g,
    /(import\(\s*['"])(@strapi\/[^'"\n]+)(['"]\s*\))/g,
    /(jest\.mock\(\s*['"])(@strapi\/[^'"\n]+)(['"]\s*\))/g,
    // side-effect imports: import '@strapi/types'
    /(^|\s)(import\s*['"])(@strapi\/[^'"\n]+)(['"])\s*;?/gm,
  ];

  for (const filePath of sourceFiles) {
    const text = await fsp.readFile(filePath, 'utf8');
    let replaced = text;
    let changed = false;

    for (const re of importRegexes) {
      replaced = replaced.replace(re, (full, prefix, moduleId, suffix) => {
        // moduleId can include subpaths: @strapi/pkg/sub/path
        const parts = moduleId.split('/');
        const root = parts.slice(0, 2).join('/'); // @strapi/pkg
        const subpath = parts.slice(2).join('/'); // sub/path or ''
        if (shouldRemap(root)) {
          const newRoot = remapName(root);
          const newModuleId = subpath ? `${newRoot}/${subpath}` : newRoot;
          changed = true;
          if (suffix !== undefined) {
            return `${prefix}${newModuleId}${suffix}`;
          }
          // handle side-effect import variant where prefix includes leading whitespace
          return `${prefix}${newModuleId}`;
        }
        return full;
      });
    }

    if (changed) {
      await fsp.writeFile(filePath, replaced, 'utf8');
    }
  }

  // 6) Log summary
  console.log('Rebrand complete. Updated packages:');
  for (const [oldName, newName] of nameMapping.entries()) {
    console.log(`- ${oldName} -> ${newName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


