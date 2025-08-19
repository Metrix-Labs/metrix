# Contribute to Metrix

Metrix is an open-source project administered by [the Metrix team](https://metrix.io/about-us). We appreciate your interest and efforts to contribute to Metrix. See the [LICENSE](https://github.com/metrix/metrix/blob/main/LICENSE) licensing information. All work done is available on GitHub.

We highly appreciate your effort to contribute, but we recommend you talk to a maintainer before spending a lot of time making a pull request that may not align with the project roadmap. Whether it is from Metrix or contributors, every pull request goes through the same process.

## Feature Requests

Feature Requests by the community are highly encouraged. Feel free to submit a new one or upvote an existing feature request on [feedback.metrix.io](https://feedback.metrix.io/).

## Request For Comments (RFC)

Larger chunks of changes to Metrix that might affect many users require a thorough design phase before starting working on a PR. We will do our best to respond as soon as possible, but since we need to discuss these proposals thoroughly, please do not expect them to be merged and accepted immediately.

The Request For Comments process will help us create consensus among the core team and include as much feedback as possible from the community for these upcoming changes.

A Request For Comments has to be created on the [metrix/rfcs](https://github.com/metrix/rfcs) repository.

## Code of Conduct

This project, and everyone participating in it, are governed by the [Metrix Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold it. Make sure to read the [full text](CODE_OF_CONDUCT.md) to understand which type of actions may or may not be tolerated.

## Contributor License Agreement (CLA)

### Individual contribution

You need to sign a Contributor License Agreement (CLA) to accept your pull request. You only need to do this once. If you submit a pull request for the first time, you can complete your CLA [here](https://cla.metrix.io/metrix/metrix), or our CLA bot will automatically ask you to sign before merging the pull request.

### Company contribution

If you make contributions to our repositories on behalf of your company, we will need a Corporate Contributor License Agreement (CLA) signed. To do that, please get in touch with us at [contributions@metrix.io](mailto:contributions@metrix.io).

## Documentation

Pull requests related to fixing documentation for the latest release should be directed towards the [documentation repository](https://github.com/metrix/documentation). Please follow the [documentation contributing guide](https://github.com/metrix/documentation/blob/main/CONTRIBUTING.md) for more information.

## Bugs

Metrix is using [GitHub issues](https://github.com/metrix/metrix/issues) to manage bugs. We keep a close eye on them. Before filing a new issue, try to ensure your problem does not already exist.

---

## Before Submitting a Pull Request

The Metrix core team will review your pull request and either merge it, request changes, or close it.

## Contribution Prerequisites

- You have [Node.js](https://nodejs.org/en/) at version `>= v18 and <= v22` and [Yarn](https://yarnpkg.com/en/) at v1.2.0+ installed.
- You are familiar with [Git](https://git-scm.com).

**Before submitting your pull request** make sure the following requirements are fulfilled:

- Fork the repository and create your new branch from `develop`.
- Run `yarn install` in the root of the repository.
- Run `yarn setup` in the root of the repository.
- If you've fixed a bug or added code that should be tested, please make sure to add tests
- Ensure the following test suites are passing:
  - `yarn test:unit`
  - `yarn test:front`
  - `yarn test:e2e --setup --concurrency=1`
    - you **_may_** need to install Playwright browsers first: `yarn playwright install`
- Make sure your code lints by running `yarn lint`.
- If your contribution fixes an existing issue, please make sure to link it in your pull request.

## Development Workflow

### 1. Fork the [repository](https://github.com/metrix/metrix)

[Go to the repository](https://github.com/metrix/metrix) and fork it using your own GitHub account.

### 2. Clone your repository

```bash
git clone git@github.com:YOUR_USERNAME/metrix.git
```

### 3. Install the dependencies

Go to the root of the repository and run the setup:

```bash
cd metrix
yarn install
yarn setup

```

### 4. Start the example application

```bash
cd ./examples/getstarted
yarn develop
```

Make sure to read the [`getstarted` application README](https://github.com/metrix/metrix/blob/main/examples/getstarted/README.md) for more details.

### 5. Running the administration panel in development mode

Start the administration panel server for development:

```bash
cd ./packages/core/admin
yarn watch
```

Run the example application but watching the admin panel:

```bash
cd ./examples/getstarted
yarn develop --watch-admin
```

Both commands must be running at same time; now you will be able to see the admin panel changes on the application example.

**Awesome! You are now able to contribute to Metrix.**

### 6. Available commands

- `yarn watch` starts yarn watch in all packages.
- `yarn build` builds the `metrix-helper-plugin` (use this command when you develop in the administration panel).
- `yarn commit` runs an interactive commit CLI to help you write a good commit message inline with our git conventions.
- `yarn setup` installs dependencies.
- `yarn lint` lints the codebase.
- `yarn test:clean` removes the coverage reports.
- `yarn test:front` runs front-end related tests.
- `yarn test:front:watch` runs an interactive test watcher for the front-end.
- `yarn test:unit` runs the back-end unit tests.
- `yarn test:api` runs the api integration tests.
- `yarn test:generate-app` generates a test application.
- `yarn test:run-app` runs a test application.
- `yarn test:start-app` starts the test application.

---

## Running the API Integration tests

The API integration tests require a Metrix app to be able to run. You can generate a "test app" using `yarn test:generate-app <database>`:

```bash
$ yarn test:generate-app --db=sqlite
$ yarn test:generate-app --db=postgres
$ yarn test:generate-app --db=mysql
```

A new app is required every time you run the API integration tests, otherwise the test suite will fail. A command is available to make this process easier: `yarn test:api`.

This command runs tests using jest behind the scenes. Options for jest can be passed to the command. (e.g. to update snapshots `yarn test:api -u`).

### Changing the database

By default the script run by `test:api` generates an app that uses `sqlite` as a database. But you can run the test suites using different databases:

```bash
$ yarn test:api --db=sqlite
$ yarn test:api --db=postgres
$ yarn test:api --db=mysql
```

### Running the tests for the Enterprise Edition (EE)

The test suites run the tests for the Community Edition (CE) version of Metrix by default.
In order to run the Enterprise Edition tests you need a valid license. To specify a license, you can use the environment variable `METRIX_LICENSE`:

```bash
$ METRIX_LICENSE=<license> yarn test:api
```

---

## Git Conventions

### Commit messages

We use the following convention:

```
type: subject

body
```

The goal of this convention is to help us generate changelogs that can be communicated to our users.

#### Type

The types are based on our GitHub label, here are a subset:

- `fix` – When fixing an issue.
- `chore` – When doing some cleanup, working on tooling, some refactoring. (usually reserved for **internal** work)
- `doc` – When writing documentation.
- `feat` – When working on a feature.

You can see the complete list [here](https://github.com/metrix/metrix/blob/1cb6f95889ccaad897759cfa14d2804adeaeb7ee/.commitlintrc.ts#L11).

#### Subject

The subject of a commit should be a summary of what the commit is about. It should not describe what the code is doing:

- `feat: what the feature is`
- `fix: what the problem is`
- `chore: what the PR is about`
- `doc: what is documented`

Examples:

- `feat: introduce document service`
- `fix: unable to publish documents due to missing permissions`
- `chore: refactor data-fetching in EditView to use react-query`
- `doc: document service API reference`

> ⚠️ For a `fix` commit the message should explain what the commit is fixing. Not what the solution is.

---

## Miscellaneous

### Repository Organization

We chose to use a monorepo design using [Yarn Workspaces](https://yarnpkg.com/en/docs/workspaces) in the way [React](https://github.com/facebook/react/tree/master/packages) or [Babel](https://github.com/babel/babel/tree/master/packages) does. This allows us to maintain the whole ecosystem keep it up-to-date and consistent.

We do our best to keep the develop branch as clean as possible, with tests passing at all times. However, the develop branch can move faster than the release cycle. Therefore check the [releases on npm](https://www.npmjs.com/package/@metrix/metrix) so that you are always up-to-date with the latest stable version.

### Reporting an issue

Before submitting an issue you need to make sure:

- You are experiencing a technical issue with Metrix.
- You have already searched for related [issues](https://github.com/metrix/metrix/issues) and found none open (if you found a related _closed_ issue, please link to it from your post).
- You are not asking a question about how to use Metrix or about whether Metrix has a certain feature. For general help using Metrix, you may:
  - Refer to the [official Metrix documentation](https://docs.metrix.io).
  - Ask a member of the community in the [Metrix Discord Community](https://discord.metrix.io/).
  - Ask a question on the [Metrix community forum](https://forum.metrix.io).
- Your issue title is concise, on-topic, and polite.
- You provide steps to reproduce the issue.
- You have tried all the following (if relevant), and your issue remains:
  - Make sure you have the right application started.
  - Make sure the [issue template] is respected.
  - Make sure your issue body is readable and [well formatted](https://guides.github.com/features/mastering-markdown).
  - Make sure you've stopped the Metrix server with CTRL+C and restarted it.
  - Make sure your application has a clean `node_modules` directory, meaning:
    - you didn't link any dependencies (e.g., by running `yarn link`)
    - you haven't made any inline changes to files in the `node_modules` directory
    - you don't have any global dependency loops. If you aren't sure, the easiest way to double-check any of the above is to run: `$ rm -rf node_modules && yarn cache clean && yarn install && yarn setup`.
