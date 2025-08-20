import type { FormLayoutInputProps } from '../../../../../../../../admin/src/types/forms';

export const FORM_INITIAL_VALUES = {
  ...(window.metrix.features.isEnabled(window.metrix.features.SSO)
    ? {
        useSSORegistration: true,
      }
    : {}),
};

export const ROLE_LAYOUT = [
  ...(window.metrix.features.isEnabled(window.metrix.features.SSO)
    ? [
        [
          {
            label: {
              id: 'Settings.permissions.users.form.sso',
              defaultMessage: 'Connect with SSO',
            },
            name: 'useSSORegistration',
            type: 'boolean' as const,
            size: 6,
          },
        ],
      ]
    : []),
] satisfies FormLayoutInputProps[][];
