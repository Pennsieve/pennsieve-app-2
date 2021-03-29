import { mapGetters, mapState, mapActions } from 'vuex'
import Cookies from 'js-cookie'
import {
  compose,
  merge,
  pathOr,
  propOr
} from 'ramda'

import BfFeedback from '../bf-feedback/BfFeedback.vue'
import Analytics from '../analytics/Analytics.vue'
import BfDownloadFile from '../bf-download-file/BfDownloadFile.vue'
import CheckActiveUser from '../check-active-user/CheckActiveUser.vue'
import BfNotifications from '../notifications/Notifications.vue'
import BfUploadExternalFile from '../bf-upload-external-file/BfUploadExternalFile.vue'
import BfUpload from '../BfUpload/BfUpload.vue'
import SearchAllData from '@/components/SearchAllData/SearchAllData.vue'
import Office365Dialog from '@/components/datasets/files/Office365Dialog/Office365Dialog.vue'

import globalMessageHandler from '../../mixins/global-message-handler'
import Request from '../../mixins/request'
import UserAccountAge from '../../mixins/user-account-age'
import EventBus from '@/utils/event-bus'

import { setPageTitle, setMeta } from '../../utils/meta'
import toQueryParams from '@/utils/toQueryParams.js'

export default {
  name: 'app',

  components: {
    BfUpload,
    Analytics,
    CheckActiveUser,
    BfNotifications,
    BfFeedback,
    BfDownloadFile,
    BfUploadExternalFile,
    SearchAllData,
    Office365Dialog
  },

  mixins: [
    globalMessageHandler,
    Request,
    UserAccountAge
  ],

  data() {
    return {
      // default page title
      defaultPageTitle: 'Sign In | Pennsieve',
      // default meta description
      defaultPageDescription: 'Pennsieve secure Sign In page. Sign in to your Pennsieve customer account.',
      isUploadExternalFileModalOpen: false,
      externalFile: {}
    }
  },

  computed: {
    ...mapState([
      'datasets',
      'primaryNavOpen',
      'secondaryNavOpen',
      'environment',
      'searchModalVisible'
    ]),

    ...mapState('datasetModule', [
      'datasetSearchParams'
    ]),

    ...mapGetters([
      'activeOrganization',
      'getActiveOrganization',
      'config',
      'userToken',
      'hasFeature'
    ]),

    /**
     * Compute get datasets URL
     * @return {String}
     */
    getDatasetsUrl: function() {
      const params = compose(
        toQueryParams,
        merge({api_key: this.userToken})
      )(this.datasetSearchParams)

      return this.userToken
        ? `${this.config.apiUrl}/datasets/paginated?${params}&includeBannerUrl=true`
        : ''
    },

    /**
     * Compute GET dataset templates URL
     * @returns {String}
     */
    getDatasetTemplatesUrl: function() {
      const orgId = pathOr('', ['organization', 'intId'], this.activeOrganization)

      if (!orgId || !this.userToken) {
        return ''
      }

      return `${this.config.apiUrl}/model-schema/organizations/${orgId}/dataset-templates`
    },

    /**
     * Get all status options for organization url
     * @returns {String}
     */
    getDatasetStatusUrl: function() {
      if (this.config.apiUrl && this.userToken) {
        const orgId = pathOr('', ['organization', 'id'], this.activeOrganization)
        return `${this.config.apiUrl}/organizations/${orgId}/dataset-status?api_key=${this.userToken}`
      }
    }
  },

  mounted() {
    this.$store.watch(this.getActiveOrganization, this.onActiveOrgChange.bind(this))
    EventBus.$on('reload-datasets', this.fetchDatasets)

    const token = Cookies.get('user_token')
    if (!token) {
      setPageTitle(this.defaultPageTitle)
      setMeta('name', 'description', this.defaultPageDescription)
    }
  },

  watch: {
    /**
     * Watch to compute new dataset list
     */
    '$route.params.orgId' (to, from) {
      this.onSwitchOrganization({
        organization: {
          id: to
        }
      })
      this.$nextTick(() => {
        const token = Cookies.get('user_token')
        if (token) {
          this.bootUp(token)
        }
      })
    },

    /**
     * Trigger API request when active organization is changed
     */
    activeOrganization: {
      handler: function(val, oldVal) {
        if (this.getDatasetsUrl && this.datasets.length === 0) {
          this.fetchDatasets()
          this.fetchDatasetPublishedData()
          this.fetchCollections()
        }

        if (this.getDatasetTemplatesUrl && this.hasFeature('dataset_templates_feature')) {
          this.fetchDatasetTemplates()
        }

        if (this.getDatasetStatusUrl) {
          this.fetchDatasetStatuses()
        }
      },
      immediate: true
    },

    /**
     * Watch getDatasetsUrl and get datasets
     * Used for dataset search
     */
    getDatasetsUrl: {
      handler: function(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.fetchDatasets()
        }
      },
      deep: true
    },
  },

  methods: {
    ...mapActions([
      'setDatasets',
      'setIsLoadingDatasets',
      'updateOnboardingEvents',
      'setDatasetTemplates',
      'setIsLoadingDatasetTemplates',
      'setBfTermsOfServiceVersion',
      'setDatasetPublishedData',
      'setIsLoadingDatasetPublishedData',
      'setIsLoadingDatasetsError',
      'updateOrgDatasetStatuses'
    ]),

    ...mapActions('datasetModule', [
      'updateDatasetTotalCount'
    ]),

    ...mapActions('collectionsModule', [
      'fetchCollections'
    ]),

    /**
     * Get dataset publish data
     */
    fetchDatasetPublishedData: function() {
      this.setIsLoadingDatasetPublishedData(true)

      const url = `${this.config.apiUrl}/datasets/published?api_key=${this.userToken}`
      this.sendXhr(url)
      .then(response => {
        this.setDatasetPublishedData(response).then(() => {
          this.setIsLoadingDatasetPublishedData(false)
        })
      })
      .catch(this.handleXhrError.bind(this))
    },

     /**
     * Get datasets for active organization
     */
    fetchDatasets: function() {
      this.setIsLoadingDatasets(true)
        .then(() => this.sendXhr(this.getDatasetsUrl))
        .then(response => {
          this.setDatasetData(response)
          this.setIsLoadingDatasetsError(false)
        })
        .catch(() => {
          this.setDatasetData([])
          this.setIsLoadingDatasetsError(true)
        })
        .finally(() => this.setIsLoadingDatasets(false))
    },

    /**
     * Set dataset data
     * @param {Object} response
     */
    setDatasetData: function(response) {
      const datasets = propOr([], 'datasets', response)
      const datasetTotal = propOr(0, 'totalCount', response)
      return this.setDatasets(datasets)
        .then(() => {
          return this.updateDatasetTotalCount(datasetTotal)
        })
    },

    /**
     * Get dataset templates for active organization
     */
    fetchDatasetTemplates: function() {
      this.setIsLoadingDatasetTemplates(true).then(() => {
        this.sendXhr(this.getDatasetTemplatesUrl, {
          header: {
            'Authorization': `Bearer ${this.userToken}`
          }
        })
        .then(response => {
          this.setDatasetTemplates(response).then(() => {
            this.setIsLoadingDatasetTemplates(false)
          })
        })
        .catch(this.handleXhrError.bind(this))
      })
    },

    /**
     * Get all dataset status options for organization
     */
    fetchDatasetStatuses: function() {
      this.sendXhr(this.getDatasetStatusUrl).then(response => {
        this.updateOrgDatasetStatuses(response)
      })
      .catch(this.handleXhrError.bind(this))
    },

    /**
     * Handles changes to active organization
     * @param {Object} activeOrg
     */
    onActiveOrgChange: function(activeOrg) {
      this.setPageMeta(activeOrg)
    },

    /**
     * Sets page meta for pages except home
     * @param {Object} activeOrg
     */
    setPageMeta: function(activeOrg) {
      const orgName = pathOr('', ['organization', 'name'], activeOrg)
      let pageTitle = `${orgName} | Blackfynn`
      let pageDescription = ''

      if (!orgName) {
        pageTitle = this.defaultPageTitle
        pageDescription = this.defaultPageDescription
      }

      setPageTitle(pageTitle)
      setMeta('name', 'description', pageDescription)
    },

    /**
     * Request critical data required for app to run properly
     * @param {String} userToken
     * @returns {Promise}
     */
    bootUp: function(userToken) {
      return this.getBfTermsOfService()
        .then(() => this.getProfileAndOrg(userToken))
        .then(() => this.getOnboardingEventStates(userToken))
    },

    /**
     * Find Bf.version meta tag and return the content value
     * @param {String} html
     * @returns {String}
     */
    getBfTermsVersion: function(html) {
      const div = document.createElement('div')
      const sanitizedHTML = this.$sanitize(html, ['html', 'head', 'meta'])
      div.innerHTML = sanitizedHTML

      const frag = document.createDocumentFragment()
      frag.appendChild(div)

      const metaTag = frag.querySelector(`meta[name="BF.version"]`)
      const content = metaTag.content
      // replace unnecessary characters if content is available
      return content ? content.replace(/\W|T/g, '') : ''
    },

    /**
      * Get Blackfynn Terms of Service html
      * @param {String} url
      * @returns {Promise}
      */
     getBfTermsOfService: function() {
      return fetch('/static/files/tos.html')
        .then(response => response.text())
        .then(text => {
          // set blackfynn terms of service version
          const bfTermsOfServiceVersion = this.getBfTermsVersion(text)
          return this.setBfTermsOfServiceVersion(bfTermsOfServiceVersion)
        })
    },

    /**
     * Request user onboarding events
     * @param {String} userToken
     */
    getOnboardingEventStates: function(userToken) {
      return this.sendXhr(`${this.config.apiUrl}/onboarding/events?api_key=${userToken}`, {
        header: {
          'Authorization': `bearer ${userToken}`
        }
      })
      .then(this.updateOnboardingEvents.bind(this))
      .catch(this.handleXhrError.bind(this))
    },
  }
}
