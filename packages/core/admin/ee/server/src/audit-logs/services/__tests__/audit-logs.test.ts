import { createAuditLogsLifecycleService } from '../lifecycles';
import '@metrixlabs/types';

describe('Audit logs service', () => {
  const mockSubscribe = jest.fn();

  const metrix = {
    requestContext: {
      get() {
        return {
          state: {
            user: {
              id: 1,
            },
            route: {
              info: {
                type: 'admin',
              },
            },
          },
        };
      },
    },
    ee: {
      features: {
        isEnabled: jest.fn().mockReturnValue(false),
        get: jest.fn(),
      },
    },
    add: jest.fn(),
    get: jest.fn(() => ({
      deleteExpiredEvents: jest.fn(),
    })),
    cron: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    config: {
      get(key: any) {
        switch (key) {
          case 'admin.auditLogs.enabled':
            return true;
          case 'admin.auditLogs.retentionDays':
            return undefined;
          default:
            return null;
        }
      },
    },
    eventHub: {
      subs: {} as Record<string, (...args: unknown[]) => unknown>,
      emit(eventName: string, ...args: unknown[]) {
        this.subs[eventName](...args);
      },
      on(eventName: string, func: (...args: unknown[]) => unknown) {
        this.subs[eventName] = func;
        return () => {
          delete this.subs[eventName];
        };
      },
      subscribe: mockSubscribe,
    },
    hook: () => ({
      register: jest.fn(),
    }),
  } as any;

  afterEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should not subscribe to events when the license does not allow it', async () => {
    // Should not subscribe to events at first
    const lifecycle = createAuditLogsLifecycleService(metrix);
    await lifecycle.register();
    const destroySpy = jest.spyOn(lifecycle, 'destroy');
    const registerSpy = jest.spyOn(lifecycle, 'register');

    expect(mockSubscribe).not.toHaveBeenCalled();

    // Should subscribe to events when license gets enabled
    jest.mocked(metrix.ee.features.isEnabled).mockImplementationOnce(() => true);
    await metrix.eventHub.emit('ee.enable');
    expect(mockSubscribe).toHaveBeenCalled();

    // Should unsubscribe to events when license gets disabled
    mockSubscribe.mockClear();
    jest.mocked(metrix.ee.features.isEnabled).mockImplementationOnce(() => false);
    await metrix.eventHub.emit('ee.disable');
    expect(mockSubscribe).not.toHaveBeenCalled();
    expect(destroySpy).toHaveBeenCalled();

    // Should recreate the service when license updates
    await metrix.eventHub.emit('ee.update');
    expect(destroySpy).toHaveBeenCalled();
    expect(registerSpy).toHaveBeenCalled();
  });

  it('should create a cron job that executed one time a day', async () => {
    // Mock Strapi EE feature to be enabled for this test
    jest.mocked(metrix.ee.features.isEnabled).mockReturnValueOnce(true);

    const lifecycle = createAuditLogsLifecycleService(metrix);
    await lifecycle.register();

    // Verify that metrix.cron.add was called with the correct job configuration
    expect(metrix.cron.add).toHaveBeenCalledWith({
      deleteExpiredAuditLogs: {
        task: expect.any(Function),
        options: '0 0 * * *',
      },
    });
  });
});
