import { traverseQueryPopulate } from '../traverse';

describe('traverseQueryPopulate', () => {
  global.metrix = {
    getModel() {},
  } as any;

  test('should not modify wildcard', async () => {
    const metrix = {
      getModel: jest.fn((uid) => {
        return {
          uid,
          attributes: {
            street: {
              type: 'string',
            },
          },
        };
      }),
      db: {
        metadata: {
          get: jest.fn(() => ({
            columnToAttribute: {
              address: 'address',
            },
          })),
        },
      },
    } as any;

    global.metrix = metrix;

    const query = await traverseQueryPopulate(jest.fn(), {
      schema: {
        kind: 'collectionType',
        attributes: {
          title: {
            type: 'string',
          },
          address: {
            type: 'relation',
            relation: 'oneToOne',
            target: 'api::address.address',
          },
          some: {
            type: 'relation',
            relation: 'ManyToMany',
            target: 'api::some.some',
          },
        },
      },
      getModel() {},
    })('*');

    expect(query).toEqual('*');
  });

  test('should return only selected populatable field', async () => {
    const metrix = {
      getModel: jest.fn((uid) => {
        return {
          uid,
          attributes: {
            street: {
              type: 'string',
            },
          },
        };
      }),
      db: {
        metadata: {
          get: jest.fn(() => ({
            columnToAttribute: {
              address: 'address',
            },
          })),
        },
      },
    } as any;

    global.metrix = metrix;

    const query = await traverseQueryPopulate(jest.fn(), {
      schema: {
        kind: 'collectionType',
        attributes: {
          title: {
            type: 'string',
          },
          address: {
            type: 'relation',
            relation: 'oneToOne',
            target: 'api::address.address',
          },
          some: {
            type: 'relation',
            relation: 'ManyToMany',
            target: 'api::some.some',
          },
        },
      },
      getModel() {},
    })('address');

    expect(query).toEqual('address');
  });

  test('should work with filters attribute', async () => {
    expect.assertions(5);

    const metrix = {
      getModel: jest.fn((uid) => {
        return {
          uid,
          attributes: {
            filters: {
              type: 'string',
            },
          },
        };
      }),
      db: {
        metadata: {
          get: jest.fn(() => ({
            columnToAttribute: {
              address: 'address',
            },
          })),
        },
      },
    } as any;

    global.metrix = metrix;

    const schema = {
      kind: 'collectionType',
      attributes: {
        title: {
          type: 'string',
        },
        address: {
          type: 'relation',
          relation: 'oneToOne',
          target: 'api::address.address',
        },
      },
    } as const;

    const ctx = {
      schema,
      getModel: metrix.getModel,
    } as const;

    await traverseQueryPopulate(({ key, parent, attribute }) => {
      switch (key) {
        case 'address':
          // top level populate should not have parent
          expect(parent).toBeUndefined();
          expect(attribute).toBeDefined();
          break;
        case 'filters':
          // Parent information should be available
          expect(parent.key).toBe('address');
          expect(parent.attribute).not.toBeUndefined();
          expect(attribute).toBeDefined();
          break;
        default:
          break;
      }
    }, ctx)({
      address: {
        filters: {
          name: 'test',
        },
      },
    });
  });
});
