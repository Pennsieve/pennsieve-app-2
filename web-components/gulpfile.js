'use strict'

const glob = require('glob');

// load tasks from directory
glob
  .sync('./gulp-tasks/*.js')
  .forEach((filepath) => require(filepath));
