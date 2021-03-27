#!/usr/bin/env node

const fs = require('fs')
const tsvert = require('tsvert')
const path = require('path')
const R = require('ramda')

tsvert.setOptions({
  'indent': true
})

const getUniqueIcons = R.compose(
  JSON.stringify,
  R.sortBy(R.prop('Icon')),
  R.filter(R.prop('Icon')),
  R.uniq,
  R.map(R.evolve({
      'Icon': R.trim,
      'SVG': R.trim
    })
  ),
  R.map(R.pickAll(['Icon', 'SVG'])),
  R.tryCatch(JSON.parse, R.always([]))
)

const filepath = path.join(path.dirname(fs.realpathSync(__filename)), './')
const tsv = fs.readFileSync(filepath + 'files.tsv', 'utf-8')

const json = tsvert(tsv, 'json')
const jsonStr = json.substr(0, json.length - 1)
const body = getUniqueIcons(jsonStr)

fs.writeFile(filepath + 'files.json', body, function(err) {
  if (err) {
    throw err
  }
  console.log('Supported files json created')
})