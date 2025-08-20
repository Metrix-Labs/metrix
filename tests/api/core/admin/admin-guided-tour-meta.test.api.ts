import { createStrapiInstance } from 'api-tests/metrix';
import { createAuthRequest } from 'api-tests/request';
import { createTestBuilder } from 'api-tests/builder';
import { Core } from '@metrix/types';

const articleContentType = {
  displayName: 'article',
  singularName: 'article',
  pluralName: 'articles',
  kind: 'collectionType',
  attributes: {
    name: {
      type: 'string',
    },
  },
};

let authRq;
let metrix: Core.Strapi;
const builder = createTestBuilder();

const restartWithSchema = async () => {
  await metrix.destroy();
  await builder.cleanup();

  await builder.addContentType(articleContentType).build();

  metrix = await createStrapiInstance();
  authRq = await createAuthRequest({ metrix });
};

describe('Guided Tour Meta', () => {
  beforeAll(async () => {
    metrix = await createStrapiInstance();
    authRq = await createAuthRequest({ metrix });
  });

  afterEach(async () => {
    // Ensure each test cleans up
    await restartWithSchema();
  });

  afterAll(async () => {
    await metrix.destroy();
    await builder.cleanup();
  });

  describe('GET /admin/guided-tour-meta', () => {
    /**
     * TODO:
     * clean-after-delete.test.api.ts leaks data causing the app
     * to intialize withe a schema and content. We need to ensure that test cleans up after itself
     * Skipping for now.
     */
    test.skip('Returns correct initial state for a new installation', async () => {
      const res = await authRq({
        url: '/admin/guided-tour-meta',
        method: 'GET',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        isFirstSuperAdminUser: true,
        completedActions: [],
      });
    });

    test('Detects first super admin user', async () => {
      const res = await authRq({
        url: '/admin/guided-tour-meta',
        method: 'GET',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.isFirstSuperAdminUser).toBe(true);

      const newUser = {
        email: 'second@user.com',
        firstname: 'second',
        lastname: 'user',
        password: 'second123',
        roles: [1],
        isActive: true,
      };
      await metrix.db.query('admin::user').create({ data: newUser });
      const request = await createAuthRequest({
        metrix,
        userInfo: newUser,
      });

      const secondSuperAdminUserResponse = await request({
        url: '/admin/guided-tour-meta',
        method: 'GET',
      });

      expect(secondSuperAdminUserResponse.status).toBe(200);
      expect(secondSuperAdminUserResponse.body.data.isFirstSuperAdminUser).toBe(false);
    });

    test('Detects created content type schemas', async () => {
      await restartWithSchema();

      const res = await authRq({
        url: '/admin/guided-tour-meta',
        method: 'GET',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.completedActions).toContain('didCreateContentTypeSchema');
    });

    test('Detects created content', async () => {
      await restartWithSchema();

      const createdDocument = await metrix.documents('api::article.article').create({
        data: {
          name: 'Article 1',
        },
      });

      const res = await authRq({
        url: '/admin/guided-tour-meta',
        method: 'GET',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.completedActions).toContain('didCreateContent');

      // Cleanup
      await metrix.documents('api::article.article').delete({
        documentId: createdDocument.documentId,
      });
    });

    test('Detects created custom API tokens', async () => {
      // Create a custom API token
      const createdToken = await metrix.documents('admin::api-token').create({
        data: {
          name: 'Custom Token',
          type: 'read-only',
          description: 'Test token',
          accessKey: 'beep boop',
        },
      });

      const res = await authRq({
        url: '/admin/guided-tour-meta',
        method: 'GET',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.completedActions).toContain('didCreateApiToken');

      // Cleanup
      await metrix.documents('admin::api-token').delete({
        documentId: createdToken.documentId,
      });
    });
  });
});
