import debounce from 'lodash/debounce'

export default {
  methods: {
    /**
     * Check overflow of element
     * @param {Object} el
     */
    checkOverflow: debounce(
      function (el) {
        if(el instanceof HTMLElement){
          if (el.scrollHeight > el.offsetHeight) {
            el.classList.add('overflow')
          } else {
            el.classList.remove('overflow')
          }
        }
      },
      100
    ),
    /**
     * Determines if element width has overflowed
     * @param {Object} elem
     * @returns {Boolean}
     */
    checkWidth: function(elem) {
      const temp = document.createElement('div')
      temp.textContent = elem.innerText
      temp.style.display = 'inline'
      temp.style.width = 'auto'
      temp.style.visibility = 'hidden'

      document.body.appendChild(temp);

      const tempWidth = temp.getBoundingClientRect().width
      const elemWidth = elem.getBoundingClientRect().width

      const isVisible = Math.floor(tempWidth) > Math.floor(elemWidth)
      temp.remove()

      return isVisible
    }
  }
}
