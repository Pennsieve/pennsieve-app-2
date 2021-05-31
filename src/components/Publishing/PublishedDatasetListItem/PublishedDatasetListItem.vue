<template>
  <div class="published-dataset-list-item">
    <el-row
      type="flex"
      :gutter="32"
    >
      <el-col :sm="8">
        <div class="dataset-info">
          <img
            :src="datasetBanner"
            :alt="datasetBannerAlt"
            class="bf-dataset-list-item-banner-image mr-16"
          >
          <div>
            <h2 v-if="userHasAccessToPublishedDataset">
              <router-link :to="datasetLink">
                <svg-icon
                  v-if="datasetLocked"
                  color="#71747C"
                  name="icon-lock-filled"
                  height="16"
                  width="16"
                />
                {{ datasetName }}
              </router-link>
            </h2>
            <h2 v-else>
              {{ datasetName }}
            </h2>
            <p class="dataset-meta">
              Submitted by
              <strong>{{ owner }}</strong>
            </p>
            <p class="dataset-meta">
              Submitted on
              <strong>{{ updated }}</strong>
            </p>
            <p
              v-if="isEmbargo"
              class="dataset-meta"
            >
              Publish on <strong>{{ embargoReleaseDate }}</strong>
            </p>
          </div>
        </div>
      </el-col>
      <el-col :sm="4">
        <div class="bf-dataset-list-item-storage">
          <p class="bf-dataset-list-item-stat">
            <strong class="col-label">
              {{ storage }}
            </strong>
            Storage
          </p>
        </div>
      </el-col>

      <el-col
        :sm="4"
      >
        <div
          class="bf-dataset-list-item-storage"
        >
          <p class="bf-dataset-list-item-stat">
            <strong class="col-label publication-type">
              {{ publicationType }}
            </strong>
            Request Type
          </p>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="bf-dataset-list-item-stat-align">
          <div
            class="dataset-actions"
          >
            <publishing-dataset-list-item-actions
              :dataset="dataset"
              :dataset-link="datasetLink"
              :is-user-publisher="isUserPublisher"
              :is-published-tab="isPublishedTab"
              :dataset-publication-status="datasetPublicationStatus"
              :dataset-publication-type="publicationType"
            />
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row v-if="[PublicationStatus.ACCEPTED, PublicationStatus.FAILED].includes(datasetPublicationStatus)">
      <el-col :span="24">
        <div class="publishing-info">
          <template v-if="datasetPublicationStatus === PublicationStatus.FAILED">
            <div class="error-notice mb-8">
              <div class="error-notice-text">
                <div class="mb-4 error-notice-icon-line">
                  <svg-icon
                    color="#e94b4b"
                    icon="icon-warning-circle"
                    height="20"
                    width="20"
                  />
                  <p class="ml-8">
                    We encountered an issue trying to publish this dataset.
                  </p>
                </div>
                <p>
                  The Publishing team is made aware and will try again or cancel.
                </p>
              </div>
            </div>
          </template>

          <div
            v-if="datasetPublicationStatus === PublicationStatus.ACCEPTED"
            class="publishing-notice mb-8"
          >
            <div class="publishing-notice-icon-line">
              <bf-icon-waiting />
              <p class="ml-8">
                <template v-if="dataset.publication.type === PublicationType.EMBARGO">
                  Creating Embargoed Dataset
                </template>
                <template v-else>
                  Publishing to Pennsieve Discover
                </template>
              </p>
            </div>
            <p>Publishing times can vary based on the size of your dataset.</p>
            <p>Your dataset will remain locked until publishing has completed.</p>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { find, path, pathOr, propEq } from 'ramda'
import { mapGetters, mapState } from 'vuex'
import BfIconWaiting from '@/components/shared/bf-waiting-icon/bf-waiting-icon.vue'

import BfStorageMetricsMixin from '@/mixins/bf-storage-metrics'
import FormatDate from '@/mixins/format-date'
import DatasetPublishedData from '@/mixins/dataset-published-data'
import Request from '@/mixins/request'
import { PublicationStatus, PublicationTabs, PublicationType, DiscoverPublicationStatus } from '@/utils/constants'
import PublishingDatasetListItemActions from '../PublishingDatasetListItemActions'

