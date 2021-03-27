import { tryCatch, always } from 'ramda'

/**
 * Safely parses JSON string and returns a default value if parsing fails
 * @param {Object} defaultValue
 * @param {String} jsonString
 * @returns {Object}
 */
const safelyParseJson = (defaultValue, jsonString) => tryCatch(JSON.parse, always(defaultValue))(jsonString)

export default safelyParseJson