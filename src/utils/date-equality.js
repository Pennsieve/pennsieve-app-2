/**
 * Compares two dates and checks for equality
 * @param {String} a
 * @param {String} b
 * @returns {Boolean}
 */
const dateEquality = (a, b) => {
  const dateA = new Date(a)
  const dateB = new Date(b)

  return dateA.getTime() === dateB.getTime()
}

export default dateEquality