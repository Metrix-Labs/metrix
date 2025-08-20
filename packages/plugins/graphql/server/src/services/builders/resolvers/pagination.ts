import type { Context } from '../../types';

export default ({ metrix }: Context) => ({
  async resolvePagination(parent: any, _: any, ctx: any) {
    const { args, resourceUID } = parent.info;
    const { start, limit } = args;
    const safeLimit = Math.max(limit, 1);
    const contentType = metrix.getModel(resourceUID);

    await metrix.contentAPI.validate.query(args, contentType, {
      auth: ctx?.state?.auth,
    });

    const sanitizedQuery = await metrix.contentAPI.sanitize.query(args, contentType, {
      auth: ctx?.state?.auth,
    });

    const total = await metrix.documents!(resourceUID).count(sanitizedQuery);

    const pageSize = limit === -1 ? total - start : safeLimit;
    const pageCount = limit === -1 ? safeLimit : Math.ceil(total / safeLimit);
    const page = limit === -1 ? safeLimit : Math.floor(start / safeLimit) + 1;

    return { total, page, pageSize, pageCount };
  },
});
