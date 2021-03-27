/**
 * Checks if reserved characters are in a given string
 * @param {String} name
 * @returns {Boolean}
 */
const containsReservedChars = name => /[\\,/,:,*,?,",<,>,.]/.test(name)

/**
 * Removes reserved characters from a given string
 * @param {String} name
 * @returns {String}
 */
const sanitizeName = name => name.replace(/[\\,/,:,*,?,",<,>,.]/g, '')

export default {
  data() {
    return {
      reservedCharsStr: '\\ / : * ? " < > .'
    }
  },
  methods: {
    containsReservedChars,
    sanitizeName
  }
}
