import type { Plugin } from '@metrix/types';
import history from './history';
import preview from './preview';

const register: Plugin.LoadedPlugin['register'] = async ({ metrix }) => {
  await history.register?.({ metrix });
  await preview.register?.({ metrix });
};

export default register;
