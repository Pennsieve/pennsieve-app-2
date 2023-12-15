'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    headers: { "Content-Security-Policy": "script-src 'unsafe-inline' 'unsafe-eval' 'self' data: https://www.gstatic.com https://www.google.com/recaptcha/api.js https://app.pennsieve.net https://maps.googleapis.com https://cdn.polyfill.io https://polyfill.io https://www.googletagmanager.com https://www.google-analytics.com https://cdn.heapanalytics.com https://app.intercom.io https://widget.intercom.io https://js.intercomcdn.com https://js-agent.newrelic.com https://bam.nr-data.net https://pennsieve.atlassian.net https://api.tiles.mapbox.com; style-src 'unsafe-inline' 'self' https://fonts.googleapis.com https://api.tiles.mapbox.com; worker-src 'self' blob:; child-src 'self' blob: https://share.intercom.io https://intercom-sheets.com https://www.youtube.com https://player.vimeo.com https://fast.wistia.net; img-src 'self' data: blob: https://assets.discover.pennsieve.net https://pennsieve-dev-dataset-assets-use1.s3.amazonaws.com https://pennsieve-dev-dataset-assets-use1.s3.us-east-1.amazonaws.com https://stats.g.doubleclick.net https://maps.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://heapanalytics.com http://gravatar.com https://js.intercomcdn.com https://static.intercomassets.com https://downloads.intercomcdn.com https://uploads.intercomusercontent.com https://gifs.intercomcdn.com https://api.pennsieve.net https://api2.pennsieve.net https://pennsieve-dev-storage-use1.s3.amazonaws.com; font-src 'self' data: blob: https://fonts.gstatic.com https://js.intercomcdn.com; media-src https://js.intercomcdn.com https://pennsieve-dev-storage-use1.s3.amazonaws.com https://api.pennsieve.net https://api2.pennsieve.net; frame-src https://www.google.com https://www.pennsieve.com https://api.pennsieve.net https://api2.pennsieve.net https://pennsieve-dev-storage-use1.s3.amazonaws.com https://pennsieve.atlassian.net; connect-src 'self' data: https://pennsieve-dev-dataset-assets-use1.s3.us-east-1.amazonaws.com https://cognito-idp.us-east-1.amazonaws.com/ https://heapanalytics.com https://run.mocky.io http://www.mocky.io https://pub.sandbox.orcid.org https://pub.orcid.org https://api.maptiler.com https://www.pennsieve.com https://www.googletagmanager.com https://www.google-analytics.com https://pennsieve-dev-uploads-use1.s3.amazonaws.com https://bam.nr-data.net https://api.intercom.io https://api-iam.intercom.io https://api-ping.intercom.io https://nexus-websocket-a.intercom.io https://nexus-websocket-b.intercom.io https://nexus-long-poller-a.intercom.io https://nexus-long-poller-b.intercom.io wss://nexus-websocket-a.intercom.io wss://nexus-websocket-b.intercom.io https://uploads.intercomcdn.com https://uploads.intercomusercontent.com https://app.getsentry.com https://maps.tilehosting.com ws://localhost:3000 wss://api.pennsieve.net https://timeseries.pennsieve.net https://s3.amazonaws.com wss://timeseries.pennsieve.net https://api.pennsieve.net https://api2.pennsieve.net https://concepts.pennsieve.net https://pennsieve-prod-storage-use1.s3.amazonaws.com https://api.prodpad.com https://dev.pennsieve.io https://forms.clickup.com/8664796/f/88dpw-2951/I6M7Z1V8NEBQFTIKSU;" },
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
