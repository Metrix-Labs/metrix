'use strict';

// Test an API with all the possible filed types and simple filterings (no deep filtering, no relations)
const _ = require('lodash');
const { createStrapiInstance } = require('api-tests/metrix');
const { createTestBuilder } = require('api-tests/builder');
const { createContentAPIRequest, transformToRESTResource } = require('api-tests/request');

const data = {
  card: [],
  collector: [],
};
let rq;
let metrix;

const card = {
  displayName: 'Card',
  singularName: 'card',
  pluralName: 'cards',
  kind: 'collectionType',
  attributes: {
    name: {
      type: 'string',
    },
  },
};

const collector = {
  displayName: 'Collector',
  singularName: 'collector',
  pluralName: 'collectors',
  kind: 'collectionType',
  attributes: {
    name: {
      type: 'string',
    },
    age: {
      type: 'integer',
    },
    cards: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::card.card',
    },
    collector_friends: {
      type: 'relation',
      relation: 'oneToMany',
      target: '__self__',
    },
  },
};

const fixtures = {
  card: [
    {
      name: 'Hugo LLORIS',
    },
    {
      name: 'Samuel UMTITI',
    },
    {
      name: 'Lucas HERNANDEZ',
    },
  ],
  collector: ({ card }) => [
    {
      name: 'Bernard',
      age: 25,
      cards: [card[0].id, card[1].id],
    },
    (self) => ({
      name: 'Isabelle',
      age: 55,
      cards: [card[0].id],
      collector_friends: [self[0].id],
    }),
    (self) => ({
      name: 'Kenza',
      age: 25,
      cards: [],
      collector_friends: [self[0].id],
    }),
  ],
};

describe('Validation - private params', () => {
  const builder = createTestBuilder();

  beforeAll(async () => {
    await builder
      .addContentTypes([card, collector])
      .addFixtures(card.singularName, fixtures.card)
      .addFixtures(collector.singularName, fixtures.collector)
      .build();

    metrix = await createStrapiInstance();
    rq = await createContentAPIRequest({ metrix });

    Object.assign(
      data,
      _.mapValues(await builder.sanitizedFixtures(metrix), (value) =>
        transformToRESTResource(value)
      )
    );
  });

  afterAll(async () => {
    await metrix.destroy();
    await builder.cleanup();
  });

  test('Error when filters has createdBy user email', async () => {
    const res = await rq({
      method: 'GET',
      url: '/collectors',
      qs: {
        filters: {
          createdBy: {
            email: {
              $eq: 'SomeRandomText',
            },
          },
        },
      },
    });

    expect(res.statusCode).toBe(400);
  });
});
