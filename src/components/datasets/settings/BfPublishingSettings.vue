<template>
  <bf-page class="bf-publishing-settings">
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
          />Dataset Publishing
        </h1>
      </bf-rafter>
      <bf-stage
        ref="bfStage"
        slot="stage"
      >
        <data-card
          v-if="isChecklistDimissed === false && hasManagerPermissions"
          class="mb-32 grey compact"
          title="Your dataset cannot be published until the following items have been completed:"
          :padding="false"
        >
          <checklist-item
            :icon="computeChecklistIcon(hasSubtitle)"
            :route="{
              name: 'dataset-settings',
              query: {
                focusInput: 'inputDescription'
              }
            }"
            cta="Add a subtitle"
          >
            gives others a brief description of your dataset.
          </checklist-item>

          <checklist-item
            :icon="computeChecklistIcon(hasTags)"
            :route="{
              name: 'dataset-settings',
              query: {
                focusInput: 'inputTags'
              }
            }"
            cta="Add tags"
          >
            make it easier for people to find your dataset in Discover.
          </checklist-item>

          <checklist-item
            :icon="computeChecklistIcon(hasDescription)"
            cta="Add a description"
            :route="{
              name: 'dataset-overview',
              query: {
                editDescription: true
              }
            }"
          >
            provide a detailed overview of your dataset and outline your findings and analysis for others.
          </checklist-item>

          <checklist-item
            :icon="computeChecklistIcon(hasBanner)"
            cta="Add an image"
            :route="{
              name: 'dataset-settings',
              query: {
                focusInput: 'bannerImage'
              }
            }"
          >
            add an image to help your dataset stand out in listings.
          </checklist-item>

          <checklist-item
            :icon="computeChecklistIcon(hasContributors)"
            cta="Add contributors"
            :route="{
              query: {
                focusInput: 'inputAddContributor'
              }
            }"
          >
            list all of the people who have contributed to this dataset.
          </checklist-item>
          <checklist-item
            :icon="computeChecklistIcon(hasDatasetDoi)"
            cta="Reserve a DOI"
            :route="{
              query: {
                focusInput: 'dataciteDoi'
              }
            }"
          >
            reserve a DataCite DOI for published research.
          </checklist-item>

          <checklist-item
            :icon="computeChecklistIcon(hasDatasetLicense)"
            cta="Add a license"
            :route="{
              name: 'dataset-settings',
              query: {
                focusInput: 'inputLicense'
              }
            }"
          >
            let others know how they can use this data in their own research.
          </checklist-item>

          <checklist-item
            :icon="computeChecklistIcon(datasetOwnerHasOrcidId)"
            cta="Link ORCID Account"
            :route="{
              query: {
                focusInput: 'orcidId'
              }
            }"
            :show-link="isDatasetOwner"
          >
            <template v-if="isDatasetOwner">
              link your ORCID iD to distinguish yourself from other researchers
            </template>
            <template v-else>
              link the dataset owner's ORCID iD to distinguish themselves from other researchers
            </template>
          </checklist-item>

        </data-card>
        <hr>

        <dataset-settings-ignore-files />

        <hr>

        <dataset-settings-doi ref="dataciteDoi" />

        <hr>

        <dataset-settings-contributors ref="inputAddContributor" />

        <hr>

        <owner-orcid
          ref="orcidId"
          @open-orcid="openORCID"
        />

        <hr>

        <dataset-settings-publishing
          :orcid-api-url="getORCIDApiUrl"
          :orcid-url="getORCIDUrl"
        />
      </bf-stage>
    </template>
    <template v-else>
      <bf-empty-page-state
        class="empty"
      >
        <img
          src="/static/images/illustrations/illo-collaboration.svg"
          height="240"
          width="247"
          alt="Teams illustration"
        >
        <div
          class="copy"
        >
          <h2>You don't have permission to manage publishing for this dataset.</h2>
          <p>Only dataset managers can access this page.</p>
        </div>
      </bf-empty-page-state>
    </template>
  </bf-page>
</template>

<script>
import DatasetSettingsIgnoreFiles from './DatasetSettingsIgnoreFiles/DatasetSettingsIgnoreFiles.vue'
import DatasetSettingsDoi from './DatasetSettingsDoi/DatasetSettingsDoi.vue'
import OwnerOrcid from './DatasetSettingsPublishing/OwnerOrcid.vue'
import DatasetSettingsContributors from './DatasetSettingsContributors/DatasetSettingsContributors.vue'
import DatasetSettingsPublishing from './DatasetSettingsPublishing/DatasetSettingsPublishing.vue'
import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue'
import LockedBanner from '../LockedBanner/LockedBanner'
import DataCard from '../../shared/DataCard/DataCard.vue'
import ChecklistItem from '../../shared/ChecklistItem/ChecklistItem.vue'
import BfRafter from '../../shared/bf-rafter/BfRafter'
import Request from '@/mixins/request/index'
import { mapGetters, mapState, mapActions } from 'vuex'
import { pathOr } from 'ramda'

  export default {
    name: 'BfPublishingSettings',

    components: {
      DataCard,
      ChecklistItem,
      LockedBanner,
      BfRafter,
      DatasetSettingsIgnoreFiles,
      DatasetSettingsDoi,
      DatasetSettingsPublishing,
      OwnerOrcid,
      DatasetSettingsContributors,
      BfEmptyPageState
    },

    mixins: [
      Request
    ],

    data() {
      return {
        isChecklistDimissed: false,
        loadingOrcid: false,
        deleteOrcidDialogVisible: false
      }
    },

    computed: {
      ...mapGetters([
        'getPermission',
        'datasetLocked',
        'datasetOwner',
        'datasetOwnerHasOrcidId',
        'hasFeature'
      ]),

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
.bf-publishing-settings {
  background: $white;
  hr {
    margin: 32px 0 24px;
  }
}
.copy {
  h2 {
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
  }

  p {
    color: #71747C;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    margin-bottom: 16px;
  }

}

</style>
