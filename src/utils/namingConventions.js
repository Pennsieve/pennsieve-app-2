/**
 * matches all "letter" characters from unicode plus digits and
 * some special characters that are allowed by S3 for keys
 * // % is technically not an authorized character by itself but
 * the second regex takes care of that special case
 * @param {String} name
 * @returns {Boolean}
 */
export const allCharactersValid = name => /^[\u00C0-\u1FFF\u2C00-\uD7FF\w() %*_\-'.]{1,255}$/mg.test(name)

/**
 * Matches several white spaces in a row
 * @param {String} name
 * @returns {Boolean}
 */
export const multipleContiguousSpaces = name => /\s{2,}/mg.test(name)

/**
 * negative lookahead: this regex will match any % that is not
 * followed by an hexadecimal code for an html entity (between 20 and FF)
 * @param {String} name
 * @returns {Boolean}
 */
export const ForbiddenPercentSign = name => /%(?![2-9A-F][0-9A-F])/mg.test(name)


/**
 * Test if the name is valid by running three validations
 * @param {String} name
 */
export const isValidPackageName = (name) => {
  return allCharactersValid(name)
    && !multipleContiguousSpaces(name)
    && !ForbiddenPercentSign(name)
}
