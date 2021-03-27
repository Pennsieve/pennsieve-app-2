<script>
import EventBus from '../../../utils/event-bus.js'

export default {
  name: 'ScrollingPage',

  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    focusedPage: {
      type: Number,
      default: undefined,
    },
    scrollTop: {
      type: Number,
      default: 0,
    },
    clientHeight: {
      type: Number,
      default: 0
    },
    enablePageJump: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      elementTop: 0,
      elementHeight: 0,
    }
  },

  /**
   * Returns a boolean value that indicates if current PDF page is focused
   * @returns {Boolean}
   */
  computed: {
    isPageFocused() {
      return this.page.pageNumber === this.focusedPage
    },

    /**
     * Returns a boolean value that indicates if current PDF element is focused
     * based on page size calculations
     * @returns {Boolean}
     */
    isElementFocused() {
      // elementTop needs to be looked at
      const {elementTop, bottom, elementHeight, scrollTop, clientHeight} = this
      if (!elementHeight) {
        return
      }

      const halfHeight = (elementHeight / 2)
      const halfScreen = (clientHeight / 2)
      const delta = elementHeight >= halfScreen ? halfScreen : halfHeight
      const threshold = scrollTop + delta

      return elementTop < threshold && bottom >= threshold
    },

    /**
     * Returns a boolean value that indicates if current PDF page is visible
     * based on page size calculations
     * @returns {Boolean}
     */
    isElementVisible() {
      const {elementTop, bottom, elementHeight, scrollTop, scrollBottom} = this
      if (!elementHeight) {
        return
      }

      // scrollbottom issue on second page
      return elementTop < scrollBottom && bottom > scrollTop
    },

    /**
     * Calculates the bottom size value of the current PDF page
     * @returns {number}
     */
    bottom() {
      return this.elementTop + this.elementHeight
    },

    /**
     * Calculates the scroll bottom size value of the current PDF page
     * @returns {number}
     */
    scrollBottom() {
      return this.scrollTop + this.clientHeight
    },
  },

  watch: {
    scrollTop: 'updateElementBounds',
    clientHeight: 'updateElementBounds',
    isPageFocused: 'jumpToPage',
  },

  created() {
    EventBus.$on('update-visibility', this.updateElementBounds)
  },

  mounted() {
    this.updateElementBounds()
  },

  methods: {
    /**
     * Emits event that executes page jump based on PDF page rendered
     */
    jumpToPage() {
      if (!this.enablePageJump || this.isElementFocused || !this.isPageFocused) {
        return
      }

      this.$emit('page-jump', this.elementTop)
    },

    /**
     * Updates PDF page element bounds based on size calculations
     */
    updateElementBounds() {
      const {offsetTop, offsetHeight} = this.$el
      this.elementTop = offsetTop
      this.elementHeight = offsetHeight
    },
  },

  render() {
    const {isElementVisible, isPageFocused, isElementFocused} = this
    return this.$scopedSlots.default({
      isElementVisible,
      isPageFocused,
      isElementFocused,
    })
  },
}
</script>
