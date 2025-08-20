#!/usr/bin/env node
/*
 * Rescope internal packages from @metrix/* -> @metrixlabs/*
 * - Only affects packages that exist locally (internal)
 * - Updates package.json name/deps/devDeps/peerDeps/optionalDeps
 * - Updates import/require strings in code (js,jsx,ts,tsx)
 * - Leaves external @strapi/* packages untouched
 *
 * Usage:
 *   node scripts/rename/rescope-internal-to-metrixlabs.js --dry
 *   node scripts/rename/rescope-internal-to-metrixlabs.js
 */

const path = require('node:path');
const fsp = require('node:fs/promises');

const args = new Set(process.argv.slice(2));
const isDry = args.has('--dry') || args.has('-n');
const cwd = process.cwd();

const IGNORED_DIRS = new Set(['node_modules', '.git', '.yarn', 'dist', 'build', 'coverage']);
const CODE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const log = (...a) => console.log('[rescope]', ...a);

async function readJson(file) {
  const buf = await fsp.readFile(file, 'utf8');
  return JSON.parse(buf);
}

async function writeJson(file, obj) {
  const next = JSON.stringify(obj, null, 2) + '\n';
  await fsp.writeFile(file, next, 'utf8');
}

async function listInternalPackages() {
  const pkgs = new Set();
  // Discover local packages by scanning workspaces under base dirs/**/package.json
  async function walk(dirRel) {
    const dirAbs = path.join(cwd, dirRel);
    const entries = await fsp.readdir(dirAbs, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        if (IGNORED_DIRS.has(ent.name)) continue;
        await walk(path.join(dirRel, ent.name));
      } else if (ent.isFile() && ent.name === 'package.json') {
        const file = path.join(dirAbs, ent.name);
        try {
          const json = await readJson(file);
          if (typeof json.name === 'string' && json.name.startsWith('@metrix/')) {
            pkgs.add(json.name);
          }
        } catch {}
      }
    }
  }
  for (const base of ['packages', 'examples', 'templates']) {
    try {
      await walk(base);
    } catch {}
  }
  return pkgs;
}

function rescopeName(name) {
  if (typeof name !== 'string') return name;
  if (name.startsWith('@metrix/')) return '@metrixlabs/' + name.slice('@metrix/'.length);
  return name;
}

function rescopeDeps(obj, internalSet) {
  const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  for (const sec of sections) {
    const deps = obj[sec];
    if (!deps) continue;
    for (const [dep, ver] of Object.entries(deps)) {
      if (dep.startsWith('@metrix/')) {
        const next = rescopeName(dep);
        if (next !== dep) {
          delete deps[dep];
          deps[next] = ver;
        }
      }
    }
  }
}

async function updatePackageJson(file, internalSet) {
  const json = await readJson(file);
  let changed = false;
  if (typeof json.name === 'string' && json.name.startsWith('@metrix/')) {
    const next = rescopeName(json.name);
    if (next !== json.name) {
      json.name = next;
      changed = true;
    }
  }
  const before = JSON.stringify(json);
  rescopeDeps(json, internalSet);
  if (JSON.stringify(json) !== before) changed = true;
  if (changed) {
    log(`${isDry ? 'Would update' : 'Updating'} ${path.relative(cwd, file)}`);
    if (!isDry) await writeJson(file, json);
  }
}

function replaceImports(content) {
  return content.replaceAll(/(['"])@metrix\//g, '$1@metrixlabs/');
}

async function updateCodeFile(file) {
  const before = await fsp.readFile(file, 'utf8');
  const after = replaceImports(before);
  if (before !== after) {
    log(`${isDry ? 'Would update' : 'Updating'} ${path.relative(cwd, file)}`);
    if (!isDry) await fsp.writeFile(file, after, 'utf8');
  }
}

async function rescopeAll() {
  const internalSet = await listInternalPackages();
  // Update all package.json under packages/**
  async function walk(dirRel) {
    const dirAbs = path.join(cwd, dirRel);
    const entries = await fsp.readdir(dirAbs, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        if (IGNORED_DIRS.has(ent.name)) continue;
        await walk(path.join(dirRel, ent.name));
      } else if (ent.isFile()) {
        const rel = path.join(dirRel, ent.name);
        const ext = path.extname(ent.name).toLowerCase();
        if (ent.name === 'package.json') {
          await updatePackageJson(path.join(dirAbs, ent.name), internalSet);
        } else if (CODE_EXTS.has(ext)) {
          await updateCodeFile(path.join(dirAbs, ent.name));
        }
      }
    }
  }

  for (const base of ['packages', 'examples', 'templates']) {
    try {
      await walk(base);
    } catch {}
  }
}

rescopeAll().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
