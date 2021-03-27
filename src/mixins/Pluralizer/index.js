export default {
  methods: {
    /**
     * Returns an instance of console
     * @param {Number} count
     * @param {String} singular
     * @param {String} plural
     * @returns {String}
     */
    pluralizer: function(count = 0, singular = '', plural = '') {
      return count > 1 || count === 0 ?
        `${count} ${plural}` :
        `${count} ${singular}`
    }
  }
}
