import { translatedErrors } from '@metrixlabs/admin/strapi-admin';
import * as yup from 'yup';

export const schema = yup.object().shape({
  email: yup.string().email(translatedErrors.email.id).required(translatedErrors.required.id),
});
