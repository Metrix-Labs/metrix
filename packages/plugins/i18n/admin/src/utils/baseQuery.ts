import { type ApiError, type UnknownApiError } from '@metrixlabs/admin/metrix-admin';
import { SerializedError } from '@reduxjs/toolkit';

type BaseQueryError = ApiError | UnknownApiError | SerializedError;

const isBaseQueryError = (error: BaseQueryError): error is ApiError | UnknownApiError => {
  return error.name !== undefined;
};

export { isBaseQueryError };
