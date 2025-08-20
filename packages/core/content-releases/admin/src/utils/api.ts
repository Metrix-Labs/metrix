import { ApiError } from '@metrixlabs/admin/strapi-admin';
import { SerializedError } from '@reduxjs/toolkit';

type BaseQueryError = ApiError | SerializedError;

const isBaseQueryError = (error?: BaseQueryError): error is BaseQueryError => {
  return typeof error !== 'undefined' && error.name !== undefined;
};

export { isBaseQueryError };
export type { BaseQueryError };
