[![Netlify Status](https://api.netlify.com/api/v1/badges/07e8b623-a94d-4686-a784-eb4a9b90dde1/deploy-status)](https://app.netlify.com/sites/zimara/deploys)

<p align=center>
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

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

- Node >= 14
- Yarn Berry (2.x)
- Storybook 6
- Webpack 4 (support for 5 will be added [when CRA supports it](https://github.com/facebook/create-react-app/issues/9994))

## Install

Install dependencies:

```bash
yarn install
```

## Development

Run the app in development mode:

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Tests

Run all Jest and React Testing Library unit tests:

`yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information. Tests are colocated and live as closely to corresponding code as possible (typically in the `tests` dir of the component).

## Build

`yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Stories

Run all [Storybook](https://storybook.js.org/) stories.

```
yarn storybook
```


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
