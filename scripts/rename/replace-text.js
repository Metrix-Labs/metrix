#!/usr/bin/env node
/*
 * Textual replacements for Strapi -> Metrix in non-code files.
 * Targets: .md, .mdx, .yml, .yaml, .html, .txt
 *
 * Usage:
 *   node scripts/rename/replace-text.js --dry
 *   node scripts/rename/replace-text.js
 */

const path = require('node:path');
const fsp = require('node:fs/promises');

const args = new Set(process.argv.slice(2));
const isDry = args.has('--dry') || args.has('-n');
const cwd = process.cwd();

const IGNORED_DIRS = new Set(['node_modules', '.git', '.yarn', 'dist', 'build', 'coverage']);
const TARGET_EXTS = new Set(['.md', '.mdx', '.yml', '.yaml', '.html', '.txt']);

const log = (...a) => console.log('[text]', ...a);

function replaceAll(content) {
  let next = content;
  // Case-aware replacements
  next = next.replaceAll(/\bSTRAPI_([A-Z0-9_]+)\b/g, 'METRIX_$1');
  next = next.replaceAll(/\bStrapi\b/g, 'Metrix');
  next = next.replaceAll(/\bstrapi\b/g, 'metrix');
  // Scoped packages in docs
  next = next.replaceAll('@metrix/metrix', '@metrix/metrix');
  next = next.replaceAll('@metrix/', '@metrix/');
  // Paths
  next = next.replaceAll('/metrix/', '/metrix/');
  // CLI
  next = next.replaceAll(/\bcreate-metrix-app\b/g, 'create-metrix-app');
  next = next.replaceAll(/\bcreate-metrix\b/g, 'create-metrix');
  next = next.replaceAll(/\bstrapi\b/g, 'metrix');
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
      const ext = path.extname(ent.name).toLowerCase();
      if (TARGET_EXTS.has(ext)) out.push(path.join(dirRel, ent.name));
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


