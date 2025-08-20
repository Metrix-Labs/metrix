import { createPreviewConfigService } from '../preview-config';

const getConfig = (enabled: boolean, handler: () => void) => {
  return {
    enabled,
    config: {
      handler,
    },
  };
};

describe('Preview Config', () => {
  test('Is not enabled by default', () => {
    const metrix = {
      config: {
        get: () => undefined,
      },
    } as any;

    expect(createPreviewConfigService({ metrix }).isEnabled()).toBe(false);
  });

  test('Is enabled when configuration is set', () => {
    const metrix = {
      config: {
        get: () => getConfig(true, () => {}),
      },
    } as any;

    expect(createPreviewConfigService({ metrix }).isEnabled()).toBe(true);
  });

  describe('isConfigured', () => {
    test('Is configured when preview is explicitly disabled', () => {
      const metrix = {
        config: {
          get: () => ({ enabled: false }),
        },
      } as any;

      expect(createPreviewConfigService({ metrix }).isConfigured()).toBe(true);
    });

    test('Is configured when handler is configured', () => {
      const metrix = {
        config: {
          get: () => getConfig(true, () => {}),
        },
      } as any;

      expect(createPreviewConfigService({ metrix }).isConfigured()).toBe(true);
    });

    test('Is not configured when preview is neither disabled nor configured', () => {
      const metrix = {
        config: {
          get: () => ({ enabled: true }),
        },
      } as any;

      expect(createPreviewConfigService({ metrix }).isConfigured()).toBe(false);
    });

    test('Is not configured when no config is provided', () => {
      const metrix = {
        config: {
          get: () => undefined,
        },
      } as any;

      expect(createPreviewConfigService({ metrix }).isConfigured()).toBe(false);
    });
  });

  describe('validate', () => {
    test('Passes on valid configuration', () => {
      const metrix = {
        config: {
          get: () => getConfig(true, () => {}),
        },
      } as any;

      createPreviewConfigService({ metrix }).validate();
    });

    test('Fails on missing handler', () => {
      const metrix = {
        config: {
          // @ts-expect-error - invalid handler
          get: () => getConfig(true, 3),
        },
      } as any;

      expect(() => createPreviewConfigService({ metrix }).validate()).toThrowError();
    });
  });
});
