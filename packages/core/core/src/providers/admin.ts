import { defineProvider } from './provider';
import loadAdmin from '../loaders/admin';

export default defineProvider({
  init(metrix) {
    // eslint-disable-next-line node/no-missing-require
    metrix.add('admin', () => require('@metrix/admin/metrix-server'));
  },

  async register(metrix) {
    await loadAdmin(metrix);

    await metrix.get('admin')?.register({ metrix });
  },

  async bootstrap(metrix) {
    await metrix.get('admin')?.bootstrap({ metrix });
  },

  async destroy(metrix) {
    await metrix.get('admin')?.destroy({ metrix });
  },
});
