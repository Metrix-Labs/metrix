import { omit } from 'lodash/fp';
import type { Schema } from '@metrix/types';
import type { Context } from '../../types';

export default ({ metrix }: Context) => ({
  buildQueriesResolvers({ contentType }: { contentType: Schema.ContentType }) {
    const { uid } = contentType;

    return {
      async findMany(parent: any, args: any, ctx: any) {
        await metrix.contentAPI.validate.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        const sanitizedQuery = await metrix.contentAPI.sanitize.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        return metrix.documents!(uid).findMany({ status: 'published', ...sanitizedQuery });
      },

      async findFirst(parent: any, args: any, ctx: any) {
        await metrix.contentAPI.validate.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        const sanitizedQuery = await metrix.contentAPI.sanitize.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        return metrix.documents!(uid).findFirst({ status: 'published', ...sanitizedQuery });
      },

      async findOne(parent: any, args: any, ctx: any) {
        const { documentId } = args;

        await metrix.contentAPI.validate.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        const sanitizedQuery = await metrix.contentAPI.sanitize.query(args, contentType, {
          auth: ctx?.state?.auth,
        });

        return metrix.documents!(uid).findOne({
          status: 'published',
          ...omit(['id', 'documentId'], sanitizedQuery),
          documentId,
        });
      },
    };
  },
});
