<template>
  <bf-page class="dataset-overview">
    <locked-banner
      slot="banner"
    />
    <bf-rafter slot="heading">
      <h1
        slot="heading"
        class="flex-heading"
      >
        Dataset Overview
      </h1>
      <div
        v-if="getPermission('manager')"
        slot="buttons"
        class="buttons"
      >
        <router-link
          class="edit-link"
          :to="{
            name: 'dataset-settings',
          }"
        >
          <bf-button
            class="primary"
            :disabled="datasetLocked"
          >
            Update Information
          </bf-button>
        </router-link>
      </div>
    </bf-rafter>
    <bf-stage slot="stage">
      <div class="dataset-heading">
        <dataset-banner
          empty-state-text="Add a banner image."
          @click.native="goToBanner"
        />

        <div class="dataset-heading-info">
          <h1 class="mb-8">
            {{ datasetName }}
          </h1>

          <div class="dataset-owners">
            <div
              v-for="(contributor, idx) in datasetContributorsList"
              :key="contributor.id"
              class="contributor-item-wrap"
            >
              <contributor-item :contributor="contributor" />
              <template v-if="idx < datasetContributorsList.length - 1">
                ,
              </template>
            </div>
          </div>

          <!-- eslint-disable vue/no-v-html -->
          <!-- $sanitize will sanitize the HTML injected -->
          <div
            class="dataset-description mb-24"
            v-html="$sanitize(datasetSubtitle)"
          />

          <div class="dataset-heading-meta">
            Last updated on <b>{{ lastUpdatedDate }}</b>
            <template v-if="isPublished && publishedCount > 0">
              (<a
                :href="discoverLink"
                target="_blank"
              >
                Version {{ publishedVersionLabel }}
              </a>)
            </template>

            <div class="sharing-status">

              Last published on <b>{{ publishedDate }}</b>
              <a
                  target="_blank"
                  :href="discoverLink"
                  class="discover-link"
                >
                  View on Discover
                </a>
            </div>
            <div class="sharing-status">
              Published dataset DOI: <a :href="doiUrl">{{datasetDoi.doi}}</a>
            </div>

<!--            <div class="dataset-corresponding-contributor">-->
<!--              <p>Dataset owner:</p>-->
<!--              <contributor-item :contributor="correspondingContributor" />-->
<!--            </div>-->

            <div>

            </div>
          </div>
        </div>
      </div>

      <div class="dataset-info-stats mb-32">
        <div class="dataset-info-stat">
          <svg-icon
            name="icon-files"
            height="20"
            width="20"
          />
          <div>
            <strong>{{ packageTypeCount }}</strong>
            <router-link :to="{ name: 'dataset-files' }">
              Files
            </router-link>
          </div>
        </div>
        <div class="dataset-info-stat">
          <svg-icon
            name="icon-storage"
            height="20"
            width="20"
          />
          <div>
            <strong>{{ datasetStorage.number }}</strong>
            {{ datasetStorage.unit }}
          </div>
        </div>
        <div class="dataset-info-stat">
          <svg-icon
            name="icon-document"
            height="20"
            width="20"
          />
          <div>
            <strong>{{ totalRecordsCount.toLocaleString('en') }}</strong>
            <router-link :to="{ name: 'records-overview' }">
              {{ totalRecordsCountLabel }}
            </router-link>
          </div>
        </div>
        <div class="dataset-info-stat">
          <svg-icon
            name="icon-license"
            height="20"
            width="20"
          />
          <div>
            <router-link
              :to="{
                name: 'dataset-settings',
                query: {
                  focusInput: 'inputLicense'
                }
              }"
            >
              {{ datasetLicense }}
            </router-link>
          </div>
        </div>
      </div>

      <data-card
        v-if="isChecklistDimissed === false && hasManagerPermissions"
        class="mb-32 grey compact"
        title="Dataset Publishing Checklist:"
        :padding="false"
      >
        <button
          slot="title-aux"
          class="linked"
          @click="dismissDatasetChecklist"
        >
          Dismiss
        </button>

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
            name: 'dataset-settings',
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
            name: 'publishing-settings',
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
            name: 'publishing-settings',
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

      <data-card
        ref="descriptionDataCard"
        class="grey compact"
        title="Description"
        :is-expandable="true"
        :padding="false"
      >
        <template slot="title-aux">
          <button
            v-if="isEditingMarkdown"
            class="linked mr-8"
            @click="isEditingMarkdown = false"
          >
            Cancel
          </button>
          <button
            v-if="isEditingMarkdown"
            class="linked"
            :disabled="datasetLocked"
            @click="isSavingMarkdown = true"
          >
            Save
          </button>
          <button
            v-else
            slot="title-aux"
            class="linked"
            :disabled="datasetLocked"
            @click="isEditingMarkdown = true"
          >
            Update
          </button>
        </template>
        <markdown-editor
          ref="markdownEditor"
          :value="datasetDescription"
          :is-editing="isEditingMarkdown"
          :is-saving="isSavingMarkdown"
          :empty-state="datasetDescriptionEmptyState"
          :is-loading="isLoadingDatasetDescription"
          @save="onReadmeSave"
        />
      </data-card>
    </bf-stage>
    <stale-update-dialog ref="staleUpdateDialog" />
  </bf-page>
