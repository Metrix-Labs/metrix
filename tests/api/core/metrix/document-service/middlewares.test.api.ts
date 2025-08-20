import type { Core } from '@metrix/types';

import { createTestSetup, destroyTestSetup } from '../../../utils/builder-helper';
import resources from './resources/index';
import { ARTICLE_UID } from './utils';

describe('Document Service', () => {
  let testUtils;
  let metrix: Core.Strapi;

  beforeAll(async () => {
    testUtils = await createTestSetup(resources);
    metrix = testUtils.metrix;
  });

  afterAll(async () => {
    await destroyTestSetup(testUtils);
  });

  describe('Middlewares', () => {
    it('Add filters', async () => {
      metrix.documents.use((ctx, next) => {
        if (ctx.action === 'findMany') {
          ctx.params.filters = { title: 'Article1-Draft-EN' };
        }

        return next();
      });

      const articles = await metrix.documents('api::article.article').findMany();

      expect(articles).toHaveLength(1);
    });
  });
});
