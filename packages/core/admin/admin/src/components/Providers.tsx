import * as React from 'react';

import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';

import { AuthProvider } from '../features/Auth';
import { HistoryProvider } from '../features/BackButton';
import { ConfigurationProvider } from '../features/Configuration';
import { NotificationsProvider } from '../features/Notifications';
import { StrapiAppProvider } from '../features/StrapiApp';
import { TrackingProvider } from '../features/Tracking';

import { GuidedTourContext } from './GuidedTour/Context';
import { LanguageProvider } from './LanguageProvider';
import { Theme } from './Theme';

import type { Store } from '../core/store/configure';
import type { StrapiApp } from '../StrapiApp';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
  metrix: StrapiApp;
  store: Store;
}

const Providers = ({ children, metrix, store }: ProvidersProps) => {
  const isGuidedTourEnabled = process.env.NODE_ENV !== 'test';

  return (
    <StrapiAppProvider
      components={metrix.library.components}
      customFields={metrix.customFields}
      widgets={metrix.widgets}
      fields={metrix.library.fields}
      menu={metrix.router.menu}
      getAdminInjectedComponents={metrix.getAdminInjectedComponents}
      getPlugin={metrix.getPlugin}
      plugins={metrix.plugins}
      rbac={metrix.rbac}
      runHookParallel={metrix.runHookParallel}
      runHookWaterfall={(name, initialValue) => metrix.runHookWaterfall(name, initialValue, store)}
      runHookSeries={metrix.runHookSeries}
      settings={metrix.router.settings}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <HistoryProvider>
              <LanguageProvider messages={metrix.configurations.translations}>
                <Theme themes={metrix.configurations.themes}>
                  <NotificationsProvider>
                    <TrackingProvider>
                      <GuidedTourContext enabled={isGuidedTourEnabled}>
                        <ConfigurationProvider
                          defaultAuthLogo={metrix.configurations.authLogo}
                          defaultMenuLogo={metrix.configurations.menuLogo}
                          showReleaseNotification={metrix.configurations.notifications.releases}
                        >
                          {children}
                        </ConfigurationProvider>
                      </GuidedTourContext>
                    </TrackingProvider>
                  </NotificationsProvider>
                </Theme>
              </LanguageProvider>
            </HistoryProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </StrapiAppProvider>
  );
};

export { Providers };
