#!/usr/bin/env node
/*
 * Run the code codemod to rename Strapi -> Metrix across code files.
 *
 * Usage:
 *   node scripts/rename/run-code-codemod.js --dry   # preview
 *   node scripts/rename/run-code-codemod.js         # apply
 */

const path = require('node:path');
const Runner = require('jscodeshift/src/Runner');

const args = new Set(process.argv.slice(2));
const isDry = args.has('--dry') || args.has('-n');

async function main() {
  const transformPath = path.join(
    __dirname,
    '..',
    '..',
    'packages',
    'utils',
    'upgrade',
    'resources',
    'codemods',
    '0.0.0',
    'rename-brand.code.ts'
  );

  const cwd = process.cwd();
  const paths = [cwd];

  const options = {
    dry: isDry,
    print: false,
    silent: true,
    verbose: 0,
    babel: true,
    parser: 'ts',
    extensions: 'js,jsx,ts,tsx',
    ignorePattern: ['**/node_modules/**', '**/.git/**', '**/.yarn/**', '**/dist/**', '**/build/**'],
  };

  const res = await Runner.run(transformPath, paths, options);
  // res is an array of results per file; we can just log summary
  const changed = res.filter((r) => r?.ok > 0);
  console.log(`[code-codemod] ${isDry ? 'Would change' : 'Changed'} ${changed.length} file(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


