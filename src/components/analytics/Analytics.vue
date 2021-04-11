<template />

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import * as site from '@/site-config/site.json'
import EventBus from '../../utils/event-bus'
import { path, pathOr, compose, last, split, prop, propOr, has, defaultTo, find, pathEq } from 'ramda'

export default Vue.component('bf-analytics', {
  /**
   * Life cycle method
   */
  mounted: function() {
    // Custom event handlers
    // @TODO enable when adding Heap and Google Analytics
    EventBus.$on('track-page', this.trackPage.bind(this))
    // EventBus.$on('track-user', this.trackUser.bind(this))
    EventBus.$on('track-event', this.trackEvent.bind(this))
    // Google analytics
    ga('create', site.googleAnalytics, 'auto')
    // Intercom
    this.$store.watch(this.getActiveOrganization, this.bootIntercom.bind(this))
  },

  beforeDestroy() {
    // @TODO enable when adding Heap and Google Analytics
    EventBus.$off('track-page', this.trackPage.bind(this))
    // EventBus.$off('track-user', this.trackUser.bind(this))
    EventBus.$off('track-event', this.trackEvent.bind(this))
  },

  computed: {
    ...mapGetters([
      'getActiveOrganization',
      'activeOrganization',
      'organizations',
      'profile'
    ]),

    /**
     * Active organization name
     * @returns {String}
     */
    activeOrgName: function() {
      return pathOr('', ['organization', 'name'], this.activeOrganization)
    },

    /**
     * Active organization id
     * @returns {String}
     */
    activeOrgId: function() {
      return pathOr('', ['organization', 'id'], this.activeOrganization)
    }
  },

  methods: {
    /**
     * Registers the user with Intercom when an active organization is set or changes.
     */
    bootIntercom: function() {
      const isProduction = location.href.indexOf('app.pennsieve.') >= 0
      const intercomAppId = isProduction ? 'tmzdtqj9' : 'tmzdtqj9'

      const userId = propOr('', 'id', this.profile)
      const userEmail = propOr('', 'email', this.profile)

      Intercom('boot', {
        app_id: intercomAppId,
        user_id: userId,
        email: userEmail,
        company: {
          'id': this.activeOrgId,
          'name': this.activeOrgName,
          'subscriptionState': pathOr('', ['organization', 'subscriptionState', 'type'], this.activeOrganization),
          'features': pathOr([], ['organization', 'features'], this.activeOrganization).join(', ')
        }
      });
    },

    /**
     * Generic event handler for Intercom
     * @param {Object} evt
     */
    trackEvent: function(evt) {
      const eventName = propOr('', 'name', evt)
      const meta = propOr({}, 'meta', evt)
      if (eventName) {
        Intercom('trackEvent', eventName, meta)
      }
    },

    /**
     * Handles `track-page` custom event. Sets page data for Google Analytics and calls a `pageview` tag.
     * @param {Object} evt
     */
    trackPage: function(evt) {
      /**
       * Use set param, this way if we then send a subsequent event on the page it will be correctly
       * associated with the same page
       */
      const page = path(['detail', 'path'], evt)
      const title = pathOr('', ['detail', 'title'], evt)
      if (page) {
        ga('set', {page, title})
      }
      ga('send', 'pageview')
    },

    /**
     * Handles `track-user` custom event. Calls Heap Analytics `addUserProperties` API for detailed user tracking.
     * @param {Object} evt
     */
    trackUser: function(evt) {
      const user = this.getUserData(evt)
      const hasProps = has('Email', user)
      if (hasProps) {
        heap.identify(user['Email'])
        heap.addUserProperties(user)
      }
    },

    /**
     * Returns the last part of the Pennsieve user id for Heap Analytics tracking.
     * This function is point-free so you just need to pass it an id such as:
     * `N:user:4edcd1d9-1b25-4860-abdf-79140d069450`
     * @param {String}
     * @return String
     */
    getBlackfynnId: compose(
      last,
      split(':'),
      defaultTo('')
    ),

    /**
     * Returns Heap data structure for analytics
     * @param {String} preferredOrgId
     * @param {Array} organizationsList
     * @return {Object}
     */
    getOrgName: (preferredOrgId, organizationsList) => compose(
      pathOr('', ['organization', 'name']),
      find(pathEq(['organization', 'id'], preferredOrgId))
    )(organizationsList),

    /**
     * Returns the user data object for Heap Analytics tracking.
     * @param {Object} evt
     * @return Object
     */
    getUserData: function(evt) {
      const data = prop('detail', evt)
      if (!data) {
        return {}
      }
      const preferredOrg = propOr('', 'preferredOrganization', data)
      const orgName = this.getOrgName(preferredOrg, this.organizations)
      const id = this.getBlackfynnId(data.id)
      return {
        'Blackfynn ID': id,
        'First Name': data.firstName,
        'Last Name': data.lastName,
        'Email': data.email,
        'Title': data.credential,
        'Organization': orgName
      }
    },
  }
})
</script>
