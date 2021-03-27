<template>
  <button
    :class="{ focused: isPageFocused }"
    class="pdf-thumbnail"
    @click="focusPage"
  >
    <img
      v-if="src"
      :src="src"
      class="box-shadow"
    >
    <div
      v-else
      class="placeholder box-shadow"
    >
      <div class="content">
        Loading
      </div>
    </div>
  </button>
</template>

<script>

import EventBus from '../../../utils/event-bus.js'

export default {
  name: 'PDFThumbnail',

  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    scale: {
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
  },

  data() {
    return {
      src: undefined,
    }
  },

  computed: {
    /**
     * Returns the viewport of the PDF page based on the current thumbnail selected
     * @returns {Object}
     */
    viewport() {
      return this.page.getViewport(1.0)
    },

    /**
     * Returns the page number of the current selected thumbnail in the preview navigator
     * @returns {number}
     */
    pageNumber() {
      return this.page.pageNumber
    },
  },

  watch: {
    page: 'destroyPage',
    src: 'updateVisibility',
    scale: 'updateVisibility',

    /**
     * Watches boolean variable isElementVisible for changes
     * If false, the drawPage function may be called
     */
    isElementVisible(isElementVisible) {
      if (isElementVisible && !this.src) {
        this.drawPage()
      }
    },
  },

  beforeDestroy() {
    this.destroyPage(undefined, this.page)
  },

  methods: {
    /**
     * Emits an event that focuses on the PDF page selected
     * from the preview navigator
     */
    focusPage() {
      EventBus.$emit('page-focus', this.pageNumber)
    },

    /**
     * Renders the current selected PDF page
     */
    drawPage() {
      if (this.renderTask) {
        return
      }
      const {viewport} = this
      const canvas = document.createElement('canvas')
      const canvasContext = canvas.getContext('2d')
      const renderContext = { canvasContext, viewport }
      canvas.height = viewport.height
      canvas.width = viewport.width

      this.renderTask = this.page.render(renderContext)
      this.renderTask
        .then(() => {
          this.src = canvas.toDataURL()

          // Zeroing the width and height causes Firefox to release graphics
          // resources immediately, which can greatly reduce memory consumption.
          canvas.width = 0
          canvas.height = 0
        })
        .then(() => {
          this.$emit('thumbnail-rendered', {
            page: this.page,
            text: `Rendered thumbnail ${this.pageNumber}`,
          })
         })
        .catch(response => {
          this.destroyRenderTask()
          this.$emit('thumbnail-errored', {
            response,
            page: this.page,
            text: `Failed to render thumbnail ${this.pageNumber}`,
          })
        })
    },

    /**
     * Destroys old previous PDF page when new one is rendered
     * @param {Object} _newPage
     * @param {Object} page
     */
    destroyPage(_newPage, page) {
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      if (page) {
        page._destroy()
      }

      this.destroyRenderTask()
    },

    /**
     * Destroys PDF render task
     */
    destroyRenderTask() {
      if (!this.renderTask) {
        return
      }

      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      this.renderTask.cancel()
      delete this.renderTask
    },

    /**
     * Emits an event that updates the visibility of the current PDF page
     * based on thumbnail selection
     */
    updateVisibility() {
      EventBus.$emit('update-visibility')
    },
  },
}
</script>

<style scoped lang="scss">
.pdf-thumbnail {
  cursor: pointer;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  width: 90%;
  height: 90%;
  margin-top: 25px;
}

img,
.placeholder {
  border: 7px solid transparent;
  border-radius: 5px;
  width: 65%;
}

.pdf-thumbnail.focused img {
  border-color: hsla(0,0%,100%,.3);
  background-color: hsla(0,0%,100%,.15);
  background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));
  background-clip: padding-box;
  box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset, 0 0 1px hsla(0,0%,100%,.2) inset, 0 0 1px hsla(0,0%,0%,.2);
  color: hsla(0,0%,100%,.9);
}

.placeholder {
  background: white;
  background-clip: content-box;
  position: relative;
}

.placeholder:before {
  content: '';
  display: block;
  padding-top: 75%;
}

.placeholder .content {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

</style>
