import type { Plugin } from '@metrixlabs/types';
import history from './history';

const destroy: Plugin.LoadedPlugin['destroy'] = async ({ metrix }) => {
  await history.destroy?.({ metrix });
};

export default destroy;
