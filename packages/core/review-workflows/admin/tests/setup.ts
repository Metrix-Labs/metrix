import { server } from '@metrixlabs/admin/metrix-admin/test';

import { HANDLERS } from './handlers';

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  server.use(...HANDLERS);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
