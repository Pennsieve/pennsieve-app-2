import { prop, path, sort, ascend, descend, compose, head, defaultTo } from 'ramda'
import EventBus from '../../utils/event-bus'

/**
 * Returns the path to an object
 * @param {Array} list
 * @param {String} acc
 * @returns {String}
 */
const idx = (list, acc) => list.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, acc)

/**
 * Sets the descending sort based on data type
 * @param {String} key
 * @param {Object} prop
 * @param {String} type
 * @returns {Function}
 */
const sortDescending = (key, prop, type) => type === 'string' ? sortDescendingStr(key) : descend(prop)

/**
 * Sort predicate for descending order
 * @param {String} key
 * @returns {Function}
 */
const sortDescendingStr = function(key) {
  const sortPath = key.indexOf('.') >= 0 ? key.split('.') : [key]
  return function(a, b) {
    const aa = defaultTo('', idx(sortPath, a))
    const bb = defaultTo('', idx(sortPath, b))
    return bb.localeCompare(aa, 'en', { numeric: true})
  }
}

/**
 * Sets the ascending sort based on data type
 * @param {String} key
 * @param {Object} prop
 * @param {String} type
 * @returns {Function}
 */
const sortAscending = (key, prop, type) => type === 'string' ? sortAscendingStr(key) : ascend(prop)

/**
 * Sort predicate for ascending order
 * @param {String} key
 * @returns {Function}
 */
const sortAscendingStr = function(key) {
  const sortPath = key.indexOf('.') >= 0 ? key.split('.') : [key]
  return function(a, b) {
    const aa = defaultTo('', idx(sortPath, a))
    const bb = defaultTo('', idx(sortPath, b))
    return aa.localeCompare(bb, 'en', { numeric: true})
  }
}

export default {
  data() {
    return {
      sortBy: 'name',
      sortDirection: 'desc',
    }
  },

  methods: {
    /**
     * Sets the sort direction
     * @param {String} key
     * @param {String} direction
     */
    setSortDirection: function(key, direction) {
      if (direction) {
        return this.sortDirection = direction
      }
      if (this.sortBy !== key) {
        return this.sortDirection = 'asc'
      }
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc'
    },
    /**
     * Sort a given list
     * @param {String} key
     * @param {Array} list
     * @param {String} direction
     */
    _sorter: function(key, list, direction) {
      this.setSortDirection(key, direction)
      this.sortBy = key
      const property = key.indexOf('.') >= 0 ? path(key.split('.')) : prop(key)
      const dataType = typeof compose(defaultTo(''), property, head)(list)
      const sortFn = this.sortDirection === 'desc' ? sortDescending(key, property, dataType) : sortAscending(key, property, dataType)
      return sort(sortFn, list)
    },
    /**
     * Sort the list and emit sorted payload
     * @param {String} key
     * @param {Array} list
     * @param {String} direction
     */
    setSort: function(key, list, direction) {
      const sortedList = this._sorter(key, list, direction)
      EventBus.$emit('sorted', sortedList)
    },
    /**
     * Sort the list and return the sorted list
     * @param {String} key
     * @param {Array} list
     * @param {String} direction
     */
    returnSort: function(key, list, direction) {
      const sortedList = this._sorter(key, list, direction)
      return sortedList
    },
    /**
     * Compute if the package list is sorted by given column
     * @param {String} name
     */
    isSorting: function(name) {
      return this.sortBy === name
    },
    /**
     * Calculates the sort icon
     * @param {String} nameOfColumn
     * @returns {String}
     */
    sortIcon: function(nameOfColumn) {
      const dir = this.sortDirection === 'desc' ? 'desc' : 'asc'
      if (this.isSorting(nameOfColumn)) {
        return `icon-sort-${dir}`
      }
      return `icon-sort-asc`
    },
    /**
     * Sort table listener
     * @param {String} property
     */
    onTableSort: function(property = '') {
      if (property) {
        this.setSortDirection(property)
        this.sortBy = property

        this.$emit('set-table-sort', {
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
        })
      }
    }
  }
}
