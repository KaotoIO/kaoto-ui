[![Netlify Status](https://api.netlify.com/api/v1/badges/07e8b623-a94d-4686-a784-eb4a9b90dde1/deploy-status)](https://app.netlify.com/sites/zimara/deploys)

<p align="center">
  <a href="https://github.com/ZimaraIO/zimara-ui/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/ZimaraIO/zimara-ui" alt="license"></a>

  <img src="https://img.shields.io/github/languages/code-size/ZimaraIO/zimara-ui" alt="code size">

  <a href="https://github.com/ZimaraIO/zimara-ui/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/ZimaraIO/zimara-ui" alt="contributors"></a>

  <a href="https://twitter.com/intent/follow?screen_name=ZimaraIO">
    <img src="https://img.shields.io/twitter/follow/ZimaraIO?style=social&logo=twitter"
      alt="follow on Twitter"></a>
</p>

# Zimara UI

User interface for [Zimara Backend](https://github.com/ZimaraIO/zimara-backend).

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
3. Update `REACT_APP_API_URL` in the file with the correct host for the API. If using Zimara API locally, this should be `http://localhost:8080`, but please check.

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

Run all Jest and React Testing Library unit tests:

```bash
yarn test
````

Launches the test runner in the interactive watch mode.\
Tests are colocated and live as closely to corresponding code as possible.

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

