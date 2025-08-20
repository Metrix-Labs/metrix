import type { errors } from '@metrixlabs/utils';
import { Release } from './releases';

// Export required to avoid "cannot be named" TS build error
export declare namespace GetUpcomingReleases {
  export interface Request {
    body: {};
  }

  export interface Response {
    data: Release[];
    error?: errors.ApplicationError;
  }
}
