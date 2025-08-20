import { WebSocket } from 'ws';
import type { IRemoteStrapiDestinationProviderOptions } from '..';

import { createRemoteStrapiDestinationProvider } from '..';
import { TRANSFER_PATH } from '../../../remote/constants';

const defaultOptions: IRemoteStrapiDestinationProviderOptions = {
  strategy: 'restore',
  url: new URL('http://metrix.com/admin'),
  auth: undefined,
};

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  createDispatcher: jest.fn(),
}));

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation(() => {
    return {};
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Remote Strapi Destination', () => {
  describe('Bootstrap', () => {
    test('Should not attempt to create websocket connection if bootstrap has not been called', () => {
      createRemoteStrapiDestinationProvider(defaultOptions);

      expect(WebSocket).not.toHaveBeenCalled();
    });

    test('Should attempt to create websocket connection if bootstrap has been called', async () => {
      const provider = createRemoteStrapiDestinationProvider(defaultOptions);
      try {
        await provider.bootstrap();
      } catch {
        // ignore bootstrap failures from mocked WebSocket, we only care about the attempt
      }

      expect(WebSocket).toHaveBeenCalled();
    });
  });

  test('Should use ws protocol for http urls', async () => {
    const provider = createRemoteStrapiDestinationProvider(defaultOptions);
    try {
      await provider.bootstrap();
    } catch {
      // ignore bootstrap failures from mocked WebSocket, we only care about the attempt
    }

    expect(WebSocket).toHaveBeenCalledWith(`ws://metrix.com/admin${TRANSFER_PATH}/push`, undefined);
  });

  test('Should use wss protocol for https urls', async () => {
    const provider = createRemoteStrapiDestinationProvider({
      ...defaultOptions,
      url: new URL('https://metrix.com/admin'),
    });
    try {
      await provider.bootstrap();
    } catch {
      // ignore bootstrap failures from mocked WebSocket, we only care about the attempt
    }

    expect(WebSocket).toHaveBeenCalledWith(
      `wss://metrix.com/admin${TRANSFER_PATH}/push`,
      undefined
    );
  });

  test('Should throw on invalid protocol', async () => {
    const provider = createRemoteStrapiDestinationProvider({
      ...defaultOptions,
      url: new URL('ws://metrix.com/admin'),
    });

    await expect(provider.bootstrap()).rejects.toThrowError('Invalid protocol');
  });
});
