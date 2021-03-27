import FormatDate from '../../mixins/format-date'
import FormatDisplay from '../../components/datasets/explore/ConceptInstance/format-display-value'
import StorageMetrics from '../../mixins/bf-storage-metrics'
import GetFileProperty from '../../mixins/get-file-property'
import { compose, keys, head, defaultTo, filter, propOr, pathOr, sort, has, contains, length } from 'ramda'

/**
 * Determines if results list contains file DTO
 * @param {Array} results
 * @returns {Boolean}
 */
const isFilesList = compose(
  Boolean,
  pathOr('', ['content', 'packageType']),
  head,
  defaultTo([])
)

/**
 * Filter out exclusions from list
 * @param {Array} list
 * @param {Array} exclusions
 * @returns {Array}
 */
const filterHeadings = (list, exclusions) => compose(
  filter(val => defaultTo([], exclusions).indexOf(val) < 0),
  keys,
  head
)(list)

export default {
  mixins: [
    FormatDate,
    FormatDisplay,
    StorageMetrics,
    GetFileProperty,
  ],

  methods: {
    /**
    * Creates sort icon
    * @param {String} property
    * @returns {String}
    */
    createSortIcon: function(property) {
      let sortIconDir = 'up'
      if (property === this.sortBy) {
        sortIconDir = this.sortDirection === 'asc' ? 'up' : 'down'
      }
      return sortIconDir
    },

    /**
     * Transforms list of file DTO's to key/values for table component
     * @param {Array} results
     * @returns {Array}
     */
    transformFilesResponse: function(results) {
      const formatted = results.map(result => {
        const rawDate = pathOr('', ['content', 'createdAt'], result)
        return {
          'id': pathOr('', ['content', 'id'], result),
          'Name': pathOr('', ['content', 'name'], result),
          'Kind': propOr('', 'subtype', result),
          'Date Created': this.formatDate(rawDate),
        }
      })
      return formatted
    },

    /**
     * Formats and flattens search results before rendering
     * @param {Array} results
     * @returns {Array}
     */
    formatSearchResults: function(results) {
      // check if results are files
      if (isFilesList(results)) {
        return this.transformFilesResponse(results)
      }

      const formatted = results.map(result => {
        const obj = {
          recordId: result.id
        }
        const vals = propOr([], 'values', result)
        // filter out concept title and default properties
        vals.forEach(res => {
            obj[res.displayName] = {
              dataType: res.dataType,
              value: this.formatUniqueDisplayValues(res)
            }
        })
        obj['Date Created'] = {
          dataType: 'Date',
          value: this.formatDate(result.createdAt)
        }
        return obj
      })
      return formatted
    },

    /**
     * Displays column value
     * @param {Object} property
     * @returns {String}
     */
    displayValue: function(property) {
      const dataType = propOr('String', 'dataType', property)
      const propertyValue = propOr('', 'value', property)
      const val = dataType === 'String' ?
        this.$sanitize(propertyValue) :
        propertyValue
      return Array.isArray(val) ? val.join(', ') : val
    },

    /**
     * Retrieves headings for columns; optionally can exclude specific headings
     * @param {Array} list
     * @param {Array} exclusions
     * @param {Boolean} isRelationship
     * @returns {Array}
     */
    getHeadings: (list, exclusions, isRelationship = false) => {
      // check if list of files
      if (isFilesList(list)) {
        return [
          'Name',
          'Kind',
          'Date Created'
        ]
      }

      const firstRow = defaultTo({}, head(list))
      const values = propOr([], 'values', firstRow)
      const sortedList = sort((a, b) => b.conceptTitle - a.conceptTitle, values)
      const keys = sortedList
        .map(propOr('Heading', 'displayName'))
        .filter(val => defaultTo([], exclusions).indexOf(val) < 0)

      const CREATED_AT = 'Date Created'
      return keys.length > 0 && keys.indexOf(CREATED_AT) && !exclusions.includes('createdAt') < 0 ? keys.concat([CREATED_AT]) : keys
    },

    /**
     * Renders custom Blackfynn header
     * @param {Object}
     * @param {Object}
     * @returns {Object}
     */
    renderHeader: function(h, { column, $index, store}) {
      const columnLabel = propOr('', 'label', column)

      let label = columnLabel
      label = label === 'relationship' ? 'Relationship' : label
      let property = ''
      if (label === 'Review Status') {
        property = propOr('', 'label', column)
      } else {
        property = propOr('', 'property', column)
      }
      const sortIconDir = this.createSortIcon(property)

      const filterSelections = length((propOr([], property, this.filterOptionSelections)))

      const sortIconOptions = {
        props: {
          name: 'icon-sort-asc',
          color: 'currentColor',
          dir: sortIconDir
        },
        class: 'sort-icon'
      }

      // just for the participants table
      const sortChevronIconOptions = {
        props: {
          name: 'icon-arrow-down',
          color: 'currentColor',
          dir: sortIconDir
        },
        class: 'sort-icon'
      }

      const filterIconOptions = {
        props: {
          name: 'icon-filter-filled',
          color: 'currentColor'
        },
        class: 'icon-filter-filled table-header-icon'
      }

      let iconOptions = {}

      if (label === 'Review Status') {
        iconOptions = filterSelections ? filterIconOptions : sortChevronIconOptions
      } else {
        iconOptions = filterSelections ? filterIconOptions : sortIconOptions
      }
      const nonSortableColumns = defaultTo([], this.nonSortableColumns)
      const nonSortable = contains(property, nonSortableColumns)
      let children = label

      if (nonSortable === false) {
        children = [
          h('el-tooltip',
            {
              props: {
                content: columnLabel,
                placement: 'top'
              },
            },
            [
              h('button',
                {
                  class: property === this.sortBy ? 'sort-active' : '',
                  on: {
                    click: () => {
                      // Emit table sort event from table
                      store.table.$emit('bf-sort', property)
                    }
                  }
                },
                [
                label,
                  h('svg-icon', iconOptions)
                ]
              )
            ]
          )
        ]
      }

      return h('span', {
        class: 'th-non-sortable'
      }, children)
    },
  }
}
