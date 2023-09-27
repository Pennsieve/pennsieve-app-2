# Pennsieve

## Prerequisites

Used to run the development server, build, and to test components.

### Install Yarn

You can install [Yarn](https://yarnpkg.com/en/docs/install) through the Homebrew package manager. This will also install Node.js if it is not already installed.

`brew install yarn`

If you ever use nvm or similar, you should exclude installing Node.js so that nvm’s version of Node.js is used.

`brew install yarn --ignore-dependencies`

### Node

Use node version `14.21.1` to run the app. You can use [nvm](https://github.com/creationix/nvm) to install or change version

With nvm installed: `nvm install 14.21.1`

You can also run `nvm use` which will use the node version defined in the .nvmrc

## Setup

### Install dependencies

`yarn`

## Development server

Serve local files with hot reload at localhost:3000.

### Development API

`yarn start-local`

You will need to copy the oauth property from src/site-config/dev.json to src/site-config/site.json in order to render the application locally.

### Production API

`yarn start-prod`

## Build

### Build for production with minification

`yarn build`

### Build for production and view the bundle analyzer report

`yarn build --report`

## Testing

### Run unit tests

`yarn unit`

### Run cypress tests (Deprecated)

Make sure you have the following environment variables in place:

```
export E2E_EMAIL=""
export E2E_PASSWORD=""
export E2E_ORG_ID=""
export E2E_DATASET=""
```

Open Cypress: `yarn cypress:open`

Run all Cypress tests: `yarn cypress:run`

### Run all tests

`yarn test`

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## TimeSeries Protocol

The timeseries viewer communicates with the api via websocket. The protocol is defined by the protocol buffers document [TimeSeriesMessage.proto](web-components/src/components/blackfynn/viewers2/timeseries/canvas/data-behavior.html#L11)

If this protocol changes, we need to regenerate a JSON structure and update it in [data-behaviour.html](web-components/src/components/blackfynn/viewers2/timeseries/canvas/data-behavior.html)

You can do this using the command line utility that comes with [protobufjs](https://www.npmjs.com/package/protobufjs). Make sure you install protobufjs globally `npm i protobufjs -g`

Navigate to the timeseries canvas folder and run the following:

```
pbjs TimeSeriesMessage.proto --t json > TimeSeriesMessage.json
```

Update the `proto` property [data-behavior.html](web-components/src/components/blackfynn/viewers2/timeseries/canvas/data-behavior.html#L11)

## Configure Environment Variables

There are three config files located at `/src/config/`. Use this for any environment variable, such as the API or WebSocket URL.

- **Development** `dev.json`
- **Local Development** `local.json`
- **Production** `prod.json`

These files will serve as the basis for the app config which is built dynamically through yarn scripts.

This config is then imported into Vuex state, and accessible via `mapState()`.

For example, a component needs the API url and user token, this can be used in a computed value:

```javascript
computed: {
  ...mapState([
    'config',
    'userToken'
  ]),

  datasetsEndpointUrl: function() {
    return `${this.config.apiUrl}/datasets?api_key=${this.config.userToken}`
  }
}
```

## Content Security Policy (CSP)

This app uses a [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) to ensure scripts, connections, images, etc. are only loaded from trusted sources through an allow list.

This CSP needs to be updated for local development via webpack config at `/build/webpack.dev.conf.js`, as well as for deployment via terraform on dev and production.

- [Dev CSP config](https://github.com/Pennsieve/infrastructure/blob/main/aws/pennsieve-non-prod/us-east-1/dev-vpc-use1/dev/app-lambda-edge/variables.tf)
- [Prod CSP config](https://github.com/Pennsieve/infrastructure/blob/main/aws/pennsieve-prod/us-east-1/prod-vpc-use1/prod/app-lambda-edge/variables.tf)

## A Note About Content Headers

Since our app is served by cloudfront from an S3 bucket, its not immediately obvious where the content headers are generated. Cloudfront itself only supports a few very basic headers like Content-Type. In order to set newer headers like Content-Security-Policy, you need to use a lambda edge function, which will be invoked after the S3 origin response, and then injected into the list of response headers. For the DEVELOPMENT environment, we do this with a lambda function called "dev-add-headers". The version is configured in the cloudfront behaviors. The change the configured headers:

1. Publish a new version of the lambda function,
2. Configure the lambda behavior to use the new version.
3. Invalidate the cache to regenerate the complete cached responses, with both content and headers
