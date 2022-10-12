![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/kaotoio/kaoto-ui?include_prereleases)
[![GitHub license](https://img.shields.io/github/license/KaotoIO/kaoto-ui)](https://github.com/KaotoIO/kaoto-ui/blob/main/LICENSE)

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/KaotoIO/kaoto-ui)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/kaotoio/kaoto-ui)
![GitHub contributors](https://img.shields.io/github/contributors/kaotoio/kaoto-ui)

[![🧪 Unit Tests (Jest) 🧪](https://github.com/KaotoIO/kaoto-ui/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/KaotoIO/kaoto-ui/actions/workflows/unit-tests.yml)
[![codecov](https://codecov.io/gh/KaotoIO/kaoto-ui/branch/main/graph/badge.svg?token=QN5H8C1FWI)](https://codecov.io/gh/KaotoIO/kaoto-ui)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=KaotoIO_kaoto-ui&metric=alert_status)](https://sonarcloud.io/dashboard?id=KaotoIO_kaoto-ui)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=KaotoIO_kaoto-ui&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=KaotoIO_kaoto-ui)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=KaotoIO_kaoto-ui&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=KaotoIO_kaoto-ui)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=KaotoIO_kaoto-ui&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=KaotoIO_kaoto-ui)

![Twitter Follow](https://img.shields.io/twitter/follow/kaotoio?style=social)
![YouTube Channel Subscribers](https://img.shields.io/youtube/channel/subscribers/UCcWUAnL5sBYVFen0RMxbZ3A?style=social)

# Kaoto UI

This is the user interface for [Kaoto Backend](https://github.com/KaotoIO/kaoto-backend). Kaoto is an easy-to-use visual integration framework based on [Apache Camel](https://camel.apache.org/).

![Kaoto UI Screencapture](https://user-images.githubusercontent.com/3844502/144047887-ac270f49-4bd8-48cb-9de9-afe87ad4083b.gif)

## Running it with Docker

For trial purposes, there is a docker image that can be run as described on [the quickstarter](https://kaoto.io/quickstart/).

## Installing with the operator in a kubernetes environment

Follow the instructions on https://github.com/KaotoIO/kaoto-operator/

## Contributing 

If you want to run Kaoto-ui in your machine, follow these instructions. Remember that you need a [backend](https://KaotoIO/kaoto-backend/) running.

### Requirements

- Node >= 14
- [Yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable) (1.x)

### Install & Setup

1. Install dependencies:

```bash
yarn install
```

2. Duplicate the `.env.example` file and name it `.env`.
3. Update `KAOTO_API` in the file with the correct host for the API backend. If using Kaoto locally, this should be `http://localhost:8081`, but please check.

### Development

Run the app in development mode:

```bash
yarn start
```

Open [http://localhost:1337](http://localhost:1337) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Tests

### Unit Tests

Run all [Jest](https://testing-library.com/docs/react-testing-library/intro) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) unit tests:

```bash
yarn test
````

Launches the test runner in the interactive watch mode.\
Tests are colocated and live as closely to corresponding code as possible.

### End-to-End (E2E) Tests

E2E tests are located in the `/cypress` directory. Run all [Cypress](https://docs.cypress.io/guides/overview/why-cypress) E2E tests headlessly:

```bash
// in the browser
yarn e2e

// headlessly
yarn e2e:headless

// with a specific browser
// options: chrome, chromium, edge, electron, firefox
// or specify a path: /usr/bin/chromium
yarn e2e --browser firefox
```

See the [Cypress docs](https://docs.cypress.io) for more information. There are also GitHub Actions workflows in `.github/workflows` that run the tests automatically on opening a pull request.

## Build

```bash
yarn build
```

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

