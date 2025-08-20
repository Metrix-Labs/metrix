import type { Core } from '@metrixlabs/types';
import passport from 'koa-passport';
import { getService } from '../../utils';
import utils from './utils';

const defaultConnectionError = () => new Error('Invalid connection payload');

export const authenticate: Core.MiddlewareHandler = async (ctx, next) => {
  const {
    params: { provider },
  } = ctx;
  const redirectUrls = utils.getPrefixedRedirectUrls();

  // @ts-expect-error - can not use null to authenticate
  return passport.authenticate(provider, null, async (error, profile) => {
    if (error || !profile || !profile.email) {
      if (error) {
        metrix.log.error(error);
      }

      metrix.eventHub.emit('admin.auth.error', {
        error: error || defaultConnectionError(),
        provider,
      });

      return ctx.redirect(redirectUrls.error);
    }

    const user = await getService('user').findOneByEmail(profile.email);
    const scenario = user ? existingUserScenario : nonExistingUserScenario;

    return scenario(ctx, next)(user || profile, provider);
  })(ctx, next);
};

const existingUserScenario: Core.MiddlewareHandler =
  (ctx, next) => async (user: any, provider: any) => {
    const redirectUrls = utils.getPrefixedRedirectUrls();

    if (!user.isActive) {
      metrix.eventHub.emit('admin.auth.error', {
        error: new Error(`Deactivated user tried to login (${user.id})`),
        provider,
      });
      return ctx.redirect(redirectUrls.error);
    }

    ctx.state.user = user;
    return next();
  };

const nonExistingUserScenario: Core.MiddlewareHandler =
  (ctx, next) => async (profile: any, provider: any) => {
    const { email, firstname, lastname, username } = profile;
    const redirectUrls = utils.getPrefixedRedirectUrls();
    const adminStore = await utils.getAdminStore();
    const { providers } = (await adminStore.get({ key: 'auth' })) as any;

    // We need at least the username or the firstname/lastname combination to register a new user
    const isMissingRegisterFields = !username && (!firstname || !lastname);

    if (!providers.autoRegister || !providers.defaultRole || isMissingRegisterFields) {
      metrix.eventHub.emit('admin.auth.error', { error: defaultConnectionError(), provider });
      return ctx.redirect(redirectUrls.error);
    }

    const defaultRole = await getService('role').findOne({ id: providers.defaultRole });

    // If the default role has been misconfigured, redirect with an error
    if (!defaultRole) {
      metrix.eventHub.emit('admin.auth.error', { error: defaultConnectionError(), provider });
      return ctx.redirect(redirectUrls.error);
    }

    // Register a new user with the information given by the provider and login with it
    ctx.state.user = await getService('user').create({
      email,
      username,
      firstname,
      lastname,
      roles: [defaultRole.id],
      isActive: true,
      registrationToken: null,
    });

    metrix.eventHub.emit('admin.auth.autoRegistration', {
      user: ctx.state.user,
      provider,
    });

    return next();
  };

export const redirectWithAuth: Core.MiddlewareHandler = (ctx) => {
  const {
    params: { provider },
  } = ctx;
  const redirectUrls = utils.getPrefixedRedirectUrls();
  const domain: string | undefined = metrix.config.get('admin.auth.domain');
  const { user } = ctx.state;

  const jwt = getService('token').createJwtToken(user);

  const isProduction = metrix.config.get('environment') === 'production';

  const cookiesOptions = { httpOnly: false, secure: isProduction, overwrite: true, domain };

  const sanitizedUser = getService('user').sanitizeUser(user);
  metrix.eventHub.emit('admin.auth.success', { user: sanitizedUser, provider });

  ctx.cookies.set('jwtToken', jwt, cookiesOptions);
  ctx.redirect(redirectUrls.success);
};

export default {
  authenticate,
  redirectWithAuth,
};
