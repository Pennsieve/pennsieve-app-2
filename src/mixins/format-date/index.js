import moment from 'moment';

import { head } from 'ramda'


export default {
  methods: {
    /**
     * Format date for display
     * @param {Date} date
     * @returns {String}
     */
    formatDate: function(date) {
      return moment.utc(date).format('MMMM D, YYYY')
    },

    /**
     * Formats a date range for display
     * @param {Date} date
     * @returns {String}
     */
    formatDateRange: function(startDate, endDate) {
      const start = moment.utc(startDate).format('MMMM D')
      const end = moment.utc(endDate).format('D, YYYY')

      const startDay = moment.utc(startDate).format('MMMM D')
      const endDay = moment.utc(endDate).format('MMMM D')
      if (startDay === endDay) {
        return this.formatDate(startDate)
      }
      return `${start} - ${end}`
    },

    /**
     * Format date with time based on location
     * @param {Date} date
     * @returns {String}
     */
    formatDateOnLocale: function(date) {
      if (date) {
        return moment.utc(date).format('MMMM D, YYYY hh:mm a')
      }
    }
}}
