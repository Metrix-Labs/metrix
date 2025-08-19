import type { Core } from '@metrix/types';
import { differenceWith, isEqual } from 'lodash/fp';

export interface PersistedTable {
  name: string;
  dependsOn?: Array<{ name: string }>;
}

/**
 * Transform table name to the object format
 */
const transformTableName = (table: string | PersistedTable) => {
  if (typeof table === 'string') {
    return { name: table };
  }
  return table;
};

/**
 * Finds all tables in the database matching the regular expression
 * @param {Object} ctx
 * @param {Strapi} ctx.metrix
 * @param {RegExp} regex
 * @returns {Promise<string[]>}
 */
export async function findTables({ metrix }: { metrix: Core.Strapi }, regex: any) {
  const tables = await metrix.db.dialect.schemaInspector.getTables();
  return tables.filter((tableName: string) => regex.test(tableName));
}

/**
 * Add tables name to the reserved tables in core store
 */
async function addPersistTables(
  { metrix }: { metrix: Core.Strapi },
  tableNames: Array<string | PersistedTable>
) {
  const persistedTables = await getPersistedTables({ metrix });
  const tables = tableNames.map(transformTableName);

  // Get new tables to be persisted, remove tables if they already were persisted
  const notPersistedTableNames = differenceWith(isEqual, tables, persistedTables);
  // Remove tables that are going to be changed
  const tablesToPersist = differenceWith(
    (t1: any, t2: any) => t1.name === t2.name,
    persistedTables,
    notPersistedTableNames
  );

  if (!notPersistedTableNames.length) {
    return;
  }

  // @ts-expect-error lodash types
  tablesToPersist.push(...notPersistedTableNames);
  await metrix.store.set({
    type: 'core',
    key: 'persisted_tables',
    value: tablesToPersist,
  });
}

/**
 * Get all reserved table names from the core store
 * @param {Object} ctx
 * @param {Strapi} ctx.metrix
 * @param {RegExp} regex
 * @returns {Promise<string[]>}
 */

async function getPersistedTables({ metrix }: { metrix: Core.Strapi }) {
  const persistedTables: any = await metrix.store.get({
    type: 'core',
    key: 'persisted_tables',
  });

  return (persistedTables || []).map(transformTableName);
}

/**
 * Set all reserved table names in the core store
 * @param {Object} ctx
 * @param {Strapi} ctx.metrix
 * @param {Array<string|{ table: string; dependsOn?: Array<{ table: string;}> }>} tableNames
 * @returns {Promise<void>}
 */
async function setPersistedTables(
  { metrix }: { metrix: Core.Strapi },
  tableNames: Array<string | PersistedTable>
) {
  await metrix.store.set({
    type: 'core',
    key: 'persisted_tables',
    value: tableNames,
  });
}
/**
 * Add all table names that start with a prefix to the reserved tables in
 * core store
 * @param {string} tableNamePrefix
 * @return {Promise<void>}
 */

export const persistTablesWithPrefix = async (tableNamePrefix: string) => {
  const tableNameRegex = new RegExp(`^${tableNamePrefix}.*`);
  const tableNames = await findTables({ metrix }, tableNameRegex);

  await addPersistTables({ metrix }, tableNames);
};

/**
 * Remove all table names that end with a suffix from the reserved tables in core store
 * @param {string} tableNameSuffix
 * @return {Promise<void>}
 */
export const removePersistedTablesWithSuffix = async (tableNameSuffix: string) => {
  const tableNameRegex = new RegExp(`.*${tableNameSuffix}$`);
  const persistedTables = await getPersistedTables({ metrix });

  const filteredPersistedTables = persistedTables.filter((table: any) => {
    return !tableNameRegex.test(table.name);
  });

  if (filteredPersistedTables.length === persistedTables.length) {
    return;
  }

  await setPersistedTables({ metrix }, filteredPersistedTables);
};

/**
 * Add tables to the reserved tables in core store
 */
export const persistTables = async (tables: Array<string | PersistedTable>) => {
  await addPersistTables({ metrix }, tables);
};

export default {
  persistTablesWithPrefix,
  removePersistedTablesWithSuffix,
  persistTables,
  findTables,
};
