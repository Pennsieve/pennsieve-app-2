'use strict'

// dependencies
const gulpReplace = require('gulp-replace');
const rename = require('gulp-rename');
const argv = require('yargs').argv;
const gulp = require('gulp');
const del = require('del');
const fs = require('fs');

// helpers
const configFile = './src/config/config.html';

const deleteConfigFile = (done) => {
  fs.access(configFile, fs.constants.F_OK, function(err) {
    if (!err) {
      del(configFile);
    }
    done();
  });
};

const renameConfig = (path) =>
  gulp
    .src(path)
    .pipe(gulpReplace('[MINIKUBE_IP]', process.env.MINIKUBE_IP))
    .pipe(rename(configFile))
    .pipe(gulp.dest('./'));

const renameConfigFile = (done) => {
  const configFileName = argv.env ? argv.env : 'local';
  renameConfig(`./src/config/config-${configFileName}.html`);
  done();
};

// task
gulp.task('localconfig', gulp.series([
  deleteConfigFile,
  renameConfigFile
]));
