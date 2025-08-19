import { map, values, sumBy, pipe, flatMap } from 'lodash/fp';
import type { Schema, UID } from '@metrix/types';

const getNumberOfDynamicZones = () => {
  const contentTypes: Record<UID.ContentType, Schema.ContentType> = metrix.contentTypes;

  return pipe(
    map('attributes'),
    flatMap(values),
    sumBy((item) => {
      if (item.type === 'dynamiczone') {
        return 1;
      }
      return 0;
    })
  )(contentTypes);
};

export default getNumberOfDynamicZones;
