# Pennsieve

## Prerequisites

Used to run the development server, build, and to test components.

### Install Yarn

You can install [Yarn](https://yarnpkg.com/en/docs/install) through the Homebrew package manager. This will also install Node.js if it is not already installed.

`brew install yarn`

If you ever use nvm or similar, you should exclude installing Node.js so that nvm’s version of Node.js is used.

`brew install yarn --ignore-dependencies`

### Node

Use node version `8.10.0` to run the app. You can use [nvm](https://github.com/creationix/nvm) to install or change version.

With nvm installed:

`nvm install 8.10.0`

## Setup

### Install dependencies
`yarn`

## Development server

Serve local files with hot reload at localhost:3000

### Development API
`yarn start`

### Local API (local kubernetes)
`yarn start-local`

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

### Run cypress tests
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

You can do this using the command line utility that comes with [protobufjs](https://www.npmjs.com/package/protobufjs).  Make sure you install protobufjs globally `npm i protobufjs -g`

Navigate to the timeseries canvas folder and run the following:
```
pbjs TimeSeriesMessage.proto --t json > TimeSeriesMessage.json
```
Update the `proto` property [data-behavior.html](web-components/src/components/blackfynn/viewers2/timeseries/canvas/data-behavior.html#L11)

## Configure Environment Variables

There are three config files located at `/web-components/src/config/`. Use this for any environment variable, such as the API or WebSocket URL.

* **Development** `config-dev.html`
* **Local Development** `config-local.html`
* **Production** `config-prod.html`

These files will serve as the basis for the app config which is built dynamically through gulp tasks.

This config is a Polymer Behavior, and is loaded by the Polymer app-shell at `/web-components/src/pennsieve-app.html`. If a variable needs to be used by a component other than `pennsieve-app`, pass it down to that shell component.

For example, `pennsieve-upload` needs the API and S3 Bucket properties, and these are passed down like this:
```
<pennsieve-upload id="pennsieveUpload" api="[[apiUrl]]" user="[[user]]" profile="[[profile]]" bucket="[[bucket]]"></pennsieve-upload>
```

## A Note About Content Headers

Since our app is served by cloudfront from an S3 bucket, its not immediately obvious where the content headers are generated. Cloudfront itself only supports a few very basic headers like Content-Type. In order to set newer headers like Content-Security-Policy, you need to use a lambda edge function, which will be invoked after the S3 origin response, and then injected into the list of response headers. For the DEVELOPMENT environment, we do this with a lambda function called "dev-add-headers". The version is configured in the cloudfront behaviors. The change the configured headers:

1. Publish a new version of the lambda function,
2. Configure the lambda behavior to use the new version.
3. Invalidate the cache to regenerate the complete cached responses, with both content and headers
