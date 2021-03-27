import Vue from 'vue'
import * as files from '../../supported-files/files.json'
import { compose, concat, propOr, useWith, find, propEq } from 'ramda'

/**
 * Lookup the svg per icon key
 * @param {String} icon
 * @param {Array} files
 * @returns {String}
 */
const getSvgIcon = compose(
  concat('/static/file-icons/'),
  propOr('icon-generic.svg', 'SVG'),
  useWith(find, [propEq('Icon')])
)

export default {
  methods: {
    /**
     * Get the svg image
     * @param {String} icon
     * @param {String} packageType
     * @returns {String}
     */
    fileIcon: function(icon, packageType) {
      if (packageType === 'Collection') {
        return '/static/file-icons/icon-folder.svg'
      }

      if (packageType === 'ExternalFile') {
        return '/static/file-icons/icon-linked-file.svg'
      }

      const list = Array.isArray(files) ? files : files.default
      return getSvgIcon(icon, list)
    }
  }
}
