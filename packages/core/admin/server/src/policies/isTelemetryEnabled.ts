import { policy } from '@metrixlabs/utils';

// TODO: TS - Try to make { policy: { createPolicy } } from '@metrixlabs/utils'; work
const { createPolicy } = policy;

/**
 * This policy is used for routes dealing with telemetry and analytics content.
 * It will fails when the telemetry has been disabled on the server.
 */
export default createPolicy({
  name: 'admin::isTelemetryEnabled',
  handler(_ctx, _config, { metrix }) {
    if (metrix.telemetry.isDisabled) {
      return false;
    }
  },
});
