'use strict';

// Helpers.
const { createStrapiInstance } = require('api-tests/metrix');
const request = require('supertest');

let metrix;

describe('Test Graphql Utils', () => {
  beforeAll(async () => {
    metrix = await createStrapiInstance();
  });

  afterAll(async () => {
    await metrix.destroy();
  });

  test('Load Graphql playground', async () => {
    const supertestAgent = request.agent(metrix.server.httpServer);
    const res = await supertestAgent.get('/graphql').set('accept', 'text/html');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<title>Apollo Server</title>');
  });
});
