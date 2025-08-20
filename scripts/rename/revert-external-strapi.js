#!/usr/bin/env node
/*
 * Revert external Strapi packages back to their original scope.
 * We DO NOT own these packages, so keep them as @strapi/*.
 *
 * Mappings:
 * - @strapi/design-system -> @strapi/design-system
 * - @strapi/icons -> @strapi/icons
 *
 * Usage:
 *   node scripts/rename/revert-external-strapi.js --dry
 *   node scripts/rename/revert-external-strapi.js
 */

const path = require('node:path');
const fsp = require('node:fs/promises');

const args = new Set(process.argv.slice(2));
const isDry = args.has('--dry') || args.has('-n');
const cwd = process.cwd();

const IGNORED_DIRS = new Set(['node_modules', '.git', '.yarn', 'dist', 'build', 'coverage']);
const TARGET_EXTS = null; // null means all files

const log = (...a) => console.log('[revert-external]', ...a);

const mappings = [
  // Keep external Strapi DS/icons intact
  ['@strapi/design-system', '@strapi/design-system'],
  ['@strapi/icons', '@strapi/icons'],
  // Eslint config was not internal; keep upstream naming if encountered
  ['@strapi/eslint-config', '@strapi/eslint-config'],
];

function replaceAll(content) {
  let next = content;
  for (const [from, to] of mappings) {
    next = next.split(from).join(to);
  }
  return next;
}

async function walk(dirRel, out) {
  const dirAbs = path.join(cwd, dirRel);
  const entries = await fsp.readdir(dirAbs, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(ent.name)) continue;
      await walk(path.join(dirRel, ent.name), out);
    } else if (ent.isFile()) {
      if (!TARGET_EXTS) {
        out.push(path.join(dirRel, ent.name));
      } else {
        const ext = path.extname(ent.name).toLowerCase();
        if (TARGET_EXTS.has(ext)) out.push(path.join(dirRel, ent.name));
      }
    }
  }
}

async function processFile(rel) {
  const abs = path.join(cwd, rel);
  const before = await fsp.readFile(abs, 'utf8');
  const after = replaceAll(before);
  if (before !== after) {
    log(`${isDry ? 'Would update' : 'Updating'} ${rel}`);
    if (!isDry) await fsp.writeFile(abs, after, 'utf8');
  }
}

async function main() {
  const files = [];
  await walk('.', files);
  for (const rel of files) {
    await processFile(rel);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
