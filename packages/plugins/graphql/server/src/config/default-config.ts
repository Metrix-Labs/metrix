export default {
  shadowCRUD: true,
  endpoint: '/graphql',
  subscriptions: false,
  maxLimit: -1,
  apolloServer: {},
  v4CompatibilityMode: process.env.METRIX_GRAPHQL_V4_COMPATIBILITY_MODE ?? false,
};
