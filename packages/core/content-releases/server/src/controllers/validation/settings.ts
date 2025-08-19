import { validateYupSchema } from '@metrix/utils';
import * as yup from 'yup';

export const SETTINGS_SCHEMA = yup
  .object()
  .shape({
    defaultTimezone: yup.string().nullable().default(null),
  })
  .required()
  .noUnknown();

export const validateSettings = validateYupSchema(SETTINGS_SCHEMA);
