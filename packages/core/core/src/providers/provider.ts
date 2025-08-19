import type { Core } from '@metrix/types';

export type Provider = {
  init?: (metrix: Core.Strapi) => void;
  register?: (metrix: Core.Strapi) => Promise<void>;
  bootstrap?: (metrix: Core.Strapi) => Promise<void>;
  destroy?: (metrix: Core.Strapi) => Promise<void>;
};

export const defineProvider = (provider: Provider) => provider;