</template>

<script>
  import {mapActions, mapGetters, mapState} from 'vuex'
  import Cookie from 'js-cookie'
  import {compose, defaultTo, head, last, pathOr, propOr, split, sum, values} from 'ramda'

  import DatasetBanner from '../DatasetBanner/DatasetBanner.vue'
  import DataCard from '../../shared/DataCard/DataCard.vue'
  import ChecklistItem from '../../shared/ChecklistItem/ChecklistItem.vue'
  import MarkdownEditor from '../../shared/MarkdownEditor/MarkdownEditor.vue'

  import BfStorageMetrics from '../../../mixins/bf-storage-metrics/index'
  import FormatDate from '../../../mixins/format-date/index'
  import Request from '../../../mixins/request'
  import DatasetPublishedData from '../../../mixins/dataset-published-data'

  import datasetDescriptionEmptyState from './dataset-description-empty-state'
  import ContributorItem from '../ContributorItem/ContributorItem.vue'
  import BfRafter from "../../shared/bf-rafter/BfRafter";
  import BfButton from "../../shared/bf-button/BfButton";
  import StaleUpdateDialog from "../stale-update-dialog/StaleUpdateDialog";
  import LockedBanner from '../LockedBanner/LockedBanner';

  const replaceLineBreaks = str => {
  return Object.prototype.toString.call(str) === '[object String]'
    ? str.replace(/(\r\n|\n|\r)/g, '<br>')
    : str
}

const getDismissedDatasetChecklist = () =>
  compose(
    JSON.parse,
    defaultTo('[]')
  )(Cookie.get('dismissedDatasetChecklist'))

