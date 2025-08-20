const { createTestTransferToken } = require('./create-transfer-token');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { metrix } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ metrix }) {
    metrix.service('api::config.config').rateLimitEnable(false);
    metrix.service('api::config.config').adminAutoOpenEnable(false);

    await createTestTransferToken(metrix);
  },
};
