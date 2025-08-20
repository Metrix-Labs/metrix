module.exports = {
  async rateLimitEnable(value) {
    metrix.config.set('admin.rateLimit.enabled', !!value);
  },
  async adminAutoOpenEnable(value) {
    metrix.config.set('admin.autoOpen', !!value);
  },
};
