<p align="center">
  <a href="https://github.com/KaotoIO/kaoto-ui/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/KaotoIO/kaoto-ui" alt="license"/></a>

  <img src="https://img.shields.io/github/languages/code-size/KaotoIO/kaoto-ui" alt="code size"/>

  <a href="https://github.com/KaotoIO/kaoto-ui/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/KaotoIO/kaoto-ui" alt="contributors"/></a>

  <a href="https://twitter.com/intent/follow?screen_name=KaotoIO">
    <img src="https://img.shields.io/twitter/follow/KaotoIO?style=social&logo=twitter"
      alt="follow on Twitter"/></a>
</p>

<p align="center">
  <a href="https://app.netlify.com/sites/kaoto/deploys">
    <img src="https://api.netlify.com/api/v1/badges/07e8b623-a94d-4686-a784-eb4a9b90dde1/deploy-status" alt="Netlify Status"/></a>
  
  <a href="https://dashboard.cypress.io/projects/zfop6s/runs">
    <img src="https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/zfop6s&style=flat&logo=cypress" alt="Cypress Runs"/></a>
</p>

# Kaoto UI

This is the user interface for [Kaoto Backend](https://github.com/KaotoIO/kaoto-backend). Kaoto is an easy-to-use visual integration framework based on [Apache Camel](https://camel.apache.org/).

![Kapture 2021-11-08 at 16 49 05](https://user-images.githubusercontent.com/3844502/144047887-ac270f49-4bd8-48cb-9de9-afe87ad4083b.gif)

## Running it with Docker

For trial purposes, there is a docker image that can be run as described on [the quickstarter](https://kaoto.io/quickstart/).


## Requirements

- Node >= 14
- Yarn Berry (3.x)
- Storybook 6
- Webpack 5

## Install & Setup

1. Install dependencies:

```bash
yarn install
```

2. Duplicate the `.env.example` file and name it `.env`.
3. Update `REACT_APP_API_URL` in the file with the correct host for the API. If using Kaoto API locally, this should be `http://localhost:8080`, but please check.

**IMPORTANT:** We are using Yarn [Zero Installs](https://yarnpkg.com/features/zero-installs), so the dependency tree is checked in via the `.pnp.cjs`. Because we are committing `.yarn/cache` and `.pnp.*`, you do NOT need to run `yarn install` each time you switch between branches. However, if you find you are having issues with dependencies on a branch, consider regenerating them. See [here](https://yarnpkg.com/getting-started/qa) for more info.

## Development

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

### E2E Tests

E2E tests are located in the `/cypress` directory. Run all [Cypress](https://docs.cypress.io/guides/overview/why-cypress) E2E tests:

```bash
yarn cypress
```

There are also GitHub Actions workflows that run the tests automatically in `.github/workflows`.

## Build

```bash
yarn build
```

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Stories

Run all [Storybook](https://storybook.js.org/) stories.

```bash
yarn storybook
```

