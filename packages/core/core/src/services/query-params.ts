import { queryParams } from '@metrixlabs/utils';
import type { Core, UID } from '@metrixlabs/types';

export default (strapi: Core.Strapi) => {
  const { transformQueryParams } = queryParams.createTransformer({
    getModel: (uid: string) => strapi.getModel(uid as UID.Schema),
  });

  return {
    transform: transformQueryParams,
  };
};
