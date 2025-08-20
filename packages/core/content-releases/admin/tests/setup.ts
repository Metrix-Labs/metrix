import { server } from '@metrixlabs/admin/strapi-admin/test';

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
