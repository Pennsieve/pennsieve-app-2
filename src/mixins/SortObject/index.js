import { head, last, compose, toPairs, defaultTo } from 'ramda'

/**
 * Create site object
 * @param {Array}
 * @returns {Array}
 */
const createObject = function(list) {
  return list.map(item => {
    return {
      key: head(item),
      value: last(item)
    }
  })
}

/**
 * Sort list
 * @param {Array}
 * @returns {Array}
 */
const sortList = function(list) {
  return list.sort(function(a, b) {
    return b.value - a.value
  })
}

export default {
  methods: {
    /**
     * Sort sites by creating an array of the sites and sorting them by value key
     * @param {Object}
     * @returns {Array}
     */
    sortObject: (list) => compose(
      sortList,
      createObject,
      toPairs,
      defaultTo({})
    )(list)
  }
}
