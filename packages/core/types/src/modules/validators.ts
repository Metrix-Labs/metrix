import type { validate } from '@metrixlabs/utils';

export interface ValidatorsRegistry {
  get(path: string): validate.Validator[];
  add(path: string, validator: validate.Validator): this;
  set(path: string, value?: validate.Validator[]): this;
  has(path: string): boolean;
}
