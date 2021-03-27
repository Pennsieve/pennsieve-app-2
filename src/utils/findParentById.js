const getParent = (el) => el && el.parentElement

const isMatch = (el, selector = '') => el && el.id === selector

/**
 * Finds parent element up to 10 ancestors based on id
 * @param {Object} el
 * @param {String} id
 * @param {Number} maxTimes
 */
export const findParentById = (el, selector, maxTimes = 10) => {
  let counter = 0
  const recurseDom = (el, selector) => {
    const par = getParent(el)
    if (!par) {
      return false
    }
    if (isMatch(par, selector)) {
      return true
    }
    counter += 1
    return counter <= maxTimes ? recurseDom(par, selector) : false
  }
  return recurseDom(el, selector)
}