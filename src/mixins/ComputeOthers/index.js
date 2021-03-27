import { sum, pluck, compose } from 'ramda'

export default {
  methods: {
    /**
     * Sums object's values
     * @param {Object}
     * @returns {Number}
     */
    sumValues: compose(
      sum,
      pluck('value')
    ),

    /**
     * Returns an instance of console
     * @param {Array} items
     * @param {Number} max
     * @returns {Array}
     */
    computeOthers: function(items = [], max = 4) {
      // Get first four values
      const topFour = items.slice(0, max)

      // Get the rest and add all values
      const others = items.slice(max)
      const otherVals = this.sumValues(others)

      // Don't display other if there aren't any
      let otherObj = null
      if (otherVals > 0) {
        otherObj = {
          key: 'Other',
          value: otherVals
        }
      }

      return otherObj ? [...topFour, otherObj] : topFour
    }
  }
}
