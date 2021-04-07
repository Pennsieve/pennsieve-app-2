<template>
  <div class="bf-dataset-list-item">
    <el-row
      type="flex"
      :gutter="32"
    >
      <el-col :sm="14">
        <div class="dataset-info">
          <img
            :src="datasetBanner"
            :alt="datasetBannerAlt"
            class="bf-dataset-list-item-banner-image mr-16"
          >
          <div>
            <h2>
              <router-link :to="datasetLink">
                <svg-icon
                  v-if="datasetLocked"
                  color="#71747C"
                  name="icon-lock-filled"
                  height="16"
                  width="16"
                />
                {{ dataset.content.name }}
              </router-link>
            </h2>
            <div
              v-if="publishStatus === 'PUBLISH_SUCCEEDED'"
              class="publish-info mb-8"
            >
              <!-- Published to Pennsieve Discover -->
              <template v-if="dataset.publication.type !== PublicationType.EMBARGO">
                <svg-icon
                  class="mr-8"
                  name="icon-discover"
                  height="15"
                  width="15"
                />
                <p>
                  Published a copy on
                  <strong>{{ publishedDate }}</strong>
                  <a
                    :href="discoverLink"
                    target="_blank"
                  >
                    View on Discover
                  </a>
                </p>
              </template>

              <!-- Embargoed dataset -->
              <template v-if="dataset.publication.type === PublicationType.EMBARGO">
                <svg-icon
                  class="mr-8"
                  name="icon-discover"
                  height="15"
                  width="15"
                />
                <p>
                  Embargoed until
                  <strong>{{ formatDate(dataset.publication.embargoReleaseDate) }}</strong>
                </p>
              </template>
            </div>

            <div
              v-if="publishStatus === 'PUBLISH_FAILED'"
              class="publish-info mb-8 error"
            >
              <svg-icon
                class="mr-8"
                name="icon-warning-circle"
                height="15"
                width="15"
              />
              <p>
                Dataset failed to publish
                <router-link
                  v-if="isOwner"
                  :to="{
                    name: 'dataset-settings',
                    params: {
                      datasetId: dataset.content.id
                    }
                  }"
                  class="ml-8"
                >
                  Go to Settings
                </router-link>
              </p>
            </div>

            <div
              v-if="publishStatus === 'PUBLISH_IN_PROGRESS'"
              class="publish-info mb-8"
            >
              <bf-icon-waiting class="mr-8" />
              <p>
                Publishing a copy to Discover
                <a
                  href="#"
                  class="ml-8 grey-link"
                  @click.prevent="$emit('show-locked-dialog')"
                >
                  More Info
                </a>
              </p>
            </div>
            <div class="bf-dataset-list-item-info">
              <p v-if="dataset.content.description === '' && isOwner">
                <router-link
                  :to="{
                    name: 'dataset-settings',
                    params: {
                      datasetId: dataset.content.id
                    }
                  }"
                >
                  Add a description
                </router-link>
              </p>
              <p v-else>
                {{ dataset.content.description }}
              </p>
              <p class="dataset-meta">
                Owned by
                <strong>{{ owner }}</strong>
              </p>
              <p class="dataset-meta">
                Last updated
                <strong>{{ updated }}</strong>
              </p>
              <p class="dataset-meta">
                Accession Number
                <strong>{{ dataset.content.intId }}</strong>
              </p>
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :sm="4"
        class="list-item-col-spacer"
      >
        <div class="bf-dataset-list-item-status">
          <tag-pill
            :indicator-color="dataset.status.color"
            :label="formatDatasetStatus"
          />

          <tag-pill
            v-if="isPublished"
            class="mt-8"
            :has-indicator="false"
            :indicator-color="publicationStatusColor"
            :label="publicatonStatus"
          >
            <svg-icon
              slot="prefix"
              class="icon-publish-status"
              name="icon-public"
              height="12"
              width="12"
            />
          </tag-pill>
        </div>
      </el-col>
      <el-col
        :sm="6"
      >
        <div class="bf-dataset-list-item-storage">
          <p class="bf-dataset-list-item-stat">
            <strong class="col-label">
              {{ storage }}
            </strong>
            Storage
          </p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  compose,
  sum,
  values,
  find,
  propEq,
  propOr,
  path,
  pathOr
} from 'ramda'
import {
  mapActions,
  mapGetters,
  mapState
} from 'vuex'

import BfIconWaiting from '@/components/shared/bf-waiting-icon/bf-waiting-icon.vue'
import TagPill from '@/components/shared/TagPill/TagPill.vue'


import BfStorageMetricsMixin from '@/mixins/bf-storage-metrics'
import FormatDate from '@/mixins/format-date'
import DatasetPublishedData from '@/mixins/dataset-published-data'
import { PublicationType, PublicationStatus, UserFriendlyPublicationStatus, PublicationStatusColor } from '@/utils/constants'

