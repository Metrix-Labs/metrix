import { errors } from '@metrix/utils';
import createLocalStrategy from '../../../../server/src/services/passport/local-strategy';
import sso from './passport/sso';
import { isSsoLocked } from '../utils/sso-lock';

const { UnauthorizedError } = errors;

const localStrategyMiddleware = async ([error, user, message]: any, done: any) => {
  // if we got a user, we need to check that it's not sso locked
  if (user && !error && (await isSsoLocked(user))) {
    return done(
      new UnauthorizedError('Login not allowed, please contact your administrator', {
        code: 'LOGIN_NOT_ALLOWED',
      }),
      user,
      message
    );
  }

  return done(error, user, message);
};

const getPassportStrategies = () => {
  if (!metrix.ee.features.isEnabled('sso')) {
    return [createLocalStrategy(metrix)];
  }

  const localStrategy = createLocalStrategy(metrix, localStrategyMiddleware);

  if (!metrix.isLoaded) {
    sso.syncProviderRegistryWithConfig();
  }

  // TODO
  // @ts-expect-error check map types
  const providers = sso.providerRegistry.getAll();
  const strategies = providers.map((provider: any) => provider.createStrategy(metrix));

  return [localStrategy, ...strategies];
};

export default {
  getPassportStrategies,
  ...sso,
};
