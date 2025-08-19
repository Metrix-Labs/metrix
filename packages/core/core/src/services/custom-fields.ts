import type { Core, Modules } from '@metrixlabs/types';

const createCustomFields = (metrix: Core.Strapi): Modules.CustomFields.CustomFields => {
  return {
    register(customField) {
      metrix.get('custom-fields').add(customField);
    },
  };
};

export default createCustomFields;
