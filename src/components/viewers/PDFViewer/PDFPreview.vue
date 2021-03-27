<template>
  <ScrollingDocument
    class="pdf-preview"
    v-bind="{pages, pageCount, currentPage}"
    :is-parent-visible="isPreviewEnabled"
    @pages-fetch="onPagesFetch"
  >
    <PDFThumbnail
      slot-scope="{page, isElementVisible, isPageFocused}"
      v-bind="{scale, page, isElementVisible, isPageFocused}"
      @thumbnail-rendered="onThumbnailRendered"
      @thumbnail-errored="onThumbnailErrored"
    />
  </ScrollingDocument>
</template>

<script>
import ScrollingDocument from '../../viewers/PDFViewer/ScrollingDocument.vue'
import PDFThumbnail from '../../viewers/PDFViewer/PDFThumbnail.vue'
import EventBus from '../../../utils/event-bus.js'

export default {
  name: 'PDFPreview',

  components: {
    ScrollingDocument,
    PDFThumbnail,
  },

  props: {
    pages: {
      required: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    scale: {
      type: Number,
      default: 1.0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    isPreviewEnabled: {
      default: false,
    },
  },

  methods: {
    /**
     * Emits an event that fetches PDF pages in the preview navigator
     * @param {number} currentPage
     */
    onPagesFetch(currentPage) {
      EventBus.$emit('pages-fetch', currentPage)
    },
    /**
     * Emits an event that lazily renders PDF thumbnails as you keep scrolling
     * down the preview navigator
     * @param {Object} payload
     */
    onThumbnailRendered(payload) {
      this.$el.dispatchEvent(new Event('scroll'))
      EventBus.$emit('thumbnail-rendered', payload)
    },

    /**
     * Emits an event that throws an error if something
     * goes wrong with the thumbnails in the preview navigator
     */
    onThumbnailErrored(payload) {
      EventBus.$emit('thumbnail-errored', payload)
    },
  },
}
</script>

<style scoped lang="scss">
@import './viewertoolbar.scss';
.pdf-preview {
  position: absolute;
  overflow: auto;
  z-index: 1;
  padding: 2em 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: hsla(0, 0%, 0%, 0.75);
  border-top: 1px solid #333;
  box-shadow: inset -1px 0 0 hsla(0, 0%, 0%, 0.25);
  background-image: url('/static/images/pdf-viewer-icons/texture.png')
}

.scrolling-page {
  margin-bottom: 1em;
}

@media print {
  .pdf-preview {
    display: none;
  }
}
</style>
