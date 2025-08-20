### Metrix → Metrix rename guide

Decisions:
- NPM scope: `@metrix/*`
- No CLI alias or backwards-compat.

Steps:
1) Dry-run filesystem renames:
```
node scripts/rename/rename-metrix-to-metrix.js --dry
```
2) Apply filesystem renames:
```
node scripts/rename/rename-metrix-to-metrix.js
```
3) Run codemods (select `rename-brand.*` under version `0.0.0`):
```
yarn workspace @metrix/upgrade run codemods run -p . -n -r 0.0.0-9999.0.0
```
Remove `-n` to apply.

4) Update snapshots and run tests/build:
```
yarn test:unit && yarn test:front && yarn test:api && yarn build
```

Notes:
- The code codemod avoids changing property keys and member properties to reduce breakage.
- JSON codemod updates package scopes, scripts and bin names.


