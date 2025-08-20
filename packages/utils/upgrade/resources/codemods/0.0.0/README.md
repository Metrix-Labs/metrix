# Rename Brand (Metrix -> Metrix)

Codemods to rename the framework brand in code and JSON files.

- Code: `rename-brand.code.ts`
  - Import sources: `@metrix/*` -> `@metrix/*` (special: `@metrix/metrix` -> `@metrix/metrix`)
  - Relative import segments: `/metrix/` -> `/metrix/`
  - Identifiers: `metrix*` -> `metrix*`, `*Metrix*` -> `*Metrix*` (skips property keys and member expression properties)
  - Env: `process.env.STRAPI_*` -> `process.env.METRIX_*`

- JSON: `rename-brand.json.ts`
  - `package.json` name and deps scope: `@metrix/*` -> `@metrix/*`
  - Scripts/bin: `metrix` -> `metrix`

Run via the upgrade runner using version range including `0.0.0`.


