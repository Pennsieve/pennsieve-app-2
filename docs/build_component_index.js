/**
 * The following script creates a json file that includes the name, path, and documenation page status
 * for every component in our codebase.
 *
 * component_index.json is consumed by our web component browser.
 */

const fs = require('fs');
const path = require('path');

console.log('Running script...');

/**
 * check if analysis.json file exists
 */
const currentFolder = fs.readdirSync(__dirname)
if (!currentFolder.includes('analysis.json')) {
  throw new Error('run "polymer analyze > analysis.json" in root of project before using this script')
}

const json = require('./analysis.json');
const { elements } = json;

/**
 * list of components
 */
const components = [];

/**
 * pull tagname and path properties from each element
 * programatically determine if component has a doc page and update components array
 */
for (let x = 0; x < elements.length; x++) {
  const component = {
    name: elements[x].tagname,
    path: elements[x].path,
    docs: false
  };

  const { dir } = path.parse(component.path);
  const directory = dir

  const files = fs.readdirSync(directory);

  if (files.includes('index.html')) {
    component.docs = true;
  }
  components.push(component);
}

const data = { components };
fs.writeFileSync('./component-browser/static/component_index.json', JSON.stringify(data), 'utf8');

console.log('Success!')