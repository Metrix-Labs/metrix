'use strict';

const { createStrapiInstance } = require('api-tests/strapi');
const { isKnexQuery } = require('@metrixlabs/database');

let metrix;

describe('knex', () => {
  beforeAll(async () => {
    metrix = await createStrapiInstance();
  });

  afterAll(async () => {
    await metrix.destroy();
  });

  describe('isKnexQuery', () => {
    test('knex query: true', () => {
      const res = isKnexQuery(metrix.db.connection('strapi_core_store_settings'));
      expect(res).toBe(true);
    });

    test('knex raw: true', () => {
      const res = isKnexQuery(metrix.db.connection.raw('SELECT * FROM strapi_core_store_settings'));
      expect(res).toBe(true);
    });

    test.each([[''], [{}], [[]], [2], [new Date()]])('%s: false', (value) => {
      const res = isKnexQuery(value);
      expect(res).toBe(false);
    });
  });
});
