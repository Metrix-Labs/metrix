'use strict';

// Helpers.
const { createTestBuilder } = require('api-tests/builder');
const { createStrapiInstance } = require('api-tests/metrix');
const { createAuthRequest } = require('api-tests/request');

const builder = createTestBuilder();
let metrix;
let rq;
let graphqlQuery;
let localeId;

const recipesModel = {
  attributes: {
    name: {
      type: 'string',
    },
  },
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  singularName: 'recipe',
  pluralName: 'recipes',
  displayName: 'Recipe',
  description: '',
  collectionName: '',
};

describe('Test Graphql API create localization', () => {
  beforeAll(async () => {
    await builder.addContentType(recipesModel).build();

    metrix = await createStrapiInstance();
    rq = await createAuthRequest({ metrix });

    graphqlQuery = (body) => {
      return rq({
        url: '/graphql',
        method: 'POST',
        body,
      });
    };

    const locale = await metrix.db.query('plugin::i18n.locale').create({
      data: { code: 'fr', name: 'French' },
    });

    localeId = locale.documentId;
  });

  afterAll(async () => {
    await metrix.db.query('plugin::i18n.locale').delete({ where: { documentId: localeId } });
    await metrix.db.query('api::recipe.recipe').deleteMany();
    await metrix.destroy();
    await builder.cleanup();
  });

  test('Create localization', async () => {
    const createResponse = await graphqlQuery({
      query: /* GraphQL */ `
        mutation createRecipe($data: RecipeInput!) {
          createRecipe(data: $data) {
            data {
              documentId
              attributes {
                name
                locale
              }
            }
          }
        }
      `,
      variables: {
        data: {
          name: 'Recipe Name',
        },
      },
    });

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toMatchObject({
      data: {
        createRecipe: {
          data: {
            attributes: {
              name: 'Recipe Name',
              locale: 'en',
            },
          },
        },
      },
    });

    const recipeId = createResponse.body.data.createRecipe.data.documentId;

    const updateRecipeResponse = await graphqlQuery({
      query: /* GraphQL */ `
        mutation updateRecipe($documentId: ID!, $locale: I18NLocaleCode, $data: RecipeInput!) {
          updateRecipe(documentId: $documentId, locale: $locale, data: $data) {
            data {
              documentId
              attributes {
                name
                locale
              }
            }
          }
        }
      `,
      variables: {
        documentId: recipeId,
        locale: 'fr',
        data: {
          name: 'Recipe Name fr',
        },
      },
    });

    expect(updateRecipeResponse.statusCode).toBe(200);
    expect(updateRecipeResponse.body.data.updateRecipe).toMatchObject({
      data: {
        attributes: {
          name: 'Recipe Name fr',
          locale: 'fr',
        },
      },
    });
  });
});
