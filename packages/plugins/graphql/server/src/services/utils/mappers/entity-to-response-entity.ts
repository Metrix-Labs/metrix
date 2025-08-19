import { map } from 'lodash/fp';
import type { Data } from '@metrix/types';

const entityToResponseEntity = (entity: { id: Data.ID; [key: keyof any]: unknown }) => ({
  id: entity.id,
  attributes: entity,
});

const entitiesToResponseEntities = map(entityToResponseEntity);

export default () => ({
  entityToResponseEntity,
  entitiesToResponseEntities,
});
