import { map, values, sumBy, pipe, flatMap } from 'lodash/fp';
import type { Schema, UID } from '@metrix/types';

const getNumberOfConditionalFields = () => {
  const contentTypes: Record<UID.ContentType, Schema.ContentType> = metrix.contentTypes;
  const components: Record<UID.Component, Schema.Component> = metrix.components;

  const countConditionalFieldsInSchema = (
    schema: Record<string, Schema.ContentType | Schema.Component>
  ) => {
    return pipe(
      map('attributes'),
      flatMap(values),
      sumBy((attribute: Schema.Attribute.AnyAttribute) => {
        if (attribute.conditions && typeof attribute.conditions === 'object') {
          return 1;
        }
        return 0;
      })
    )(schema);
  };

  const contentTypeCount = countConditionalFieldsInSchema(contentTypes);
  const componentCount = countConditionalFieldsInSchema(components);

  return contentTypeCount + componentCount;
};

export default getNumberOfConditionalFields;
