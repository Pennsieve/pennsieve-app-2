import { defaultTo } from 'ramda'

export default {
  data: function() {
    return {
      pageNumber: 0,
      pageSize: 5
    }
  },

  computed: {
    /**
     * Compute page count
     * @returns {Number}
     */
    pageCount: function() {
      const listData = defaultTo([], this.listData)
      const l = listData.length
      const s = this.pageSize
      return Math.ceil(l/s);
    },

    /**
     * Compute which models to show based on page size and number
     * @returns {Array}
     */
    paginatedData: function() {
      const listData = defaultTo([], this.listData)
      const start = this.pageNumber * this.pageSize
      const end = start + this.pageSize
      return listData.slice(start, end)
    }
  },

  methods: {
    /**
     * Navigate to next page
     */
    nextPage: function() {
      this.pageNumber++
    },

    /**
     * Navigate to previous page
     */
    prevPage: function() {
      this.pageNumber--
    }
  }
}