export default {
  name: 'DatasetOverview',

  components: {
    LockedBanner,
    DatasetBanner,
    ChecklistItem,
    DataCard,
    MarkdownEditor,
    ContributorItem,
    BfRafter,
    BfButton,
    StaleUpdateDialog
  },

  mixins: [BfStorageMetrics, FormatDate, Request, DatasetPublishedData],

  props: {
    datasetId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      isChecklistDimissed: false,
      isEditingMarkdown: false,
      isSavingMarkdown: false,
      datasetDescriptionEmptyState,
      packageTypeCount: 0,
    }
  },

  computed: {
    ...mapGetters([
      'totalRecordsCount',
      'getPermission',
      'datasetOwner',
      'datasetOwnerHasOrcidId',
      'datasetLocked'
    ]),

    ...mapState([
      'config',
      'concepts',
      'dataset',
      'datasetBanner',
      'isLoadingDatasetBanner',
      'isDatasetOwner',
      'userToken',
      'config',
      'datasetDescription',
      'datasetDescriptionEtag',
      'datasetDoi',
      'datasetRole',
      'isLoadingDatasetDescription',
      'datasetContributors'
    ]),

    doiUrl: function(){
      return "https://doi.org/" + this.datasetDoi.doi
    },

    /**
     * Return corresponding contributor details
     * @returns {Object}
     */
    correspondingContributor: function() {
      const firstName = propOr('', 'firstName', this.datasetOwner)
      const lastName = propOr('', 'lastName', this.datasetOwner)
      const orcid = propOr({}, 'orcid', this.datasetOwner)
      const id = propOr('', 'orcid', orcid)
      return {
        firstName: firstName,
        lastName: lastName,
        orcid: id
      }
    },

    /**
     * Gets the first contributor from the list
     * @returns {String}
     */
    firstContributor: function() {
      return head(this.datasetContributors)
    },

    /**
     * Checks whether or not contributors list
     * should be condensed or not based on the number
     * of contributors in the dataset
     */
    datasetContributorsList: function() {
      return this.datasetContributors
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
     * Compute URL for total package count
     * @returns {String}
     */
    getPackageTypeCountsUrl: function() {
      return this.userToken
        ? `${this.config.apiUrl}/datasets/${
            this.datasetId
          }/packageTypeCounts?api_key=${this.userToken}`
        : ''
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

    /**
     * Compute label for version count
     * @returns {String}
     */
    publishedVersionLabel: function() {
      return propOr(1, 'publishedVersionCount', this.publishedData)
    },

    /**
     * Compute dataset name
     * @returns {String}
     */
    datasetName: function() {
      return pathOr('', ['content', 'name'], this.dataset)
    },

    /**
     * Compute dataset description including
     * adding line breaks to support multiline
     * @returns {String}
     */
    datasetSubtitle: function() {
      const description = pathOr('', ['content', 'description'], this.dataset)

      return replaceLineBreaks(description)
    },

    /**
     * Compute dataset storage
     * @returns {Object}
     */
    datasetStorage: function() {
      const storageProp = compose(
        propOr(0, 'storage'),
        defaultTo({})
      )(this.dataset)

      /* Need to return a fixed object due to
       * the default behavior of formatMetric
       */
      if (storageProp === 0) {
        return {
          number: 0,
          unit: 'KB'
        }
      }

      const storage = compose(
        split(' '),
        this.formatMetric
      )(storageProp)

      return storage.reduce((number, unit) => {
        return {
          number,
          unit
        }
      })
    },

    /**
     * Compute last updated date
     * @returns {String}
     */
    lastUpdatedDate: function() {
      const date = pathOr('', ['content', 'updatedAt'], this.dataset)
      return this.formatDate(date)
    },

    /**
     * Compute label for total records
     */
    totalRecordsCountLabel: function() {
      return this.totalRecordsCount === 1 ? 'Record' : 'Records'
    },

    /**
     * Compute the license for the dataset
     * @returns {String}
     */
    datasetLicense: function() {
      return pathOr('Add a license', ['content', 'license'], this.dataset)
    },

    /**
     * Compute URL for readme endpoint
     * @returns {String}
     */
    datasetReadmeUrl: function() {
      return this.userToken
        ? `${this.config.apiUrl}/datasets/${this.datasetId}/readme?api_key=${
            this.userToken
          }`
        : ''
    },

    /*
    *Placeholder for changelog URL function
    */
    datasetChangelogUrl: function() {
      return this.userToken
        ? `${this.config.apiUrl}/datasets/${this.datasetId}/changelog?api_key=${
            this.userToken
          }`
        : ''
    },
    /**
     * Compute dataset intId
     * @returns {Number}
     */
    datasetIntId: function() {
      return pathOr(0, ['content', 'intId'], this.dataset)
    }
  },

  watch: {
    '$route.query.editDescription': {
      handler: function(val) {
         if (val) {
        this.setEditDescription()
      }
      },
      immediate: true
    },

    getPackageTypeCountsUrl: {
      handler: function(val) {
        if (val) {
          this.getPackageTypeCounts()
        }
      },
      immediate: true
    },

    datasetIntId: {
      handler: function() {
        this.checkIfChecklistDismissed()
      },
      immediate: true
    }
  },

  mounted () {
    if (this.$route.query.editDescription) {
      this.setEditDescription()
    }
  },

  methods: {
    ...mapActions(['setDatasetDescription', 'setDatasetDescriptionEtag']),

    /**
     * Check if the dataset checklist
     * has been dismissed
     */
    checkIfChecklistDismissed: function() {
      const dismissedDatasetChecklist = getDismissedDatasetChecklist()
      this.isChecklistDimissed =
        dismissedDatasetChecklist.indexOf(this.datasetIntId) >= 0
    },

    /**
     * Get package type counts
     */
    getPackageTypeCounts: function() {
      this.packageTypeCount = 0
      this.sendXhr(this.getPackageTypeCountsUrl)
        .then(response => {
          this.packageTypeCount = compose(
            sum,
            values,
            defaultTo({})
          )(response)
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Set edit description and scroll to description
     */
    setEditDescription: function() {
      this.isEditingMarkdown = true
      this.$nextTick(() => {
        this.$refs.descriptionDataCard.$el.scrollIntoView()
        this.$refs.markdownEditor.focus()
      })
    },

    /**
     * Compute checklist icon based on prop
     * @param {Boolean} prop
     * @returns {String}
     */
    computeChecklistIcon: function(prop = false) {
      return prop ? 'icon-done-check-circle' : 'icon-info'
    },

    /**
     * Dismiss the checklist by setting a cookie
     */
    dismissDatasetChecklist: function() {
      const dismissedDatasetChecklist = getDismissedDatasetChecklist()
      dismissedDatasetChecklist.push(this.datasetIntId)

      Cookie.set('dismissedDatasetChecklist', dismissedDatasetChecklist)

      this.isChecklistDimissed = true
    },

    /**
     * On reaadme save, emitted from the MarkdownEditor
     * Make a request to the API to save the readme
     * @params {String} markdown
     */
    onReadmeSave: function(markdown) {
      fetch(this.datasetReadmeUrl, {
        body: JSON.stringify({
          readme: markdown
        }),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': this.datasetDescriptionEtag,
        }
      })
        .then(response => {
          if (response.ok) {
            this.setDatasetDescriptionEtag(response.headers.get('etag'))
            this.setDatasetDescription(markdown).finally(() => {
              this.isSavingMarkdown = false
              this.isEditingMarkdown = false
            })
          } else if (response.status === 412) {
            this.isSavingMarkdown = false
            this.$refs.staleUpdateDialog.dialogVisible = true
          } else {
            throw response
          }
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * On changelog save funciton placeholder, emitted from committing publish (MUST TAKE INTO ACCOUNT VERSION)
     * Make a request to the API to save the changelog
     * @params {String} markdown
     */
    onPublishSaveChangelog: function(input) {
      fetch(this.datasetChangelogUrl, {
        body: JSON.stringify({
          changelog: input
        }),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': this.datasetChangelog,
        }
      })
        .then(response => {
          if (response.ok) {
            //need to investigate this function: setDatasetDescriptionEtag
            this.setDatasetChangelogEtag(response.headers.get('etag'))
            this.setDatasetChangelog(input).finally(() => {
              this.isSavingChangelog = false
              this.isEditingChangelog = false
            })
          } else if (response.status === 412) {
            this.isSavingChangelog = false
            this.$refs.staleUpdateDialog.dialogVisible = true
          } else {
            throw response
          }
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Go to the banner image section of the settings page
     */
    goToBanner: function() {
      if (this.hasManagerPermissions) {
        this.$router.push({
          name: 'dataset-settings',
          query: {
            focusInput: 'bannerImage'
          }
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/_variables';

.dataset-overview {
  background: #fff;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
}

.dataset-heading {
  display: flex;
  margin-bottom: 32px;
}

.dataset-banner {
  cursor: pointer;
  height: 256px;
  margin-right: 24px;
  width: 256px;
}

.dataset-description {
  font-size: 16px;
  line-height: 24px;
}

.dataset-heading-info {
  flex: 1;
}

.dataset-heading-meta {
  font-size: 14px;
  font-weight: normal;
  line-height: 24px;
  font-weight: normal;
  color: $gray_6;

  a {
    color: $gray_6;
    text-decoration: underline;
  }
}

.dataset-corresponding-contributor {
  display: flex;
  flex-direction: row;
  color: $gray_6;

  p {
    margin-right: 7px;
  }
}

.dataset-info-stats {
  border-bottom: 1px solid $gray_2;
  border-top: 1px solid $gray_2;
  display: flex;
  padding: 16px;
  justify-content: space-between;
}
.dataset-info-stat {
  align-items: center;
  display: flex;
  .svg-icon {
    color: #000;
    margin-right: 8px;
  }
}

.dataset-owners {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  color: $gray_5;
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 13px;
  .contributor-item-wrap {
    display: inline-flex;
    margin-right: 4px;
  }

  .contributors-button {
    height: 16px;
    width: 16px;
    border-radius: 2px;
    background-color: #dadada;
    margin: 0 6px;

    &:focus {
      background-color: #b6b7ba;
    }

    .button-text {
      position: relative;
      bottom: 5px;
    }
  }

  .edit-link {
    text-decoration: underline;
    margin-left: 5px;
  }
}
</style>
