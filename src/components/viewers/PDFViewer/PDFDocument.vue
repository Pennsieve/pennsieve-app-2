<template>
  <ScrollingDocument
    v-resize="fitWidth"
    class="pdf-document"
    v-bind="{pages, pageCount, currentPage}"
    :enable-page-jump="true"
    @page-jump="onPageJump"
    @pages-fetch="onPagesFetch"
    @pages-reset="fitWidth"
  >
    <PDFPage
      slot-scope="{page, isElementVisible, isPageFocused, isElementFocused}"
      v-bind="{scale, optimalScale, page, isElementVisible, isPageFocused, isElementFocused}"
      @page-rendered="onPageRendered"
      @page-errored="onPageErrored"
      @page-focus="onPageFocused"
    />
  </ScrollingDocument>
</template>

<script>
// PDFDocument renders an entire PDF inline using
// PDF.js and <canvas>. Currently does not support,
// rendering of selected pages (but could be easily
// updated to do so).
import { PIXEL_RATIO, VIEWPORT_RATIO } from '../../../utils/constants.js'

import resize from '../../../directives/resize.js'

import ScrollingDocument from '../../viewers/PDFViewer/ScrollingDocument.vue'
import PDFPage from '../../viewers/PDFViewer/PDFPage.vue'
import EventBus from '../../../utils/event-bus.js'
import { mapState } from 'vuex'

export default {
  name: 'PDFDocument',

  components: {
    ScrollingDocument,
    PDFPage
  },

  directives: {
    resize
  },

  props: {
    pages: {
      required: true
    },
    pageCount: {
      type: Number,
      default: 0
    },
    scale: {
      type: Number,
      default: 1.0
    },
    optimalScale: {
      type: Number
    },
    fit: {
      type: String
    },
    currentPage: {
      type: Number,
      default: 1
    },
    isPreviewEnabled: {
      default: false
    }
  },

  computed: {
    /**
     * Returns the default scale of PDF on inital load
     * page.getViewport is a function call from PDF.js library
     * @returns {Object}
     */
    defaultViewport() {
      if (!this.pages.length) {
        return { width: 0, height: 0 }
      }
      const [page] = this.pages

      return page.getViewport(1.0)
    },

    /**
     * Checks if PDF layout is in portrait mode
     * @returns {Boolean}
     */
    isPortrait() {
      const { width, height } = this.defaultViewport
      return width <= height
    },
    ...mapState('viewer', ['viewerSidePanelOpen']),
  },

  watch: {
    /**
     * A watcher that watches the zoom scale size of PDF and calls the appropriate function
     * @param {number} fit
     */
    fit(fit) {
      const fitTypes = {
        width: this.fitWidth,
        auto: this.fitAuto,
        "actual size": this.actualSize,
        "page fit": this.percentageScale,
        "50%": this.percentageScale,
        "75%": this.percentageScale,
        "100%": this.percentageScale,
        "125%": this.percentageScale,
        "150%": this.percentageScale,
        "200%": this.percentageScale,
        "300%": this.percentageScale,
        "400%": this.percentageScale
      };
      const _fit = fitTypes[fit];
      if (typeof _fit === "function") {
        if (fit.indexOf("%") > 0) {
          // convert the string to a number; remove the %
          const num = parseFloat(fit) / 100
          _fit(num);
        } else if (fit === 'page fit'){
          const num = 1.0
          _fit(num)
        } else {
          _fit()
        }
      }
    },
    pageCount: "fitWidth",
    isPreviewEnabled: "fitWidth",
    viewerSidePanelOpen: "fitWidth",
  },

  methods: {
    /**
     * Returns the ideal scale size of PDF's width using viewport of document's first page, pixel ratio
     * from the browser and a subjective scale factor based on screen size
     * @returns {number}
     */
    pageWidthScale() {
      const { defaultViewport, $el } = this
      if (!defaultViewport.width) {
        return 0;
      }

      return (
        $el.clientWidth * PIXEL_RATIO * VIEWPORT_RATIO / defaultViewport.width
      )
    },
    /**
     * Returns the ideal scale size of PDF's height using viewport of document's first page, pixel ratio
     * from the browser and a subjective scale factor based on screen size
     * @returns {number}
     */
    pageHeightScale() {
      const { defaultViewport, $el } = this
      if (!defaultViewport.height) {
        return 0
      }

      return (
        $el.clientHeight * PIXEL_RATIO * VIEWPORT_RATIO / defaultViewport.height
      )
    },
    /**
     * Utilize calculation from pageWidthScale function to generate a scale size
     * based on width that is fitted to screen
     */
    fitWidth() {
      const scale = this.pageWidthScale();
      this.updateScale(scale, { isOptimal: !this.optimalScale })
    },

    /**
     * Utilize calculation from pageHeightScale or pageWidthScale function to generate
     * a scale size based on height that is fitted to screen
     */
    fitHeight() {
      const scale = this.isPortrait
        ? this.pageHeightScale()
        : this.pageWidthScale()
      this.updateScale(scale)
    },

    /**
     * Calculates the minimum of PDF page width and page height to generate
     * an auto scale size
     */
    fitAuto() {
      const scale = Math.min(this.pageWidthScale(), this.pageHeightScale());
      this.updateScale(scale)
    },

    /**
     * Adds PDF page width and page height to generate an actual
     * PDF scale size
     */
    actualSize() {
      const scale = this.pageWidthScale() + this.pageHeightScale();
      this.updateScale(scale)
    },

    /**
     * Updates PDF scale based on zoom scale size selected from toolbar dropdown
     * @param {number} scaleIncrement
     */
    percentageScale(scaleIncrement) {
      const scale = scaleIncrement
      this.updateScale(scale)
    },

    /**
     * Emits an event that updates the scale of the PDF based on
     * scale value. Assigns fit value to scale if preview sidebar enabled
     * and fit value is not undefined
     * @param {number} scale
     * @param {Boolean} isOptimal
     */
    updateScale(scale, { isOptimal = false } = {}) {
      if (!scale) {
        return
      }
      if (this.fit !== undefined && this.fit.indexOf('%') !== -1){
        const index = this.fit.indexOf('%')
        const updatedFit = this.fit.slice(0, index)
        scale = (updatedFit/100)
      }
      this.$emit("scale-change", { scale, isOptimal })
    },

    /**
     * Triggers scroll event
     * @param {number} scrollTop
     */
    onPageJump(scrollTop) {
      this.$el.scrollTop = scrollTop; // triggers 'scroll' event
    },

    /**
     * Emits an event that fetches the current PDF page that is being viewed
     * @param {number} currentPage
     */
    onPagesFetch(currentPage) {
      this.$emit("pages-fetch", currentPage)
    },

    /**
     * Emits an event that focuses on current PDF page
     * @param {number} pageNumber
     */
    onPageFocused(pageNumber) {
      EventBus.$emit("page-focus", pageNumber)
    },

     /**
      * Emits an event that renders PDF page
      * @param {Object} payload
      */
    onPageRendered(payload) {
      this.$parent.$emit("page-rendered", payload)
    },

    /**
     * Throws an error if something goes wrong with PDF
     * @param {Object} payload
     */
    onPageErrored(payload) {
      EventBus.$emit("page-errored", payload)
    }
  }
};
</script>

<style scoped lang="scss">
.pdf-document {
  position: absolute;
  overflow: auto;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #404040;
  background-image: url("../../../../static/images/pdf-viewer-icons/texture.png");
  box-shadow: inset 1px 0 0 hsla(0, 0%, 100%, 0.05);
}

@media print {
  .pdf-document {
    position: static;
  }
}
</style>
