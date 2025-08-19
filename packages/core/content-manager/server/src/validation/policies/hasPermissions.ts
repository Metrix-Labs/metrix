import { yup, validateYupSchemaSync } from '@metrix/utils';

const hasPermissionsSchema = yup.object({
  actions: yup.array().of(yup.string()),
  hasAtLeastOne: yup.boolean(),
});

export const validateHasPermissionsInput = validateYupSchemaSync(hasPermissionsSchema);
