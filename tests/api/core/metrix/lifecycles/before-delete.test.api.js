'use strict';

const { createTestBuilder } = require('api-tests/builder');
const { createStrapiInstance } = require('api-tests/metrix');
const { createContentAPIRequest } = require('api-tests/request');

let builder;
let metrix;
let rq;
const data = {
  productsWithCompo: [],
};

const compo = {
  displayName: 'compo',
  attributes: {
    name: {
      type: 'string',
    },
  },
};

const productWithCompo = {
  attributes: {
    compo: {
      component: 'default.compo',
      type: 'component',
    },
  },
  displayName: 'product-with-compo',
  singularName: 'product-with-compo',
  pluralName: 'product-with-compos',
  description: '',
  collectionName: '',
};

const productWithCompoFixtures = [
  {
    // will have id=1
    compo: {
      name: 'compo-1',
    },
  },
];

describe('Lifecycle - beforeDelete', () => {
  beforeAll(async () => {
    builder = createTestBuilder();

    await builder
      .addComponent(compo)
      .addContentType(productWithCompo)
      .addFixtures(productWithCompo.singularName, productWithCompoFixtures)
      .build();

    metrix = await createStrapiInstance();
    rq = await createContentAPIRequest({ metrix });
    data.productsWithCompo = await builder.sanitizedFixturesFor(
      productWithCompo.singularName,
      metrix
    );
  });

  afterAll(async () => {
    await metrix.destroy();
    await builder.cleanup();
  });

  test('Component data should be available', async () => {
    expect.assertions(4);

    let entity;
    const beforeDelete = jest.fn(async (ctx) => {
      entity = await metrix.db.query('api::product-with-compo.product-with-compo').findOne({
        ...ctx.params,
        populate: {
          compo: true,
        },
      });
    });

    metrix.db.lifecycles.subscribe({
      models: ['api::product-with-compo.product-with-compo'],
      beforeDelete,
    });

    await rq({
      method: 'DELETE',
      url: `/product-with-compos/${data.productsWithCompo[0].documentId}`,
    });

    expect(beforeDelete.mock.calls.length).toBe(1);
    expect(entity).toBeDefined();
    expect(entity.compo).not.toBeNull();
    expect(entity.compo.name).toBe('compo-1');
  });
});
