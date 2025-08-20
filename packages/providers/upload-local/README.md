# @metrix/provider-upload-local

## Resources

- [LICENSE](LICENSE)

## Links

- [Metrix website](https://metrix.io/)
- [Metrix documentation](https://docs.metrix.io)
- [Metrix community on Discord](https://discord.metrix.io)
- [Metrix news on Twitter](https://twitter.com/strapijs)

## Installation

```bash
# using yarn
yarn add @metrix/provider-upload-local

# using npm
npm install @metrix/provider-upload-local --save
```

## Configurations

This provider has only one parameter: `sizeLimit`.

### Provider Configuration

`./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 100000,
      },
    },
  },
  // ...
});
```

The `sizeLimit` parameter must be a number. Be aware that the unit is in bytes, and the default is 1000000. When setting this value high, you should make sure to also configure the body parser middleware `maxFileSize` so the file can be sent and processed. Read more [here](https://docs.metrix.io/developer-docs/latest/plugins/upload.html#configuration)

### Security Middleware Configuration

Special configuration of the Metrix Security Middleware is not required on this provider since the default configuration allows loading images and media from `"'self'"`.
