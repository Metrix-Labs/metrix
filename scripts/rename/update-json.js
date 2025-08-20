#!/usr/bin/env node
/*
 * Update JSON files (package.json) for Strapi -> Metrix rename.
 *
 * Usage:
 *   node scripts/rename/update-json.js --dry   # preview changes
 *   node scripts/rename/update-json.js         # apply changes
 */

const path = require('node:path');
const fsp = require('node:fs/promises');

const args = new Set(process.argv.slice(2));
const isDry = args.has('--dry') || args.has('-n');
const cwd = process.cwd();

const IGNORED_DIRS = new Set(['node_modules', '.git', '.yarn', 'dist', 'build', 'coverage']);
const log = (...a) => console.log('[json]', ...a);

function renamePackageScope(name) {
  if (typeof name !== 'string') return name;
  if (name === '@metrix/metrix') return '@metrix/metrix';
  if (name.startsWith('@metrix/')) return '@metrix/' + name.slice('@metrix/'.length);
  if (name === 'create-metrix-app') return 'create-metrix-app';
  if (name === 'create-metrix') return 'create-metrix';
  if (name === 'metrix') return 'metrix';
  return name;
}

function renameCli(value) {
  if (typeof value !== 'string') return value;
  return value
    .replaceAll('@metrix/metrix', '@metrix/metrix')
    .replaceAll('@metrix/', '@metrix/')
    .replace(/\bcreate-metrix-app\b/g, 'create-metrix-app')
    .replace(/\bcreate-metrix\b/g, 'create-metrix')
    .replace(/\bstrapi\b/g, 'metrix');
}

async function processPackageJson(filePath) {
  const src = JSON.parse(await fsp.readFile(filePath, 'utf8'));
  const before = JSON.stringify(src);

  if (src.name) src.name = renamePackageScope(src.name);

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const deps = src[section];
    if (deps && typeof deps === 'object') {
      for (const key of Object.keys({ ...deps })) {
        const newKey = renamePackageScope(key);
        if (newKey !== key) {
          deps[newKey] = deps[key];
          delete deps[key];
        }
      }
      for (const k of Object.keys(deps)) {
        const v = deps[k];
        if (typeof v === 'string') {
          deps[k] = renameCli(v);
        }
      }
    }
  }

  if (src.scripts && typeof src.scripts === 'object') {
    for (const k of Object.keys(src.scripts)) {
      src.scripts[k] = renameCli(src.scripts[k]);
    }
  }

  if (src.bin) {
    if (typeof src.bin === 'string') src.bin = renameCli(src.bin);
    else if (typeof src.bin === 'object') {
      const bin = src.bin;
      for (const key of Object.keys({ ...bin })) {
        const newKey = key === 'metrix' ? 'metrix' : key === 'create-metrix' ? 'create-metrix' : key;
        const val = renameCli(bin[key]);
        delete bin[key];
        bin[newKey] = val;
      }
    }
  }

  const after = JSON.stringify(src);
  if (before !== after) {
    log(`${isDry ? 'Would update' : 'Updating'} ${path.relative(cwd, filePath)}`);
    if (!isDry) await fsp.writeFile(filePath, JSON.stringify(src, null, 2));
  }
}

async function walk(dirRel, out) {
  const dirAbs = path.join(cwd, dirRel);
  const entries = await fsp.readdir(dirAbs, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(ent.name)) continue;
      await walk(path.join(dirRel, ent.name), out);
    } else if (ent.isFile()) {
      if (ent.name === 'package.json') out.push(path.join(dirRel, ent.name));
    }
  }
}

async function main() {
  const files = [];
  await walk('.', files);
  for (const rel of files) {
    const filePath = path.join(cwd, rel);
    await processPackageJson(filePath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


