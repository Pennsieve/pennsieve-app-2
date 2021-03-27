import moment from 'moment'
import { propOr } from 'ramda'
import { mapState } from 'vuex'

export default {
  watcher: {
    profile: {
      handler: function() {
        this.userIsLessThan30DaysOld()
      },
      immediate: true
    }
  },

  computed: {
    ...mapState([
      'profile',
    ]),

    /**
     * Compute if user is less than 30 days old
     * @returns {Boolean}
     */
    userIsLessThan30DaysOld: function() {
      const now = moment().utc()
      const createdAt = propOr('', 'createdAt', this.profile)
      const thirtyDaysAfterCreation = moment(createdAt).add(30, 'days')
      return moment(thirtyDaysAfterCreation).isAfter(now)
    }
  },
}