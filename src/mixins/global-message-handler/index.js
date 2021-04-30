import { mapGetters, mapActions, mapState } from 'vuex'
import Auth from '@aws-amplify/auth'

import EventBus from '../../utils/event-bus'
import Request from '../request'
import UserRoles from '../user-roles'
import logger from '../../mixins/logger'
import Sorter from '../../mixins/sorter'
import LogoutHandler from '../logout-handler'
import UserAccountAge from '../../mixins/user-account-age'

import Cookies from 'js-cookie'
import { path, pathOr, propOr, find, pathEq, defaultTo, isEmpty, not, compose, prop, propEq } from 'ramda'

export default {
  data() {
    return {
      minCompletedEvents: 5,
      datasetStatusList: []
    }
  },

  mixins: [
    Request,
    UserRoles,
    LogoutHandler,
    logger,
    UserAccountAge,
    Sorter
  ],

  mounted() {
    // Vue event listeners
    EventBus.$on('login', this.onLogin.bind(this))
    EventBus.$on('logout', this.onLogout.bind(this))
    EventBus.$on('toast', this.onToast.bind(this))
    EventBus.$on('ajaxError', this.onToast.bind(this))
    EventBus.$on('trigger-download', this.onTriggerDownload.bind(this))
    EventBus.$on('trigger-record-csv-download', this.onTriggerRecordCsvDownload.bind(this))
    EventBus.$on('switch-organization', this.onSwitchOrganization.bind(this))
    EventBus.$on('open-viewer', this.onOpenViewer.bind(this))
    EventBus.$on('add-to-upload-queue', this.addToUploadQueue.bind(this))
    EventBus.$on('add-input-files-to-upload-queue', this.addInputFilesToUploadQueue.bind(this))
    EventBus.$on('open-uploader', this.onOpenUploader.bind(this))
    EventBus.$on('close-uploader', this.onCloseUploader.bind(this))
    EventBus.$on('get-file-proxy-id', this.getFilesProxyId.bind(this))
    EventBus.$on('open-external-file-modal', this.onOpenExternalFileModal.bind(this))
    EventBus.$on('close-external-file-modal', this.onCloseExternalFileModal.bind(this))
    EventBus.$on('set-default-route', this.setDefaultRoute.bind(this))

    // Polymer event listeners
    document.addEventListener('login', this.onLogin.bind(this))
    document.addEventListener('logout', this.onLogout.bind(this))
    document.addEventListener('toast', this.onToast.bind(this))
    document.addEventListener('ajaxError', this.onToast.bind(this))
    document.addEventListener('open-viewer', this.onOpenViewer.bind(this))
    document.addEventListener('set-vue-route', this.onSetVueRoute.bind(this))
    document.addEventListener('replace-vue-route', this.onReplaceVueRoute.bind(this))
    document.addEventListener('get-vuex-state', this.onGetVuexState.bind(this))
  },

  beforeDestroy() {
    // Vue event listeners
    EventBus.$off('logout', this.onLogout.bind(this))
    EventBus.$off('toast', this.onToast.bind(this))
    EventBus.$off('ajaxError', this.onToast.bind(this))
    EventBus.$off('trigger-download', this.onTriggerDownload.bind(this))
    EventBus.$off('trigger-record-csv-download', this.onTriggerRecordCsvDownload.bind(this))
    EventBus.$off('switch-organization', this.onSwitchOrganization.bind(this))
    EventBus.$off('open-viewer', this.onOpenViewer.bind(this))
    EventBus.$off('add-to-upload-queue', this.addToUploadQueue.bind(this))
    EventBus.$off('add-input-files-to-upload-queue', this.addInputFilesToUploadQueue.bind(this))
    EventBus.$off('open-uploader', this.onOpenUploader.bind(this))
    EventBus.$off('close-uploader', this.onCloseUploader.bind(this))
    EventBus.$off('get-file-proxy-id', this.getFilesProxyId.bind(this))
    EventBus.$off('open-external-file-modal', this.onOpenExternalFileModal.bind(this))
    EventBus.$off('close-external-file-modal', this.onCloseExternalFileModal.bind(this))
    EventBus.$off('set-default-route', this.onSetDefaultRoute.bind(this))

    // Polymer event listeners
    document.removeEventListener('login', this.onLogin.bind(this))
    document.removeEventListener('logout', this.onLogout.bind(this))
    document.removeEventListener('toast', this.onToast.bind(this))
    document.removeEventListener('ajaxError', this.onToast.bind(this))
    document.removeEventListener('open-viewer', this.onOpenViewer.bind(this))
    document.removeEventListener('set-vue-route', this.onSetVueRoute.bind(this))
    document.removeEventListener('replace-vue-route', this.onReplaceVueRoute.bind(this))
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'userToken',
      'config',
      'organizations',
      'profile',
      'hasFeature',
      'publisherTeam',
    ]),

    ...mapState([
      'onboardingEvents',
      'bfTermsOfServiceVersion',
      'orgDatasetStatuses',
      'shouldShowLinkOrcidDialog'
    ]),

    /**
     * Returns the active organization id
     * @returns {String}
     */
    activeOrgId: function() {
      return path(['organization', 'id'], this.activeOrganization)
    },

    /**
     * Generates org members GET url
     * @returns {String}
     */
    orgMembersUrl: function() {
      if (!this.activeOrgId || !this.userToken) {
        return
      }
      return `${this.config.apiUrl}/organizations/${this.activeOrgId}/members?api_key=${this.userToken}`
    },

    /**
     * Compute org contributors URL
     * @returns {String}
     */
    getOrgContributorsUrl: function() {
      if (!this.userToken) {
        return
      }
      return `${this.config.apiUrl}/contributors?api_key=${this.userToken}`
    }
  },

  methods: {
    ...mapActions([
      'updateActiveOrganization',
      'updateOrganizations',
      'updateOrgMembers',
      'updateUserToken',
      'updateProfile',
      'clearState',
      'updateTeams',
      'updatePublishers',
      'updateConcepts',
      'updateFilesProxyId',
      'togglePrimaryNav',
      'toggleSecondaryNav',
      'setDatasets',
      'updateOnboardingEvents',
      'setGettingStartedOpen',
      'setDatasetTemplates',
      'setOrgContributors',
      'clearDatasetFilters',
      'updateDataUseAgreements',
      'updateCognitoUser'
    ]),

    ...mapActions('datasetModule', [
      'clearSearchState'
    ]),

    /**
    * Check if the organization has accepted subscription terms
    * @param {Object} organization
    * @returns {Boolean}
    */
    checkIsSubscribed: function(organization) {
      const activeOrgTermsVersion = pathOr('', ['organization', 'customTermsOfService', 'version'], organization)
      const activeOrgHasTerms = Boolean(activeOrgTermsVersion)
      // if org has custom terms, check that user has accepter most recent version
      if (activeOrgHasTerms) {
        // get the user's terms of service object for current org
        // search through every customTermsOfService object to find match
        const orgId = pathOr('', ['organization', 'id'], organization)
        const profileTerms = compose(
          defaultTo(''),
          prop('version'),
          find(propEq('organizationId', orgId)),
          propOr([], 'customTermsOfService')
        )(this.profile)
        // check versions for equality
        return activeOrgTermsVersion === profileTerms
      }

      // get Pennsieve terms on user profile object
      const profileTerms = pathOr('', ['pennsieveTermsOfService', 'version'], this.profile)

      // short circuit if user has never accepted Pennsieve terms
      if (!profileTerms) {
        return false
      }

      // check versions for equality
      return this.bfTermsOfServiceVersion === profileTerms
    },

    /**
     * Gets files proxy ID for dataset
     */
    getFilesProxyId: function() {
      const defaultPromise = Promise.resolve([])

      const datasetId = pathOr(0, ['params', 'datasetId'], this.$route)
      if (datasetId === 0) {
        return this.updateFilesProxyId('')
      }

      const url = `${this.config.conceptsUrl}/datasets/${datasetId}/proxy/package`
      return this.sendXhr(url, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
      .then(response => {
        this.updateFilesProxyId(response.id)
      })
    },

    /**
     * Gets user profile and active org data
     * @param {String} token
     */
    getProfileAndOrg: function(token) {
      if (!token) {
        return
      }

      // TODO: Refactor to take both token and profile
      // add logic to only make organizations request if profile is defined

      const orgPromise = this.sendXhr(this.getActiveOrgUrl(token))
      const profilePromise = this.sendXhr(this.getProfileUrl(token))

      return Promise.all([orgPromise, profilePromise])
        .then(([orgs, profile]) => {
          this.updateProfile(profile)
          console.log('profile is now ', profile)
          this.updateUserToken(token)

          const sortedOrgs = this.returnSort('organization.name', orgs.organizations, 'asc')
          this.updateOrganizations(sortedOrgs)

          const preferredOrgId = profile.preferredOrganization
          // check route params for orgId
          const activeOrgId = preferredOrgId ?
            pathOr(preferredOrgId, ['params', 'orgId'], this.$route) :
            path(['organizations', 0, 'organization', 'id'], orgs)
          const activeOrgIndex = orgs.organizations.findIndex(org => Boolean(org.organization.id === activeOrgId))
          const activeOrg = orgs.organizations[activeOrgIndex]

          // handle org switch and terms of service re-directs
          return this.handleRedirects(activeOrg, activeOrgId, preferredOrgId)
        })
        .then(this.getOrgMembers.bind(this))
        .then(this.getTeams.bind(this))
        .then(this.getPublishers.bind(this))
        .then(this.getOrgContributors.bind(this))
        .then(this.getDataUseAgreements.bind(this))
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Handle direct links and check if user is subscribed
     * @param {Object} activeOrg
     * @param {String} activeOrgId
     * @param {String} preferredOrgId
     * @returns {Promise}
     */
    handleRedirects: function(activeOrg, activeOrgId, preferredOrgId) {
      // handle direct links
      if ((activeOrgId && preferredOrgId) && activeOrgId !== preferredOrgId) {
        EventBus.$emit('switch-organization', activeOrg, false)
        return Promise.resolve()
      }

      const isSubscribed = this.checkIsSubscribed(activeOrg)
      if (!isSubscribed) {
        this.$router.replace(`/${activeOrgId}/welcome/terms-of-service`)
      }
      return this.updateActiveOrganization(activeOrg)
    },
    /**
     * Get active org url
     * @param {String} token
     */
    getActiveOrgUrl: function(token) {
      return `${this.config.apiUrl}/organizations?api_key=${token}`
    },
    /**
     * Get profile url
     * @param {String} token
     */
    getProfileUrl: function(token) {
      return `${this.config.apiUrl}/user?api_key=${token}`
    },
    /**
     * Get active org data
     */
    getActiveOrg: function() {
      const url = this.getActiveOrgUrl(this.userToken)
      if (!url) {
        return
      }
      this.sendXhr(url)
        .then((orgs) => {
          const activeOrgIndex =  orgs.organizations.findIndex(org => {
            return org.organization.id === profile.preferredOrganization
          })
          const activeOrg = orgs.organizations[activeOrgIndex]
          return this.updateActiveOrganization(activeOrg)
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * @param {Object} evt
     */
    onLogin: function(evt) {
      let token = pathOr('', ['token'], evt)

      // handle onboarding case
      if (!token && evt.detail) {
        token = pathOr('', ['detail', 'token'], evt)
      }

      // short circuit if we still don't have a token
      if (!token) {
        return
      }

      Cookies.set('user_token', token)

      const FirstTimeSignOn = pathOr(false, ['detail', 'firstTimeSignOn'], evt)
      if (FirstTimeSignOn) {
        this.saveFirstTimeSignOnEvent(token)
      }

      this.bootUp(token)
        .then(() => {
          // send event to analytics component
          EventBus.$emit('track-user', {
            detail: this.profile
          })

          const user = pathOr('', ['user'], evt)
          this.updateCognitoUser(user)
          const activeOrg = this.activeOrganization
          const orgId = this.activeOrgId
          const isSubscribed = this.checkIsSubscribed(activeOrg)

          if (!isSubscribed) {
            this.$router.replace(`/${orgId}/welcome/terms-of-service`)
          } else {
            this.setDefaultRoute(orgId)
          }
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Launch onboarding components
     */
    launchOnboarding: function() {
      const events = defaultTo([], this.onboardingEvents)
      if (this.userIsLessThan30DaysOld && events.length < this.minCompletedEvents && events.indexOf('LaunchCarousel') >= 0) {
        // getting started guide
        this.setGettingStartedOpen(true)
      }
    },

    /**
     * Set the default route for the user based off of their feature flag
     * @param {String} orgId
     */
    setDefaultRoute: function(orgId) {
      const redirect = pathOr('', ['query', 'redirectTo'], this.$route)
      if (redirect) {
        window.location.replace(redirect)
      } else {
        this.$router.push(`/${orgId}/datasets`)
        this.launchOnboarding()
        if (this.shouldShowLinkOrcidDialog) {
          this.setLinkOrcidDialog()
        }
      }
    },

    /**
     * Handles logout
     * @param {Object} payload
     */
    onLogout: async function(payload) {
      try {
        await Auth.signOut()
        this.handleLogout(payload)
      } catch (error) {
        this.handleXhrError()
      }
    },
    /**
     * Handles switch-organization event
     * @param {Object} evt
     * @param {Boolean} bool
     */
    onSwitchOrganization: function(evt, redirect = true) {
      const newOrg = propOr({}, 'organization', evt)
      const newOrgId = propOr(1, 'id', newOrg)
      const newOrgIntId = propOr(1, 'intId', newOrg)
      const activeOrgId = pathOr(0, ['organization', 'id'], this.activeOrganization)
      // Do nothing if the user is trying to switch to the organization that is already active or if no userToken found
      if (newOrgId === activeOrgId || !this.userToken) {
        return
      }
      // switch org in vue app
      const switchOrgUrl = `${this.config.apiUrl}/session/switch-organization?organization_id=${newOrgIntId}&api_key=${this.userToken}`
      this.sendXhr(switchOrgUrl, { method: 'PUT' })
        .then(response => {
          const updatedOrg = find(pathEq(['organization', 'id'], newOrgId), this.organizations)

          // Clear filters and search query
          this.clearDatasetFilters()
          this.clearSearchState()

          // Reset state of dataset
          this.setDatasets([])
          this.updateConcepts([])
          this.updateFilesProxyId(null)

          this.updateActiveOrganization(updatedOrg)
          this.updateProfile(response)

          // Reset state of menu
          this.togglePrimaryNav(true)
          this.toggleSecondaryNav(false)

          // Reset state of dataset templates
          this.setDatasetTemplates([])

          // Check to see if user has accepted terms of service
          const isSubscribed = this.checkIsSubscribed(updatedOrg)
          if (redirect === true) {
            if (!isSubscribed) {
              this.$router.replace(`/${newOrgId}/welcome/terms-of-service`)
            } else {
              this.setDefaultRoute(newOrgId)
            }
          }
          return this.getOrgMembers()
                  .then(this.getTeams.bind(this))
                  .then(this.getOrgContributors.bind(this))
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Updates org users object with any missing fields required for sorting
     * @param {Array} users
     * @returns {Array}
     */
    updateMembers: function(users) {
      return users.map(member => {
        const role = this.getOrgRole(member, this.activeOrganization)
        let newFields = { role }
        if (!member.storage) {
          newFields = {
            storage: 0,
            role
          }
        }
        return Object.assign({}, newFields, member)
      })
    },
    /**
     * Retrieves all members of an organization
     */
    getOrgMembers: function() {
      const url = this.orgMembersUrl
      if (!url) {
        return
      }
      return this.sendXhr(url).then(resp => {
        const members = this.updateMembers(resp)
        this.updateOrgMembers(members)
      })
    },
    /**
     * Generates teams GET url
     */
    getTeamsUrl: function() {
      if (!this.activeOrgId || !this.userToken) {
        return
      }
      return `${this.config.apiUrl}/organizations/${this.activeOrgId}/teams?api_key=${this.userToken}`
    },
    /**
     * Retrieves all teams of an organization
     */
    getTeams: function() {
      const url = this.getTeamsUrl()
      if (!url) {
        return
      }
      return this.sendXhr(url).then(this.updateTeams.bind(this))
    },
    getPublishersUrl: function() {
      if (!this.activeOrgId || !this.userToken || !this.publisherTeam) {
        return
      }
      return `${this.config.apiUrl}/organizations/${this.activeOrgId}/teams/${this.publisherTeam.id}/members?api_key=${this.userToken}`
    },
    /**
     * retrieves the users in the system defined publishers team
     */
    getPublishers: function() {
      const url = this.getPublishersUrl()
      if (!url) {
        return
      }
      return this.sendXhr(url).then(this.updatePublishers.bind(this))
    },
    /**
     * Retrieves all contributors of an organization
     */
    getOrgContributors: function() {
      return this.sendXhr(this.getOrgContributorsUrl)
              .then(this.setOrgContributors.bind(this))
              .catch(this.handleXhrError.bind(this))
    },
    /**
     * @param {Object} evt
     */
    onOpenViewer: function(evt) {
      const fileId = pathOr('', ['detail', 'item', 'content', 'id'], evt)
      if (fileId) {
        this.$router.push({
          name: 'viewer',
          params: { fileId }
        })
      }
    },
    /**
     * @param {Object} evt
     */
    onToast: function(evt) {
      const detailMsg = pathOr('', ['detail', 'msg'], evt)
      const message = this.$sanitize(propOr(detailMsg, 'msg', evt), ['a'])
      const type = pathOr('info', ['detail', 'type'], evt).toLowerCase()
      const duration = pathOr(3000, ['detail', 'duration'], evt)
      let messageClass = pathOr('', ['detail', 'class'], evt)

      if (!message) {
        this.logger(['Error!', evt], 'error')
        return
      }

      // Check the route to see if header is visible
      if (this.$route.matched.some(record => record.components.header)) {
        messageClass = 'with-header'
      }

      this.$message({
        message,
        type,
        showClose: true,
        customClass: messageClass,
        duration,
        dangerouslyUseHTMLString: true
      })
    },
    /**
     * Close off primary nav
     */
    closeMenu: function() {
      this.$store.dispatch('togglePrimaryNav', false)
    },

    /**
     * trigger the download component
     * @param selection selected packages or files
     * @param packageObj optional - parent package if sending files
     */
    onTriggerDownload: function(selection, packageObj) {
      this.$refs.downloadFile.triggerDownload(selection, packageObj)
    },

    onTriggerRecordCsvDownload: function(query) {
      this.$refs.downloadFile.triggerRecordCsvDownload(query)
    },

    /**
     * Open upload component
     * @param {Boolean} isAddingFiles
     */
    onOpenUploader: function(isAddingFiles) {
      const bfUpload = this.$refs.bfUpload
      bfUpload.isOpen = true
      bfUpload.isAddingFiles = isAddingFiles
    },

    /**
     * Close upload component
     */
    onCloseUploader: function() {
      const bfUpload = this.$refs.bfUpload
      bfUpload.isOpen = false
      bfUpload.clearUploadedFiles()
    },

    /**
     * Add files to upload queue
     * @param {Object} dataTransfer
     */
    addToUploadQueue: function(dataTransfer) {
      const bfUpload = this.$refs.bfUpload
      bfUpload.onDrop(dataTransfer)

      this.onOpenUploader({
        detail: {
          isAddingFiles: true
        }
      })
    },
    /**
     * Add files to upload queue via a file input change event
     * @param {Object} e
     */
    addInputFilesToUploadQueue: function(e) {
      const bfUpload = this.$refs.bfUpload
      bfUpload.onInputFileChange(e)

      this.onOpenUploader({
        detail: {
          isAddingFiles: true
        }
      })
    },
    /**
     * Update Vue Router from Polymer
     * @param {Object} evt
     */
    onSetVueRoute: function(evt) {
      const { name, params } = evt.detail
      this.$router.push({ name, params })
    },

    /**
     * Set Vuex state for polymer components
     * @param {Object} evt
     */
    onGetVuexState: function(evt) {
      evt.detail.initStore(this.$store)
    },

    /**
     * Replace Vue Router from Polymer
     * @param {Object} evt
     */
    onReplaceVueRoute: function(evt) {
      const { name, params } = evt.detail
      this.$router.replace({ name, params })
    },

    /**
     * Check if this is a first time user
     * @param {String} userToken
     */
    saveFirstTimeSignOnEvent: function(userToken) {
      this.sendXhr(`${this.config.apiUrl}/onboarding/events?api_key=${userToken}`, {
        method: 'POST',
        body: 'FirstTimeSignOn',
        header: {
          'Authorization': `bearer ${userToken}`
        }
      })
      .then(() => {
        const list = defaultTo([], this.onboardingEvents)
        const onboardingEvents = [...list, 'FirstTimeSignOn']
        this.updateOnboardingEvents(onboardingEvents)
      })
      .catch(this.handleXhrError.bind(this))
    },

    /**
     * Handle open-external-file-modal event
     * @param {Object} file
     */
    onOpenExternalFileModal: function(file = {}) {
      if (file.externalFile) {
        this.externalFile = file
      }
      this.isUploadExternalFileModalOpen = true
    },

    /**
     * Handle close-external-file-modal event
     */
    onCloseExternalFileModal: function() {
      this.isUploadExternalFileModalOpen = false
    },

    /**
     * Handle update-profile event
     */
    onUpdateProfile: function(evt) {
      const profile = propOr('', 'profile', evt.detail)
      this.updateProfile(profile)
    },

    /**
     * Get data use agreements for organization
     */
    getDataUseAgreements: function() {
      return this.sendXhr(`${this.config.apiUrl}/organizations/${this.activeOrgId}/data-use-agreements?api_key=${this.userToken}`)
        .then((response) => {
          return this.updateDataUseAgreements(response)
        })
        .catch(() =>  {
          return this.updateDataUseAgreements([])
        })
    },
  },
}
