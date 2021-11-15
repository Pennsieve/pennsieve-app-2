<template>
  <el-row>
    <h2>
      Publishing Your Dataset
    </h2>
    <el-col>
      <dataset-settings-publishing-loader v-if="isLoadingDatasetPublishedData" />
      <h3 class="heading">
        Status
      </h3>
      <template v-if="publicationStatus === PublicationStatus.FAILED">
        <status-failed />
      </template>
      <template v-else-if="publicationStatus === PublicationStatus.REQUESTED && publicationType !== PublicationType.REVISION">
        <status-requested :publication-type="publicationType" />
        <h3 class="heading publication">
          Request to Publish
        </h3>
        <sharing-info />
        <submit-for-publication
          :has-dataset="true"
          :can-publish="canPublish"
          :dataset-id="datasetId"
          :is-requested="publicationStatus === PublicationStatus.REQUESTED"
        />
      </template>
      <template v-else-if="publicationStatus === PublicationStatus.ACCEPTED">
        <status-accepted />
      </template>

      <template v-else>
        <template v-if="isPublished">
          <status-published
            :can-publish="canPublish"
            :dataset-id="datasetId"
            :dataset-owner-name="datasetOwnerName"
            :dataset-owner-email="datasetOwnerEmail"
            :discover-link="discoverLink"
            :has-publishing-permission="getPermission('owner')"
            :published-date="publishedDate"
          />
        </template>
        <template v-else>
          <template v-if="getPermission('owner') && !datasetOwnerHasOrcidId">
            <owner-orcid @open-orcid="openORCID" />
          </template>
          <template v-else>
            <div v-if="canPublish">
              <p>Your publishing checklist is complete and the dataset is ready to be submitted for review.</p>
            </div>
            <div v-else>
              <p>Your dataset is missing items and cannot be published. Please review the checklist at the top of the page for more information.</p>
            </div>
            <h3 class="heading publication">
              Request to Publish
            </h3>
            <sharing-info />
            <submit-for-publication
              :has-dataset="true"
              :can-publish="canPublish"
              :dataset-id="datasetId"
            />
          </template>
        </template>
      </template>
      <hr>
      <dataset-settings-publication-actions
        :can-publish="canPublish"
      />
    </el-col>
  </el-row>


</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { all, defaultTo, merge, path, pathOr, propOr } from 'ramda';
import { PublicationStatus, PublicationType } from '@/utils/constants';
import DatasetSettingsPublishingLoader from './DatasetSettingsPublishingLoader';
import DatasetSettingsPublicationActions from '../DatasetSettingsPublicationActions/DatasetSettingsPublicationActions.vue'

import Request from '@/mixins/request';
import FormatDate from '@/mixins/format-date/index';
import OwnerOrcid from './OwnerOrcid';
import SubmitForPublication from './SubmitForPublication';
import StatusPublished from './StatusPublished';
import StatusRequested from './StatusRequested';
import StatusAccepted from './StatusAccepted';
import StatusFailed from './StatusFailed';
import SharingInfo from './SharingInfo';