export default {
  name: 'BfDatasetListItem',

  components: {
    BfIconWaiting,
    TagPill
  },

  mixins: [
    BfStorageMetricsMixin,
    FormatDate,
    DatasetPublishedData
  ],

  props: {
    dataset: {
      type: Object,
      default: () => ({})
    },
    showInfo: {
      type: Boolean,
      default: true
    },
  },

  computed: {
    ...mapGetters([
      'hasFeature',
    ]),

    ...mapState([
      'profile',
      'activeOrganization',
      'orgMembers',
      'config',
      'userToken',
      'orgDatasetStatuses'
    ]),

    /**
     * Returns the dataset status displayName
     * @returns {String}
     */
    formatDatasetStatus: function() {
      return pathOr('', ['status', 'displayName'], this.dataset)
    },

    /**
     * This checks for the current dataset status
     * and returns color as appropriate
     * @returns {String}
     */
    checkDatasetStatus: function() {
      const status = {
        'In Review': '#FFB000',
        'Work in Progress': '#F1F1F3',
        'No Status': '#F1F1F3',
        'Completed': '#17BB62'
      }
      return status[this.formatDatasetStatus]
    },

    /**
     * This returns the font color of the dataset status on the list
     * If WIP, text will be blue, otherwise it will be the same color
     * for the rest of the statuses
     * @returns {String}
     */
    statusFontColor: function() {
      return this.formatDatasetStatus === 'Work in Progress' ? '#2760FF' : '#404554'
    },

    /**
     * Compute if the dataset is shared
     * @returns {Boolean}
     */
    isShared: function() {
      const collaboratorCount = compose(
        sum,
        values,
        propOr({}, 'collaboratorCounts')
      )(this.dataset)

      return collaboratorCount > 0
    },

    /**
     * Compute if the current user is the
     * owner of the dataset
     * @returns {Boolean}
     */
    isOwner: function() {
      return this.dataset.owner === this.profile.id
    },

    /**
     * Compute dataset storage display
     * @returns {String}
     */
    storage: function() {
      return this.formatMetric(this.dataset.storage)
    },

    /**
     * Compute formatted timestamp
     * @returns {String}
     */
    updated: function() {
      return this.formatDate(this.dataset.content.updatedAt)
    },

    /**
     * Compute owner of dataset
     * @returns {String}
     */
    owner: function() {
      const ownerId = propOr('', 'owner', this.dataset)
      if (ownerId === propOr('', 'id', this.profile)) {
        return 'You'
      } else {
        const owner = find(propEq('id', ownerId), this.orgMembers)
        const firstName = propOr('', 'firstName', owner)
        const lastName = propOr('', 'lastName', owner)
        return `${firstName} ${lastName}`
      }
    },

    /**
     * Get dataset link
     * @returns {Object}
     */
    datasetLink: function() {
      const datasetId = path(['content', 'id'], this.dataset)
      let routeName = 'dataset-overview'

      const link = { name: routeName, params: { datasetId }}
      return datasetId ? link : ''
    },

    /**
     * Computed property to display dataset's banner
     * image or placeholder banner image
     * @returns {String}
     */
    datasetBanner: function() {
      return this.dataset.bannerPresignedUrl || '/static/images/banner-placeholder.jpg'
    },

    /**
     * Compute banner image alt text
     * @returns {String}
     */
    datasetBannerAlt: function() {
      const datasetName = pathOr('', ['content', 'name'], this.dataset)
      return `Banner image for ${datasetName}`
    },

    datasetLocked: function() {
      return Boolean(this.dataset.locked)
    },

    /**
     * Compute publication status
     * @returns {String}
     */
    publicatonStatus: function() {
      const status = this.dataset.publication.status
      if (status == PublicationStatus.REQUESTED) {
        return UserFriendlyPublicationStatus.REQUESTED
      } else if (status == PublicationStatus.COMPLETED) {
        return UserFriendlyPublicationStatus.COMPLETED
      } else if (status == PublicationStatus.REJECTED) {
        return UserFriendlyPublicationStatus.REJECTED
      } else {
        return ''
      }
    },

    /**
      * Compute publication status color
      * @returns {String}
      */
    publicationStatusColor: function() {
      const status = this.dataset.publication.status
      if (status == PublicationStatus.REQUESTED) {
        return PublicationStatusColor.REQUESTED
      } else if (status == PublicationStatus.COMPLETED) {
        return PublicationStatusColor.COMPLETED
      } else if (status == PublicationStatus.REJECTED) {
        return PublicationStatusColor.REJECTED
      } else {
        return '' //	should we return a default color here?
      }
    },


    PublicationType: function() {
      return PublicationType
    }
  },

  methods: {
    ...mapActions([
      'updateDataset'
    ]),

    /**
     * Show intercom window
     */
    showIntercom: function() {
      window.Intercom('show')
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';
@import '../../../../assets/_list-item.scss';

.list-item-status-wrapper {
  color: $glial;
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

.list-item-col-spacer {
  padding-top: 32px;
}

.icon-publish-status {
  flex-shrink: 0;
  margin: -2px 4px -2px -2px;
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
