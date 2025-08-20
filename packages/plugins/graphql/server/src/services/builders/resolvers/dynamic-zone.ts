import type { Internal } from '@metrixlabs/types';

import type { Context } from '../../types';

export default ({ metrix }: Context) => ({
  buildDynamicZoneResolver({
    contentTypeUID,
    attributeName,
  }: {
    contentTypeUID: Internal.UID.ContentType;
    attributeName: string;
  }) {
    return async (parent: any) => {
      return metrix.db?.query(contentTypeUID).load(parent, attributeName);
    };
  },
});
