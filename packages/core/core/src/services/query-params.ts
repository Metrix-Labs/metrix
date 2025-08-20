import { queryParams } from '@metrixlabs/utils';
import type { Core, UID } from '@metrixlabs/types';

export default (metrix: Core.Strapi) => {
  const { transformQueryParams } = queryParams.createTransformer({
    getModel: (uid: string) => metrix.getModel(uid as UID.Schema),
  });

  return {
    transform: transformQueryParams,
  };
};