export default {
  name: 'PublishedDatasetListItem',

  components: {
    PublishingDatasetListItemActions,
    BfIconWaiting
  },

  mixins: [
    BfStorageMetricsMixin,
    FormatDate,
    DatasetPublishedData,
    Request
  ],

  props: {
    dataset: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters([
      'isUserPublisher',
      'hasFeature',
      'datasetLocked',
      'getOrgMember'
    ]),

    ...mapState([
      'profile',
      'activeOrganization',
      'config',
      'userToken',
      'orgDatasetStatuses'
    ]),

    PublicationStatus: function() {
      return PublicationStatus
    },

    PublicationType: function() {
      return PublicationType
    },

    /**
     * Return constant object containing
     * publication statuses from discover
     * @returns {Object}
     */
    DiscoverPublicationStatus: function() {
      return DiscoverPublicationStatus
    },

    /**
     * Computes whether the user has access to a
     * PUBLISHED dataset
     * @returns {Boolean}
     */
    userHasAccessToPublishedDataset: function() {
      return !!this.dataset.content
    },

    /**
     * Compute dataset's publicaton status
     * @returns {String}
     */
    datasetPublicationStatus: function() {
      return this.isPublishedTab
      ? this.DiscoverPublicationStatus[this.dataset.status || '']
      : pathOr('', ['publication', 'status'], this.dataset)
    },

    /**
     * Compute dataset storage display
     * @returns {String}
     */
    storage: function() {
      return this.formatMetric(
        this.isPublishedTab
        ? this.dataset.size || ''
        : this.dataset.storage || ''
      )
    },

    /**
     * Compute formatted timestamp
     * @returns {String}
     */
    updated: function() {
      return this.formatDate(
        this.isPublishedTab
        ? this.dataset.revisedAt || this.dataset.versionPublishedAt || ''
        : pathOr('', ['content', 'updatedAt'], this.dataset)
      )
    },

    /**
     * Compute owner of dataset
     * @returns {String}
     */
    owner: function() {
      const ownerId = this.dataset.owner || ''
      if (ownerId) {
        return this.getOwnerName(ownerId)
      } else {
        const firstName = this.dataset.ownerFirstName || ''
        const lastName = this.dataset.ownerLastName || ''
        return `${firstName} ${lastName}`
      }
    },

    /**
     * Get dataset link
     * @returns {Object}
     */
    datasetLink: function() {
      const datasetId = path(['content', 'id'], this.dataset)
      const routeName = 'dataset-overview'

      const link = { name: routeName, params: { datasetId }}

      return datasetId ? link : {}
    },


    /**
     * Computed property to display dataset's banner
     * image or placeholder banner image
     * @returns {String}
     */
    datasetBanner: function() {
      return (this.isPublishedTab
      ? this.dataset.banner
      : this.dataset.bannerPresignedUrl)
      || '/static/images/banner-placeholder.jpg'
    },

    /**
     * Compute banner image alt text
     * @returns {String}
     */
    datasetBannerAlt: function() {
      return `Banner image for ${this.datasetName}`
    },

    isPublishedTab: function() {
      return this.$route.name === PublicationTabs.PUBLISHED
    },

    /**
     * Compute embargo release date
     * @returns {String}
     */
    embargoReleaseDate: function() {
      const embargoReleaseDate = pathOr('', ['publication', 'embargoReleaseDate'], this.dataset)
      || this.dataset.embargoReleaseDate
      || ''
      return this.formatDate(embargoReleaseDate)
    },

    /**
     * Compute the dataset name
     * @returns {String}
     */
    datasetName: function() {
      return this.isPublishedTab
      ? this.dataset.name || ''
      : pathOr('', ['content', 'name'], this.dataset)
    },

    /**
     * Compute the publication type
     * @returns {String}
     */
    publicationType: function() {
      return this.isPublishedTab
      ? this.dataset.embargo
        ? PublicationType.EMBARGO
        : PublicationType.PUBLICATION
      : pathOr('', ['publication', 'type'], this.dataset)
    },

    /**
     * Compute whether the dataset is
     * embargoed
     * @returns {Boolean}
     */
    isEmbargo: function() {
      return this.publicationType == PublicationType.EMBARGO
    }
  },

  methods: {
    getOwnerName: function(ownerId) {
      if (ownerId === this.profile.id || '') {
        return 'You'
      } else {
        const owner = this.getOrgMember(ownerId)
        const firstName = owner.firstName || ''
        const lastName = owner.lastName || ''
        return `${firstName} ${lastName}`
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/_variables.scss';
@import '../../../assets/_list-item.scss';

.list-item-status-wrapper {
  color: $gray_4;
  font-size: 12px;
  line-height: 18px;
  font-weight: normal;
  border-radius: 3px;
  width: 160px;
  padding-top: 3px;
  height: fit-content;

  p {
    margin: 0 0 2px !important;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left: 20px;
    max-width: 134px;
  }
}
.publishing-notice {
  display: flex;
  flex-direction: column;
  .publishing-notice-icon-line {
    display: flex;
    :first-child {
      margin-top: -1px;
    }
  }
}

.dataset-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  .secondary {
    margin-left: 16px;
  }
}

.publishing-info {
  margin: 24px 0 0 104px;
}
.error-notice {
  align-items: center;
  display: flex;
}

.error-notice-text {
  display: flex;
  flex-direction: column;
  .error-notice-icon-line {
    display: flex;
    :first-child {
      margin-top: -1px;
    }
  }
}

.publication-type {
  text-transform: capitalize;
}

@media only screen and (max-width: 1200px){
  .list-item-status-wrapper {
    width: 70px;
    height: fit-content;
    padding-left: 5px;

    p {
      word-break: break-word;
    }
  }
}
</style>
