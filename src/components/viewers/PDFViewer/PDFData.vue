
<script>
// PDFDocument renders an entire PDF inline using
// PDF.js and <canvas>. Currently does not support,
// rendering of selected pages (but could be easily
// updated to do so).

import range from 'lodash/range'
import EventBus from '../../../utils/event-bus.js'

/**
 * Uses PDF.js library to retrieve PDF document
 * Using import statement in this way allows Webpack
 * to treat pdf.js as an async dependency so we can
 * avoid adding it to one of the main bundles
 * @param {string} url
 */
const getDocument = function(url) {
  return import(
    'pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(url))
}

/**
 * Retrieves all PDF file pages. pdf is an instance of PDFData
 * See docs for PDF.js for more info
 * @param {Object} pdf
 * @param {number} first
 * @param {number} last
 * @returns {Object}
 */
const getPages = function(pdf, first, last) {
  const allPages = range(first, last+1).map(number => pdf.getPage(number))
  return Promise.all(allPages);
}

/**
 * Returns default values for PDF
 * @returns {Object}
 */
const BUFFER_LENGTH = 10;
const getDefaults = function() {
  return {
    pages: [],
    cursor: 0,
  }
}

export default {
  name: 'PDFData',

  props: {
    url: {
      type: String,
      required: true,
    },
  },

  data() {
    return Object.assign(getDefaults(), {
      pdf: undefined,
    })
  },

  computed: {
    /**
     * Returns total PDF page count
     * @returns {number}
     */
    pageCount() {
      return this.pdf ? this.pdf.numPages : 0
    },
  },

  watch: {
    /**
     * Watches changes in PDF url and executes a handler as a result
     */
    url: {
      handler(url) {
        if (!url) {
          return
        }
        getDocument(url)
          .then(pdf => (this.pdf = pdf))
          .catch(response => {
            this.$emit('document-errored', {text: 'Failed to retrieve PDF', response})
          });
      },
      immediate: true,
    },
    /**
     * Watches changes in PDF and updates the page count and fetches PDF pages
     * if changes were found
     */
    pdf(pdf, oldPdf) {
      if (!pdf) {
        return
      }
      if (oldPdf) {
        Object.assign(this, getDefaults())
      }

      this.$emit('page-count', this.pageCount)
      this.fetchPages()
    },
  },

  created() {
    EventBus.$on('pages-fetch', this.fetchPages)
  },

  methods: {
    /**
     * Fetches pages in PDF file
     * @returns {Array}
     */
    fetchPages(currentPage = 0) {
      if (!this.pdf) {
        return
      }
      if (this.pageCount > 0 && this.pages.length === this.pageCount) {
        return
      }

      const startIndex = this.pages.length
      if (this.cursor > startIndex) {
        return
      }

      const startPage = startIndex + 1
      const endPage = Math.min(Math.max(currentPage, startIndex + BUFFER_LENGTH), this.pageCount)
      this.cursor = endPage

      getPages(this.pdf, startPage, endPage)
        .then((pages) => {
          const deleteCount = 0;
          this.pages.splice(startIndex, deleteCount, ...pages)
          return this.pages
        })
        .catch((response) => {
          this.$emit('document-errored', {text: 'Failed to retrieve pages', response})

        })
    }
  },

  render(h) {
    return h('div', [
      this.$scopedSlots.preview({
        pages: this.pages,
      }),
      this.$scopedSlots.document({
        pages: this.pages,
      }),
    ])
  },
}
</script>
