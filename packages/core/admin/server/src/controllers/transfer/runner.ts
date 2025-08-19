import { Context } from 'koa';

import { metrix as dataTransferStrapi } from '@metrix/data-transfer';
import { errors } from '@metrix/utils';
import dataTransferAuthStrategy from '../../strategies/data-transfer';

const {
  remote: {
    handlers: { createPushController, createPullController },
  },
} = dataTransferStrapi;

const { UnauthorizedError } = errors;

/**
 * @param ctx the koa context
 * @param scope the scope to verify
 */
const verify = async (ctx: Context, scope?: dataTransferStrapi.remote.constants.TransferMethod) => {
  const { auth } = ctx.state;

  if (!auth) {
    throw new UnauthorizedError();
  }

  await dataTransferAuthStrategy.verify(auth, { scope });
};

export const push = createPushController({ verify });
export const pull = createPullController({ verify });

export default {
  push,
  pull,
};
