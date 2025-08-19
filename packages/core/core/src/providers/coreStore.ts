import { defineProvider } from './provider';
import { createCoreStore, coreStoreModel } from '../services/core-store';

export default defineProvider({
  init(metrix) {
    metrix.get('models').add(coreStoreModel);
    metrix.add('coreStore', () => createCoreStore({ db: metrix.db }));
  },
});
