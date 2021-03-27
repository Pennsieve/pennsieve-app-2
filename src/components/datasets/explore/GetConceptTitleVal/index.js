import { compose, propOr, find, propEq, defaultTo } from 'ramda'

export default {
  methods: {
    /**
     * Get instance name value by key
     * @param {String} key
     * @param {Array} list
     * @returns {String}
     */
    getConceptTitleVal: (key, list) =>  compose(
      propOr('', key),
      find(propEq('conceptTitle', true)),
      defaultTo([])
    )(list),
  }
}
