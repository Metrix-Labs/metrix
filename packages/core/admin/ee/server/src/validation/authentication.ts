import { yup, validateYupSchema } from '@metrixlabs/utils';

const providerOptionsUpdateSchema = yup.object().shape({
  autoRegister: yup.boolean().required(),
  defaultRole: yup
    .strapiID()
    .when('autoRegister', (value, initSchema) => {
      return value ? initSchema.required() : initSchema.nullable();
    })
    .test('is-valid-role', 'You must submit a valid default role', (roleId) => {
      if (roleId === null) {
        return true;
      }
      return metrix.service('admin::role').exists({ id: roleId });
    }),
  ssoLockedRoles: yup
    .array()
    .nullable()
    .of(
      yup
        .strapiID()
        .test(
          'is-valid-role',
          'You must submit a valid role for the SSO Locked roles',
          (roleId) => {
            return metrix.service('admin::role').exists({ id: roleId });
          }
        )
    ),
});

export const validateProviderOptionsUpdate = validateYupSchema(providerOptionsUpdateSchema);

export default {
  validateProviderOptionsUpdate,
};
