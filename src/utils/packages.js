/**
 * Compute a package's display name,
 * including extension if available
 * @param {Object} file
 * @returns {String}
 */
export const packageDisplayName = (fileName, extension = '', children = []) => {
  const name = fileName
  return extension && !name.endsWith(extension) && children.length === 0
    ? `${name}.${extension}`
    : name
}
