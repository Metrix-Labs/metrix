export type Service = {
  // TODO [V5] Consider changing the any value to unknown.
  // See: https://github.com/metrix/metrix/issues/16993 and https://github.com/metrix/metrix/pull/17020 for further information
  [key: keyof any]: any;
};
