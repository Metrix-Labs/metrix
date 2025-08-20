# @metrix/provider-email-amazon-ses

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
yarn add @metrix/provider-email-amazon-ses

# using npm
npm install @metrix/provider-email-amazon-ses --save
```

## Configuration

| Variable                | Type                    | Description                                                                                                                | Required | Default   |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| provider                | string                  | The name of the provider you use                                                                                           | yes      |           |
| providerOptions         | object                  | Will be directly given to `createClient` function. Please refer to [node-ses](https://www.npmjs.com/package/node-ses) doc. | yes      |           |
| settings                | object                  | Settings                                                                                                                   | no       | {}        |
| settings.defaultFrom    | string                  | Default sender mail address                                                                                                | no       | undefined |
| settings.defaultReplyTo | string \| array<string> | Default address or addresses the receiver is asked to reply to                                                             | no       | undefined |

> :warning: The Shipper Email (or defaultfrom) may also need to be changed in the `Email Templates` tab on the admin panel for emails to send properly

### Example

**Path -** `./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'amazon-ses',
      providerOptions: {
        key: env('AWS_SES_KEY'),
        secret: env('AWS_SES_SECRET'),
        amazon: `https://email.${env('AWS_SES_REGION', 'us-east-1')}.amazonaws.com`, // https://docs.aws.amazon.com/general/latest/gr/ses.html
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```

**Path -** `.env`

```env
AWS_SES_KEY=
AWS_SES_SECRET=
AWS_SES_REGION=
```
