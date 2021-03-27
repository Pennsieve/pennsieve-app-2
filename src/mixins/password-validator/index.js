export default {
  methods: {
    /**
     * Validate password input value
     * @param {String} value
     * @returns {Object}
     */
    /* eslint-disable */
    validatePassword: function(value) {
      const entropy = passwordEntropy(value)
      const threshold = 59

      // Check length
      if (value.length < 8) {
        return {
          feedback: 'Please add at least 8 characters.',
          isValid: false
        }
      }

      // Return if user hits threshold
      if (entropy > threshold) {
        return {
          feedback: 'Strong password!',
          isValid: true
        }
      }

      // Check for lower case characters
      if (!hasLower(value)) {
        return {
          feedback: 'Please add lower case characters.',
          isValid: false
        }
      }

      // Check for upper case characters
      if (!hasUpper(value)) {
        return {
          feedback: 'Please add upper case characters.',
          isValid: false
        }
      }

      // Check for numbers
      if (!hasNumbers(value)) {
        return {
          feedback: 'Please add numbers.',
          isValid: false
        }
      }

      // Check for special characters
      if (!hasSpecial(value)) {
        return {
          feedback: 'Please add special characters.',
          isValid: false
        }
      }

      // If still below threshold, recommended a longer password
      if (entropy < threshold) {
        return {
          feedback: 'Please add more characters',
          isValid: false
        }
      }
    }
  }
}

/** Entropy Logic */

function hasUpper(str) {
  return /[A-Z]/.test(str)
}

function hasLower(str) {
  return /[a-z]/.test(str)
}

function hasSpecial(str) {
  return /\W/.test(str) || str.includes('_')
}

function hasNumbers(str) {
  return /[0-9]/.test(str)
}

const crit = [
  {
    fn: hasUpper,
    weight: 26,
  },
  {
    fn: hasLower,
    weight: 26
  },
  {
    fn: hasSpecial,
    weight: 24
  },
  {
    fn: hasNumbers,
    weight: 10
  }
]

function findKeySpace(str) {
  return crit.reduce((accu, c) => {
    if(c.fn(str)) {
      return accu + c.weight
    }
    return accu
  }, 0)
}

const lnOf2 = Math.log(2)

function log2(x) {
  return Math.log(x) / lnOf2
}

function passwordEntropy(password) {
  const L = password.length
  const R = findKeySpace(password)
  return log2(Math.pow(R, L))
}