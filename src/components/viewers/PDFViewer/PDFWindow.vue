<template>
  <div class="pdf-viewer">
    <div class="toolbar">
      <div id="toolbarContainer">
        <div id="toolbarViewer">
          <div id="toolbarViewerLeft">
            <button
              id="sidebarToggle"
              class="toolbarButton sidebarToggle"
              title="Toggle Sidebar"
              tabindex="11"
              @click.prevent.stop="togglePreview"
            >
              <span data-l10n-id="toggle_sidebar_label">
                Toggle Sidebar
              </span>
            </button>
            <div class="toolbarButtonSpacer" />
            <div class="splitToolbarButton hiddenSmallView">
              <button
                id="previous"
                class="toolbarButton pageUp"
                title="Previous Page"
                :disabled="isPreviousDisabled"
                tabindex="13"
                @click="previousPage"
              >
                <span data-l10n-id="previous_label">
                  Previous
                </span>
              </button>
              <div class="splitToolbarButtonSeparator" />
              <button
                id="next"
                class="toolbarButton pageDown"
                title="Next Page"
                :disabled="isNextDisabled"
                tabindex="14"
                @click="nextPage"
              >
                <span data-l10n-id="next_label">
                  Next
                </span>
              </button>
            </div>
            <PDFPaginator
              v-model="currentPage"
              :page-count="pageCount"
            />
          </div>
          <div id="toolbarViewerRight">
            <button
              id="download"
              class="toolbarButton download hiddenMediumView"
              title="Download"
              tabindex="34"
              @click="downloadFile"
            >
              <span data-l10n-id="download_label">
                Download
              </span>
            </button>
          </div>
          <div id="toolbarViewerMiddle">
            <PDFZoom
              :scale="scale"
              @change="updateScale"
              @fit="updateFit"
            />
          </div>
        </div>
      </div>
    </div>

    <PDFData
      class="pdf-viewer__main"
      :url="computeUrl"
      @page-count="updatePageCount"
      @document-rendered="onDocumentRendered"
      @document-errored="onDocumentErrored"
    >
      <PDFPreview
        v-show="isPreviewEnabled"
        slot="preview"
        slot-scope="{pages}"
        class="pdf-viewer__preview"
        v-bind="{pages, scale, currentPage, pageCount, isPreviewEnabled}"
      />

      <PDFDocument
        slot="document"
        slot-scope="{pages}"
        class="pdf-viewer__document"
        :class="{ 'preview-enabled': isPreviewEnabled }"
        v-bind="{pages, scale, optimalScale, fit, currentPage, pageCount, isPreviewEnabled}"
        :percentage-increment="percentageIncrement"
        @scale-change="updateScale"
      />
    </PDFData>
  </div>
</template>


<script>
import PDFDocument from '../../viewers/PDFViewer/PDFDocument'
import PDFData from '../../viewers/PDFViewer/PDFData.vue'
import PDFPaginator from '../../viewers/PDFViewer/PDFPaginator.vue'
import PDFPreview from '../../viewers/PDFViewer/PDFPreview.vue'
import PDFZoom from '../../viewers/PDFViewer/PDFZoom.vue'
import EventBus from '../../../utils/event-bus'
import { defaultTo } from 'ramda'


/**
 * Calculates the adjusted value for PDF scaling resolution
 * @param {number} value
 * @param {string} precision
 * @returns {number}
 */

const floor = function(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return value * multiplier / multiplier
}

export default {
  name: 'PDFWindow',

  components: {
    PDFDocument,
    PDFData,
    PDFPaginator,
    PDFPreview,
    PDFZoom
  },

  props: {
    url: String,
    pkg: Object,
    percentageIncrement: {
      type: Number,
      default: 0.0
    }
  },

  data() {
    return {
      scale: undefined,
      optimalScale: undefined,
      fit: undefined,
      currentPage: 1,
      pageCount: undefined,
      isPreviewEnabled: false,
      isPreviousDisabled: true,
      isNextDisabled: false
    }
  },

  computed: {

    /**
     * Compute the url source for the PDF that will be rendered
     * @returns {string}
     */
    computeUrl() {
      return defaultTo("", this.url)
    }
  },

  watch: {
    /**
     * Watches the prop url value for any changes, and sets the current page of the PDF
     * to undefined if so
     */
    url() {
      this.currentPage = undefined
    },
    /**
     * Watches the current page data value to disable/enable the previous and next
     * paginator buttons based on the current PDF page displayed
     */
    currentPage() {
      if (this.currentPage >= this.pageCount) {
        this.isNextDisabled = true
        this.isPreviousDisabled = false
      }

      if (this.currentPage === 1) {
        this.isPreviousDisabled = true
        this.isNextDisabled = false
      }
    }
  },

  mounted(){
    EventBus.$on('page-focus', this.updateCurrentPage.bind(this))
  },

  methods: {
    /**
     * Calls the download-file event handler for function to download PDF
     */
    downloadFile() {
      EventBus.$emit("download-file", this.pkg)
    },

    /**
     * Emits an event that throws an error if something is wrong with PDF
     */
    onDocumentRendered() {
      this.$emit("document-errored", this.url)
    },
    /**
     * Emits an event that throws an error if something is wrong with PDF
     */
    onDocumentErrored(e) {
      this.$emit("document-errored", e)
    },

    /**
     * Shows next page count in toolbar paginator indicator
     */
    nextPage() {
      if (
        this.isPreviousDisabled === true &&
        this.currentPage < this.pageCount
      ) {
        this.isPreviousDisabled = false;
        this.currentPage++
      } else {
        this.currentPage++
      }
    },

    /**
     * Shows previous page count in toolbar paginator indicator
     */
    previousPage() {
      if (this.isNextDisabled === true && this.currentPage === this.pageCount) {
        this.isNextDisabled = false;
        this.currentPage--
      } else {
        this.currentPage--
      }
    },

    /**
     * Updates the scale value everytime there is a change in resolution
     * @param {number} scale
     * @param {Boolean} isOptimal
     */
    updateScale({ scale, isOptimal = false }) {
      const roundedScale = floor(scale, 2)
      if (isOptimal) {
        this.optimalScale = roundedScale
      }
      this.scale = roundedScale
    },

    /**
     * Updates the zoom fit size of the PDF on increase or decrease of scale
     * @param {number} fit
     */
    updateFit(fit) {
      this.fit = fit
    },

    /**
     * Updates the total PDF page count
     * @param {number} pageCount
     */
    updatePageCount(pageCount) {
      this.pageCount = pageCount
    },

    /**
     * Updates the current PDF page number the user is on
     * @param {number} pageNumber
     */
    updateCurrentPage(pageNumber) {
      this.currentPage = pageNumber
    },


    /**
     * Toggles the preview sidebar
     */
    togglePreview() {
      this.isPreviewEnabled = !this.isPreviewEnabled
    }
  }
};
</script>

<style scoped lang="scss">
@import "./viewertoolbar.scss";

.pdf-viewer__preview {
  display: block;
  width: 15%;
  right: 85%;
}

.pdf-viewer__document {
  width: 100%;
  left: 0;
}

.pdf-viewer__document.preview-enabled {
  width: 85%;
  left: 15%;
}

@media print {
  header {
    display: none;
  }
}
</style>
