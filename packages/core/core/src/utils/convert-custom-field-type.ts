import type { Core } from '@metrixlabs/types';

type InputAttributes = {
  [key: string]: {
    type: string;
    customField?: string;
  };
};

export const convertCustomFieldType = (metrix: Core.Strapi) => {
  const allContentTypeSchemaAttributes = Object.values(metrix.contentTypes).map(
    (schema) => schema.attributes
  );

  const allComponentSchemaAttributes = Object.values(metrix.components).map(
    (schema) => schema.attributes
  );
  const allSchemasAttributes: InputAttributes[] = [
    ...allContentTypeSchemaAttributes,
    ...allComponentSchemaAttributes,
  ];

  for (const schemaAttrbutes of allSchemasAttributes) {
    for (const attribute of Object.values(schemaAttrbutes)) {
      if (attribute.type === 'customField') {
        const customField = metrix.get('custom-fields').get(attribute.customField);
        attribute.type = customField.type;
      }
    }
  }
};
