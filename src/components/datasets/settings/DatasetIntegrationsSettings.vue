<template>
  <bf-page class="dataset-integrations-settings">
    <locked-banner slot="banner" />
    <template v-if="hasPermission">
      <bf-rafter slot="heading">
        <h1 slot="heading" class="flex-heading">
          <svg-icon
            v-if="datasetLocked"
            class="mr-8"
            color="#71747C"
            name="icon-lock-filled"
            height="24"
            width="24"
          />
          Dataset Integrations
        </h1>

        <!--        <ul-->
        <!--          slot="tabs"-->
        <!--          class="tabs unstyled"-->
        <!--        >-->
        <!--          <li>-->
        <!--            <router-link :to="{ name: 'dataset-settings' }">-->
        <!--              General-->
        <!--            </router-link>-->
        <!--          </li>-->
        <!--          <li>-->
        <!--            <router-link-->
        <!--              :class="[ hasFeature('sandbox_org_feature') ? 'tab-disabled' : '']"-->
        <!--              :to="{ name: 'integrations-settings' }"-->
        <!--            >-->
        <!--              Integrations-->
        <!--            </router-link>-->
        <!--          </li>-->
        <!--          <li>-->
        <!--            <router-link-->
        <!--              :class="[ hasFeature('sandbox_org_feature') ? 'tab-disabled' : '']"-->
        <!--              :to="{ name: 'publishing-settings' }"-->
        <!--            >-->
        <!--              Publishing-->
        <!--            </router-link>-->
        <!--          </li>-->
        <!--        </ul>-->
      </bf-rafter>
      <bf-stage ref="bfStage" slot="stage">
        <h4 class="integrations-info-title">Integrations</h4>
        <p class="mb-16">
          Integrations allow third-party applications to receive events and
          interact with datasets. Activate integrations for this dataset here.

          <a
            href="https://docs.pennsieve.io/docs/preventing-files-from-being-included-during-publishing"
            target="_blank"
          >
            What's this?
          </a>
        </p>

        <div v-if="integrations.length > 0" class="integration-list">
          <integration-list-item
            v-for="integration in integrations"
            :key="integration.id"
            :integration="integration"
            :active-integrations="activeIntegrations"
            :enable-switch="true"
            @toggle-integration="toggleIntegration"
          />
        </div>

        <bf-empty-page-state v-else class="empty">
          <img
            src="/static/images/illustrations/illo-collaboration.svg"
            height="240"
            width="247"
            alt="Teams illustration"
          />
          <div v-if="hasAdminRights" class="copy">
            <h2>There are no integrations yet</h2>
            <p>
              Integrations allow external services to be notified when certain
              events occur on Pennsieve. These integrations are available to all
              members within the organization and can be managed at the dataset
              level under settings.
            </p>
            <bf-button class="create-team-button" @click="openAddIntegration">
              Add Global Integration
            </bf-button>
          </div>
          <div v-if="!hasAdminRights" class="copy">
            <h2>{{ orgName }} doesn't have any integrations yet.</h2>
            <p>
              Contact your administrator to get started working with
              Integrations.
            </p>
          </div>
        </bf-empty-page-state>
      </bf-stage>
    </template>
    <template v-else>
      <bf-empty-page-state class="empty">
        <img
          src="/static/images/illustrations/illo-collaboration.svg"
          height="240"
          width="247"
          alt="Teams illustration"
        />
        <div class="copy">
          <h2>
            You don't have permission to manage integrations for this dataset.
          </h2>
          <p>Only dataset managers can access this page.</p>
        </div>
      </bf-empty-page-state>
    </template>
  </bf-page>
</template>

<script>
import LockedBanner from '../LockedBanner/LockedBanner'
import BfRafter from '../../shared/bf-rafter/BfRafter'
import Request from '@/mixins/request/index'
import { mapGetters, mapState, mapActions } from 'vuex'
import { pathOr, propOr } from 'ramda'
import IntegrationListItem from '../../Integrations/integration-list-item/IntegrationListItem'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'

