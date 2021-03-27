// HELPERS

/**
 * Builds dataset information
 * @param {Array} directory
 * @param {Object} item
 */
const _buildDataset = (directory, item) => {
  if (item.children || item.text) {
    // item has already been processed
    directory.push(item)
  } else {
    // no more path and has no children, its a leaf
    directory.push({
      // text is the item title shown in the tree
      text: item.name,
      selected: false,
      opened: false,
      // value is shown under the metadata header
      value: item.metadata,
      // type is displayed under the data header, if a real value exists just display that instead of type
      type: item.value ? item.value : item.type
    })
  }
}

/**
 * Builds group information
 * @param {String} itemPathPrefix
 * @param {Array} directory
 * @param {Object} item
 */
const _buildGroup = (itemPathPrefix, directory, item) => {
  const existingDirectory = directory.find(diritem => diritem.text === itemPathPrefix)
  if (existingDirectory) {
    existingDirectory.children = existingDirectory.children ? existingDirectory.children : []
    existingDirectory.children.push(item)
    existingDirectory.children = transformDirectoryData(existingDirectory.children)
  } else {
    directory.push({
      text: itemPathPrefix,
      children: transformDirectoryData([item]),
      // a bug with the tree library, specifically when using a custom element via a scoped slot, makes it necessary
      // that we re-add flags we want to be reactive (these are normally tracked automatically). see the docs for other flags
      // https://github.com/zdy1988/vue-jstree#data-item-optional-properties
      opened: false,
      selected: false
    })
  }
}

/**
 * Reducer for transformDirectoryData
 * @param {Array} directory
 * @param {Object} item
 * @returns {Array}
 */
const _dataReducer = (directory, item) => {
  const itemPathPrefix = item.path && item.path.length > 1 && item.path.shift()
  if (itemPathPrefix) {
    _buildGroup(itemPathPrefix, directory, item)
  } else {
    _buildDataset(directory, item)
  }
  return directory
}

// EXPORTS

/**
 * transforms a flat array of items with "path" arrays into a array of objects nested according to their "path" properties
 * @param {Array} directoryData
 */
export const transformDirectoryData = directoryData => directoryData.reduce(_dataReducer, [])
