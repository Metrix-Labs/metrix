module.exports = {
  apps: [
    {
      name: 'metrix-getstarted',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
