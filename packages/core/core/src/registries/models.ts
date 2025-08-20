import { Model } from '@metrixlabs/database';

export const registry = () => {
  const models: Model[] = [];

  return {
    add(model: Model) {
      models.push(model);
      return this;
    },

    get() {
      return models;
    },
  };
};
