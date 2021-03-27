<template>
  <div
    v-bottom.immediate="fetchPages"
    v-scroll.immediate="updateScrollBounds"
    class="scrolling-document"
  >
    <ScrollingPage
      v-for="page in pages"
      :key="page.pageNumber"
      v-bind="{page, clientHeight, scrollTop, focusedPage, enablePageJump}"
      @page-jump="onPageJump"
    >
      <div
        slot-scope="{isElementVisible, isPageFocused, isElementFocused}"
        class="scrolling-page"
      >
        <slot v-bind="{page, isElementVisible, isPageFocused, isElementFocused}" />
      </div>
    </ScrollingPage>
  </div>
</template>

<script>
import bottom from '../../../directives/bottom.js'
import scroll from '../../../directives/scroll.js'

import ScrollingPage from '../../viewers/PDFViewer/ScrollingPage.vue'

export default {
  name: 'ScrollingDocument',
  
  components: {
    ScrollingPage
  },

  directives: {
    bottom,
    scroll
  },

  props: {
    pages: {
      required: true
    },
    enablePageJump: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    isParentVisible: {
      default: true
    }
  },

  data() {
    return {
      focusedPage: undefined,
      scrollTop: 0,
      clientHeight: 0,
      isVisible: true
    };
  },

  computed: {
    /**
     * Returns the number of pages in PDF document
     * @returns {number}
     */
    pagesLength() {
      return this.pages.length
    }
  },

  watch: {
    isParentVisible: "updateScrollBounds",

    /**
     * Watcher for PDF page length in PDF document. Emits an event to update
     * the count if any changes detected
     * @param {number} count
     * @param {number} oldCount
     */
    pagesLength(count, oldCount) {
      if (oldCount === 0) {
        this.$emit("pages-reset")
      }

      /**
       * Set focuedPage after new pages are mounted
       */
      this.$nextTick(() => {
        this.focusedPage = this.currentPage
      });
    },
    /**
     * Watcher for currentPage. If currentPage value is larger than the
     * length of the number of pages, a function to fetch the current page will be
     * emitted. Otherwise, the focused PDF page will be the current page
     * @param {number} currentPage
     */
    currentPage(currentPage) {
      if (currentPage > this.pages.length) {
        this.fetchPages(currentPage)
      } else {
        this.focusedPage = currentPage
      }
    }
  },

  methods: {
    /**
     * Emits an event that fetchs PDF page based on current page viewed
     * @param {number} currentPage
     */
    fetchPages(currentPage) {
      this.$emit("pages-fetch", currentPage)
    },

    /**
     * Triggers scroll event
     * @param {number} scrollTop
     */
    onPageJump(scrollTop) {
      this.$emit("page-jump", scrollTop)
    },

    /**
     * Updates scrollbounds based on PDF scale size
     * @param {Object} e
     */
    updateScrollBounds(e) {
      const { scrollTop, clientHeight } = this.$el
      this.scrollTop = scrollTop
      this.clientHeight = clientHeight
    }
  }
};
</script>

<style scoped lang="scss">
@import "./viewertoolbar.scss";

.scrolling-page {
  margin-bottom: 1em;
  margin-top: 3em;

}
</style>
