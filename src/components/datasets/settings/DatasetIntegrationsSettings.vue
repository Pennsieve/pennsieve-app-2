<template>
  <bf-page class="dataset-integrations-settings">
    <locked-banner
      slot="banner"
    />
    <template v-if="hasPermission">
      <bf-rafter slot="heading">
        <h1
          slot="heading"
          class="flex-heading"
        >
          <svg-icon
            v-if="datasetLocked"
            class="mr-8"
            color="#71747C"
            name="icon-lock-filled"
            height="24"
            width="24"
          />Dataset Settings
        </h1>

        <ul
          slot="tabs"
          class="tabs unstyled"
        >
          <li>
            <router-link :to="{ name: 'dataset-settings' }">
              General
            </router-link>
          </li>
          <li>
            <router-link
              :class="[ hasFeature('sandbox_org_feature') ? 'tab-disabled' : '']"
              :to="{ name: 'integrations-settings' }"
            >
              Integrations
            </router-link>
          </li>
          <li>
            <router-link
              :class="[ hasFeature('sandbox_org_feature') ? 'tab-disabled' : '']"
              :to="{ name: 'publishing-settings' }"
            >
              Publishing
            </router-link>
          </li>
        </ul>
      </bf-rafter>
      <bf-stage
        ref="bfStage"
        slot="stage"
      >
        <h4 class="integrations-info-title">Integrations</h4>
        <p class="mb-16">
          By activating integrations for this dataset, you allow the platform to send event information to the third-party platforms associated with the integrations.
          <a
            href="https://docs.pennsieve.io/docs/preventing-files-from-being-included-during-publishing"
            target="_blank"
          >
            What's this?
          </a>
        </p>

        <div
          v-if="integrations.length > 0"
          class="integration-list"
        >
          <integration-list-item
            v-for="integration in integrations"
            :key="integration.id"
            :integration="integration"
            enable-switch=true
          />
        </div>


      </bf-stage>
    </template>
  </bf-page>
</template>

<script>

import LockedBanner from '../LockedBanner/LockedBanner'
import BfRafter from '../../shared/bf-rafter/BfRafter'
import Request from '@/mixins/request/index'
import { mapGetters, mapState, mapActions } from 'vuex'
import { pathOr } from 'ramda'
import IntegrationListItem from "../../Integrations/integration-list-item/IntegrationListItem";


export default {
  name: 'DatasetIntegrationsSettings',

  components: {
    LockedBanner,
    BfRafter,
    IntegrationListItem

  },

  mixins: [
    Request
  ],

  data() {
    return {
    }
  },

  props: {
  },

  computed: {
    ...mapGetters([
      'getPermission',
      'datasetLocked',
      'datasetOwner',
      'datasetOwnerHasOrcidId',
      'hasFeature',
    ]),
    ...mapState('integrationsModule', [
      'integrations'
    ]),

    ...mapState([
      'dataset',
      'datasetDoi',
      'datasetContributors',
      'datasetDescription',
      'isDatasetOwner',
      'datasetBanner',
      'config',
      'userToken',
    ]),

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
    },
  },

  watch: {
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
    },
  },

  methods: {
    ...mapActions([
      'updateProfile'
    ]),


    /**
     * Logic to connect to user's ORCID
     */
    openORCID: function() {
      this.oauthWindow = window.open(this.getORCIDUrl, "_blank", "toolbar=no, scrollbars=yes, width=500, height=600, top=500, left=500");
      const self = this
      window.addEventListener('message', function(event) {
        this.oauthCode = event.data
        if (this.oauthCode !== '') {
          if (!self.getORCIDApiUrl) {
            return
          }

          self.sendXhr(self.getORCIDApiUrl, {
            method: 'POST',
            body: {
              "authorizationCode": this.oauthCode
            }
          })
            .then((response) => {
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
  },
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.integrations-info-title {
  margin-top: 0px;
  font-weight: 500;
}
.bf-publishing-settings {
  background: $white;
  hr {
    margin: 32px 0 24px;
  }
}

</style>