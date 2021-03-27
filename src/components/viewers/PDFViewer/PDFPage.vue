<script>
import {PIXEL_RATIO} from '../../../utils/constants.js';
import EventBus from '../../../utils/event-bus.js'
export default {
  name: 'PDFPage',
  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
    optimalScale: {
      type: Number,
      required: true,
    },
    isPageFocused: {
      type: Boolean,
      default: false,
    },
    isElementVisible: {
      type: Boolean,
      default: false,
    },
    isElementFocused: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /**
     * Returns the actual size of the PDF viewport
     * @returns {Object}
     */
    actualSizeViewport() {
      return this.viewport.clone({scale: this.scale});
    },
    /**
     * Returns the width and height of the canvas the PDF is rendered in
     * @returns {string}
     */
    canvasStyle() {
      const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
        .map(dim => Math.ceil(dim / PIXEL_RATIO));
      return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
    },
    /**
     * Returns an object that contains attribute properties of canvas
     * including width, height, style, and class
     * @returns {Object}
     */
    canvasAttrs() {
      let {width, height} = this.viewport;
      [width, height] = [width, height].map(dim => Math.ceil(dim));
      const style = this.canvasStyle;
      return {
        width,
        height,
        style,
        class: 'pdf-page box-shadow',
      };
    },
    /**
     * Returns PDF page number
     * @returns {number}
     */
    pageNumber() {
      return this.page.pageNumber;
    },
  },
  watch: {
    scale: 'updateVisibility',
    /**
     * Watches PDF page instance for any changes.
     * Destroys current page if so
     */
    page(_newPage, oldPage) {
      this.destroyPage(oldPage);
    },
    /**
     * Watches boolean variable isElementFocused to check if current PDF element is focused
     * If so, call focusPage function
     */
    isElementFocused(isElementFocused) {
      if (isElementFocused) {
        this.focusPage();
      }
    },
    /**
     * Watches boolean variable isElementVisible to see if current PDF page is visible
     * If so, call drawPage function
     */
    isElementVisible(isElementVisible) {
      if (isElementVisible) {
        this.drawPage();
      }
    },
  },
  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.optimalScale);
  },

  beforeDestroy() {
    this.destroyPage(this.page);
  },
  methods: {
    /**
     * Emits an event that does a PDF page focus
     */
    focusPage() {
      if (this.isPageFocused) {
        return;
      }
      this.$emit('page-focus', this.pageNumber);
    },
    /**
     * Function that renders PDF page
     */
    drawPage() {
      if (this.renderTask) {
        return;
      }
      const {viewport} = this;
      const canvasContext = this.$el.getContext('2d');
      const renderContext = {canvasContext, viewport};
      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.renderTask = this.page.render(renderContext);
      this.renderTask
        .then(() => {
          this.$emit('page-rendered', {
            page: this.page,
            text: `Rendered page ${this.pageNumber}`,
          });
         })
        .catch(response => {
          this.destroyRenderTask();
          this.$emit('page-errored', {
            response,
            page: this.page,
            text: `Failed to render page ${this.pageNumber}`,
          });
        });
    },
    /**
     * Emits an event that updates PDF page visibility
     */
    updateVisibility() {
      EventBus.$emit('update-visibility');
    },
    /**
     * Destroys PDF page
     * @param {Object} page
     */
    destroyPage(page) {
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      if (page) {
        page._destroy();
      }
      this.destroyRenderTask();
    },
    /**
     * Destroys PDF render process
     */
    destroyRenderTask() {
      if (!this.renderTask) {
        return;
      }
      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      this.renderTask.cancel();
      delete this.renderTask;
    },
  },
  render(h) {
    const {canvasAttrs: attrs} = this;
    return h('canvas', {attrs});
  },
};
</script>

<style lang="scss">
.pdf-page {
  display: block;
  margin: 0 auto;
}
</style>
