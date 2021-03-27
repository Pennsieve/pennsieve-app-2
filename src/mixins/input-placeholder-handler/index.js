import debounce from 'lodash/debounce'

export default {
  methods: {
    /**
     * Safari bug fix, dynamically set and clear placeholder value for inputs
     * @param {String} inputValue
     * @param {String} placeholder
     */
    updatePlaceholder: debounce(function(inputValue, placeholder) {
      if (inputValue.length === 0) {
        this.placeholder = placeholder
      } else {
        this.placeholder = ''
      }
    }, 100),
  }
}