export default {
  name: 'DatasetSettingsPublishing',

  components: {
    StatusPublished,
    SubmitForPublication,
    OwnerOrcid,
    DatasetSettingsPublishingLoader,
    DatasetSettingsPublicationActions,
    StatusFailed,
    StatusRequested,
    StatusAccepted,
    SharingInfo
  },

  mixins: [FormatDate, Request],

  props: {
    orcidAPIUrl: {
      type: String,
      default: ''
    },
    orcidUrl: {
      type: String,
      default: ''
    }
  },

  data: function() {
    return {
      isPublishing: false,
      isUnpublishing: false,
      oauthWindow: '',
      oauthCode: '',
      isPublisherRole: '',
      PublicationStatus,
      PublicationType
    }
  },

  computed: {
    ...mapState([
      'dataset',
      'userToken',
      'isLoadingDatasetPublishedData',
      'datasetBanner',
      'datasetContributors',
      'datasetDescription',
      'getPermission',
      'orgMembers',
      'onboardingEvents'
    ]),
    ...mapGetters([
      'getPermission',
      'datasetOwner',
      'profile',
      'config',
      'datasetOwnerHasOrcidId',
      'datasetLocked',
      'getPublishedDataByIntId',
      'isUserSuperAdmin',
      'isUserPublisher'
    ]),

    /**
     * Get dataset tags
     * @returns {Array}
     */
    datasetTags: function() {
      return pathOr([], ['content', 'tags'], this.dataset)
    },

    /**
     * Get datasetId
     * @returns {String}
     */
    datasetId: function() {
      return pathOr('', ['content', 'id'], this.dataset)
    },

    /**
     * Returns the full dataset owner name
     * @returns {String}
     */
    datasetOwnerName: function() {
      const firstName = propOr('', 'firstName', this.datasetOwner)
      const lastName = propOr('', 'lastName', this.datasetOwner)
      return `${firstName} ${lastName}`
    },

    /**
     * Returns the dataset owner email
     * @returns {String}
     */
    datasetOwnerEmail: function() {
      return propOr('', 'email', this.datasetOwner)
    },


    /**
     * Compute if the publish button is disabled
     * @returns {Boolean}
     */
    canPublish: function() {
      const name = path(['content', 'name'], this.dataset)
      const subtitle = path(['content', 'description'], this.dataset)
      const license = path(['content', 'license'], this.dataset)
      const contributors = this.datasetContributors
      const banner = this.datasetBanner
      const datasetDescription = this.datasetDescription


      const isTrue = item => item === true

      return all(isTrue, [
        Boolean(name),
        Boolean(subtitle),
        Boolean(banner),
        Boolean(license),
        this.datasetTags.length > 0,
        contributors.length > 0,
        Boolean(datasetDescription),
        Boolean(this.getPermission('owner') ||  this.isUserPublisher)
      ])
    },

    /**
     * Compute if the dataset is published
     * @returns {Boolean}
     */
    isPublished: function() {
      return this.publishedData && Object.keys(this.publishedData).length > 0 && this.publicationType !== PublicationType.REMOVAL
    },

    /**
     * Compute dataset's current publication status
     * @returns {String}
     */
    publicationStatus: function() {
      return pathOr(PublicationStatus.DRAFT, ['publication', 'status'], this.dataset)
    },

    /**
     * Compute dataset's current publication type
     * @returns {String}
     */
    publicationType: function() {
      return this.dataset.publication.type || ''
    },

    /**
     * Compute published data
     * @returns {Object}
     */
    publishedData: function() {
      const dataset = defaultTo({}, this.dataset)
      const datasetIntId = path(['content', 'intId'], dataset)
      return this.getPublishedDataByIntId(datasetIntId)
    },

    /**
     * Compute published date
     * @returns {String}
     */
    publishedDate: function() {
      const date = propOr('', 'lastPublishedDate', this.publishedData)
      return this.formatDate(date)
    },

    /**
     * Compute link for dataset on discover
     * @returns {String}
     */
    discoverLink: function() {
      const publishedDatasetId =  propOr(1, 'publishedDatasetId', this.publishedData)

      return this.config.environment === 'prod'
        ? `https://discover.pennsieve.io/datasets/${publishedDatasetId}`
        : `https://discover.pennsieve.net/datasets/${publishedDatasetId}`
    },
  },


  mounted () {
    // assign isPublisherRole based on user account
    this.orgMembers.forEach(member => {
      if (member.id === this.profile.id) {
        // found a match!
        this.isPublisherRole = member.isPublisher
      }
    })
  },

  methods: {
    ...mapActions([
      'addDatasetPublishedData',
      'updateDatasetPublishedData',
      'deleteDatasetPublishedData',
      'updateDataset',
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
     * Set published data
     * @param {Object} response
     */
    setPublishedData: function(response) {
      if (this.publicationStatus === PublicationStatus.DRAFT) {
        this.addDatasetPublishedData(response)
      } else {
        this.updateDatasetPublishedData(response)
      }

      // Set locked property on dataset
      const updatedDataset = merge(this.dataset, { locked: true })
      return this.updateDataset(updatedDataset)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.sharing-info {
  color: #000;
  margin-bottom: 16px;
}

.publishing {
  margin-top: 3px;
}

.heading {
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: $gray_6;
  &.publication {
    margin-top: 33px;
  }
}

.sharing-blurb {
  color: #000;
  margin-top: 11px;
  height: 32px;
  font-size: 14px;
  margin-bottom: -8px;
}

.sharing-status {
  align-items: center;
  display: flex;
  .icon-status {
    margin-right: 8px;
  }
  p {
    margin-right: 4px;
    margin-top: 4px;
  }
}

.discover-link {
  margin-top: -4px;
  text-decoration: underline;
  margin-left: 8px;
}

.published-btn-wrap {
  align-items: center;
  display: flex;
  .bf-button:first-child {
    margin-right: 16px;
  }
}

#connect-orcid-button {
  border: 1px solid #d3d3d3;
  padding: 0.3em;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 1px 1px 3px #999;
  cursor: pointer;
  color: #999;
  font-weight: bold;
  font-size: 0.8em;
  line-height: 24px;
  vertical-align: middle;
}

#connect-orcid-button:hover {
  border: 1px solid #338caf;
  color: #338caf;
}

#orcid-id-icon {
  display: block;
  margin: 0 0.5em 0 0;
  padding: 0;
  float: left;
}
</style>