export default {
  name: 'DatasetIntegrationsSettings',

  components: {
    LockedBanner,
    BfRafter,
    IntegrationListItem,
    BfEmptyPageState
  },

  mixins: [Request],

  data() {
    return {
      activeIntegrations: [],
      isLoadingIntegrations: false
    }
  },

  props: {},

  computed: {
    ...mapGetters([
      'getPermission',
      'datasetLocked',
      'datasetOwner',
      'datasetOwnerHasOrcidId',
      'hasFeature',
      'activeOrganization'
    ]),
    ...mapState('integrationsModule', ['integrations']),

    ...mapState([
      'dataset',
      'datasetDoi',
      'datasetContributors',
      'datasetDescription',
      'isDatasetOwner',
      'datasetBanner',
      'config',
      'userToken'
    ]),

    orgName: function() {
      return pathOr('', ['organization', 'name'], this.activeOrganization)
    },

    hasAdminRights: function() {
      if (this.activeOrganization) {
        const isAdmin = propOr(false, 'isAdmin', this.activeOrganization)
        const isOwner = propOr(false, 'isOwner', this.activeOrganization)
        return isAdmin || isOwner
      } else {
        return null
      }
    },

    /**
     * Retrieves URL for ORCID redirect, based on environment
     * @returns {String}
     */
    getORCIDUrl: function() {
      const url = pathOr('', ['config', 'ORCIDUrl'])(this)

      if (!url) {
        return ''
      }
      return url
    },

    /**
     * Retrieves the API URL for adding ORCID
     * @returns {String}
     */
    getORCIDApiUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)

      if (!url) {
        return ''
      }

      return `${url}/user/orcid?api_key=${this.userToken}`
    },

    /**
     * Compute the license for the dataset
     * @returns {String}
     */
    datasetLicense: function() {
      return pathOr('Add a license', ['content', 'license'], this.dataset)
    },

    /**
     * Compute if the user has permission to see the settings page
     * @returns {Boolean}
     */
    hasPermission: function() {
      return this.getPermission('manager')
    },

    /**
     * Compute if the user has at least manager permissions
     * @returns {Boolean}
     */
    hasManagerPermissions: function() {
      return this.datasetRole !== 'viewer'
        ? this.getPermission('manager')
        : false
    },

    /**
     * Compute if the dataset has a DOI
     * @returns {Boolean}
     */
    hasDatasetDoi: function() {
      return Object.keys(this.datasetDoi).length
    },

    /**
     * Compute if the dataset has a banner
     * @returns {Boolean}
     */
    hasBanner: function() {
      return this.datasetBanner !== ''
    },

    /**
     * Compute if the dataset has a subtitle
     * @returns {Boolean}
     */
    hasSubtitle: function() {
      const description = pathOr('', ['content', 'description'], this.dataset)
      return Boolean(description)
    },

    /**
     * Compute if the dataset has tags
     * @returns {Boolean}
     */
    hasTags: function() {
      const tags = pathOr([], ['content', 'tags'], this.dataset)
      return tags.length > 0
    },

    /**
     * Compute if the dataset has a description
     * @returns {Boolean}
     */
    hasDescription: function() {
      return this.datasetDescription !== ''
    },

    /**
     * Compute if the dataset has a license
     * @returns {Boolean}
     */
    hasDatasetLicense: function() {
      return this.datasetLicense !== 'Add a license'
    },

    /**
     * Compute if the dataset has tags
     * @returns {Boolean}
     */
    hasContributors: function() {
      return this.datasetContributors.length > 0
    }
  },

  watch: {
    dataset: {
      handler: function(dataset) {
        if (pathOr(false, ['content', 'id'], dataset)) {
          const url = `${this.config.apiUrl}/datasets/${
            dataset.content.id
          }/webhook`

          // Set loading state
          this.isLoadingIntegrations = true

          this.sendXhr(url, {
            header: {
              Authorization: `Bearer ${this.userToken}`
            }
          })
            .then(response => {
              this.activeIntegrations = response
            })
            .catch(this.handleXhrError.bind(this))
            .finally(() => {
              // Set loading state
              this.isLoadingIntegrations = false
            })
        }
      },
      deep: true,
      immediate: true
    },
    /**
     * Watches focusInput route query
     * to scroll into view for right items
     * @param {String} val
     */
    '$route.query.focusInput': {
      handler: function(val) {
        if (val === 'dataciteDoi') {
          this.$nextTick(() => {
            this.$refs.dataciteDoi.$el.scrollIntoView()
          })
        }
        if (val === 'orcidId') {
          this.$nextTick(() => {
            this.$refs.orcidId.$el.scrollIntoView()
          })
        }
        if (val === 'inputAddContributor') {
          this.$nextTick(() => {
            this.$refs.inputAddContributor.$el.scrollIntoView()
          })
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions(['updateProfile']),

    toggleIntegration: function(item) {
      const url = `${this.config.apiUrl}/datasets/${
        this.dataset.content.id
      }/webhook/${item.integration.id}`

      let method = 'PUT'
      if (!item.isActive) {
        method = 'DELETE'
      }

      this.sendXhr(url, {
        method: method,
        header: {
          Authorization: `Bearer ${this.userToken}`
        }
      })
        // .then(response => {
        //   console.log('Integration enabled')
        // })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {})
    },

    /**
     * Logic to connect to user's ORCID
     */
    openORCID: function() {
      this.oauthWindow = window.open(
        this.getORCIDUrl,
        '_blank',
        'toolbar=no, scrollbars=yes, width=500, height=600, top=500, left=500'
      )
      const self = this
      window.addEventListener('message', function(event) {
        this.oauthCode = event.data
        if (this.oauthCode !== '') {
          if (!self.getORCIDApiUrl) {
            return
          }

          self
            .sendXhr(self.getORCIDApiUrl, {
              method: 'POST',
              body: {
                authorizationCode: this.oauthCode
              }
            })
            .then(response => {
              // response logic goes here
              self.oauthInfo = response

              self.updateProfile({
                ...self.profile,
                orcid: self.oauthInfo
              })
            })
            .catch(self.handleXhrError.bind(this))
        }
      })
    },

    /**
     * Compute checklist icon based on prop
     * @param {Boolean} prop
     * @returns {String}
     */
    computeChecklistIcon: function(prop = false) {
      return prop ? 'icon-done-check-circle' : 'icon-info'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.copy {
  h2 {
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
  }

  p {
    color: #71747c;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    margin-bottom: 16px;
  }
}

.integration-list {
  flex-flow: wrap;
  display: flex;
}

.integrations-info-title {
  margin-top: 0px;
  font-weight: 500;
}
.dataset-integrations-settings {
  background: $white;

  hr {
    margin: 32px 0 24px;
  }
}
</style>
