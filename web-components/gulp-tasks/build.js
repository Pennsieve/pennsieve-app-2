'use strict';

// dependencies
const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const gulpIgnore = require('gulp-ignore');
const fs = require('fs-extra');

// settings
const swPrecacheConfig = require('../sw-precache-config.js');
const polymerJson = require('../polymer.json');
const polymerProject = new polymerBuild.PolymerProject(polymerJson);
const buildDirectory = 'build';
const finalConfigFile = './src/config/config.html';
const devConfigFile = './src/config/config-dev.html';
const prodConfigFile = './src/config/config-prod.html';

// helpers
const logger = console.log; // eslint-disable-line no-console

const waitFor = (stream) =>
  new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', (err) => {
      logger('Stream Error!', err);
      reject();
    });
  });

const createDependenciesStream = function createDependenciesStream() {
  const dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();
  // return dependency stream
  return polymerProject.dependencies()
    .pipe(dependenciesStreamSplitter.split())
    // Add any dependency optimizations here.
    .pipe(dependenciesStreamSplitter.rejoin());
};

const sourcesStreamSplitter = new polymerBuild.HtmlSplitter();

const createSourceStream = function createSourceStream() {
  // return sources stream
  return polymerProject.sources()
    .pipe(gulpIgnore.exclude(['**/*.map', '**/*.min.js']))
    .pipe(gulpif(/\.(png|gif|jpg|svg)$/, imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(sourcesStreamSplitter.split())
    .pipe(gulpif(/\.js$/, babel({
      presets: [['env'], ['babili', {'deadcode': false}]],
      plugins: ['transform-remove-strict-mode'],
      ignore: [
        'bower_components/**/*',
        'lib/**/*.js',
        'lib/*.js'
      ]
    })))
    .pipe(gulpif(/\.css$/, cleanCSS()))
    .pipe(gulpif(/\.html$/, htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true
    })))
    .pipe(gulpIgnore.exclude('src/config/config-*.html'))
};

const build = (configFile) => () =>
  new Promise((resolve, reject) => {
    // Delete the build directory
    logger(`Deleting ${buildDirectory} directory...`);

    const isProd = configFile === 'prod';

    del([buildDirectory, finalConfigFile])
      .then(() => {
        // create config
        logger(`Create config...`);

        const filename = isProd ? prodConfigFile : devConfigFile;
        return new Promise((resolve, reject) => {
          fs.copy(filename, finalConfigFile, (err) => {
            return err ? reject(err) : resolve();
          })
        })
      })
      .then(() => {
        logger(`Building streams...`);

        // Rejoin split inline code
        const sourcesStream = createSourceStream(isProd)
          .pipe(sourcesStreamSplitter.rejoin());
        const dependenciesStream = createDependenciesStream();

        // Merge sources & dependencies together into a single build stream
        const buildStream = mergeStream(sourcesStream, dependenciesStream)
          .once('data', () => logger('Analyzing build dependencies...'))
          .pipe(gulp.dest(buildDirectory));

        // Wait for the build stream to complete
        return waitFor(buildStream);
      })
      .then(() => {
        if (configFile === 'prod') {
          logger('Generating the service worker...');

          polymerBuild.addServiceWorker({
            project: polymerProject,
            buildRoot: buildDirectory,
            bundled: false,
            swPrecacheConfig: swPrecacheConfig,
          });
        }
        logger('Build Complete!');
        resolve();
      })
      .catch((err) => logger('Build Error!', err));
  });

// tasks
gulp.task('default', build('dev'));
gulp.task('production', build('prod'));
