import { defaultTo, head } from 'ramda'

export default {
  methods: {
    /**
     * Replaces matched search text with bolded version
     * @param {String} needle
     * @param {String} stack
     */
    highlight: function(needle, stack) {
      if (!needle) {
        return defaultTo('', stack)
      }
      const regex = new RegExp(needle, 'gi')
      const matched = stack.match(regex)
      if (matched && matched.length >= 1) {
        return stack.replace(regex, `<strong>${head(matched)}</strong>`)
      }
      return this.$sanitize(stack, ['strong'])
    }
  }
}
