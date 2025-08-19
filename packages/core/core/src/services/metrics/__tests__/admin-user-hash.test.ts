import crypto from 'crypto';
// eslint-disable-next-line import/no-relative-packages
import createContext from '../../../../../../../tests/helpers/create-context';
import { generateAdminUserHash } from '../admin-user-hash';

describe('user email hash', () => {
  test('should create a hash from admin user email', () => {
    const state = {
      user: {
        email: 'testemail@metrix.io',
      },
    };

    const ctx = createContext({}, { state });

    const metrix = {
      requestContext: {
        get: jest.fn(() => ctx),
      },
    };

    const hash = crypto.createHash('sha256').update('testemail@metrix.io').digest('hex');

    const userId = generateAdminUserHash(metrix as any);
    expect(userId).toBe(hash);
  });

  test('should return empty string if user is not available on ctx', () => {
    const ctx = createContext({}, {});

    const metrix = {
      requestContext: {
        get: jest.fn(() => ctx),
      },
    };

    const userId = generateAdminUserHash(metrix as any);
    expect(userId).toBe('');
  });
});
