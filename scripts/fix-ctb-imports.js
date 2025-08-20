'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function* walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue;
      yield* walk(full);
    } else if (/[.](ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      yield full;
    }
  }
}

async function run() {
  const root = path.resolve(__dirname, '..');
  const ctbDir = path.join(root, 'packages', 'core', 'content-type-builder');
  const targets = ['server', 'admin'];
  const patterns = [
    { from: /@strapi\/admin\/strapi-admin/g, to: '@metrixlabs/admin/strapi-admin' },
    { from: /@strapi\/types/g, to: '@metrixlabs/types' },
    { from: /@strapi\/utils/g, to: '@metrixlabs/utils' },
  ];

  for (const sub of targets) {
    const base = path.join(ctbDir, sub, 'src');
    try {
      for await (const file of walk(base)) {
        const content = await fsp.readFile(file, 'utf8');
        let updated = content;
        for (const { from, to } of patterns) {
          updated = updated.replace(from, to);
        }
        if (updated !== content) {
          await fsp.writeFile(file, updated, 'utf8');
        }
      }
    } catch (e) {
      // ignore
    }
  }
  console.log('Fixed CTB imports');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});




