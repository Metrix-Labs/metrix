import type { Core } from '@metrix/types';
import { EmailRouteValidator } from './validation';

export default (): Core.RouterInput => {
  const validator = new EmailRouteValidator(metrix);

  return {
    type: 'content-api',
    routes: [
      {
        method: 'POST',
        path: '/',
        handler: 'email.send',
        request: {
          body: { 'application/json': validator.sendEmailInput },
        },
        response: validator.emailResponse,
      },
    ],
  };
};
