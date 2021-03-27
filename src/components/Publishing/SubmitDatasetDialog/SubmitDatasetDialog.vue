<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="resetDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Submit a Dataset for Review"
    />

    <dialog-body>
      <p>
        Your dataset will be submitted for review to the Publishers within your organization. While under review, the dataset will become locked until it has either been approved or rejected.
      </p>
      <el-checkbox
        v-model="isAgreementChecked"
        class="mb-16"
      >
        I understand that submitting for review will lock this dataset.
      </el-checkbox>
      <el-checkbox
        ref="checkboxEmbargo"
        v-model="isEmbargoed"
        :disabled="isEmbargoedDisabled"
        class="long-label"
      >
        Request dataset to be placed under embargo and not <br>be made public immediately
        <span class="help-link">
          (
          <a
            href="https://help.blackfynn.com/en/articles/4211347"
            target="_blank"
          >
            what is this?
          </a>
          )
        </span>
      </el-checkbox>

      <div
        v-if="isEmbargoed"
        class="mt-16"
      >
        <div
          class="mb-8"
        >
          <label
            for="embargoReleaseDate"
          >
            When will this dataset become publicly available?
          </label>
        </div>
        <el-date-picker
          v-model="embargoReleaseDate"
          type="date"
          name="embargoReleaseDate"
          format="M/d/yyyy"
          value-format="yyyy-MM-dd"
          placeholder="Select a date"
          :picker-options="pickerOptions"
        />
      </div>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="close"
      >
        Cancel
      </bf-button>
      <bf-button
        processing-text="Submitting"
        :disabled="isCheckboxDisabled"
        :processing="isSubmitting"
        @click="submitDataset"
      >
        Submit
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import moment from 'moment'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

import Request from '@/mixins/request/index'
import { PublicationStatus } from '@/utils/constants'
import EventBus from '@/utils/event-bus'

const getPublicationType = (isEmbargoed) => {
  return isEmbargoed ? 'embargo'
    : 'publication'
}
export default {
  name: 'SubmitDatasetDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  mixins: [
    Request
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    datasetId: {
      type: String,
      default: ''
    }
  },

  data: function() {
    return {
      datasets: [],
      selectedDataset: {},
      isLoadingDatasets: false,
      isAgreementChecked: false,
      isSubmitting: false,
      isEmbargoed: false,
      embargoReleaseDate: '',
      pickerOptions: {
        disabledDate: (date) => {
          return this.computeIsDisabledDate(date)
        }
      }
    }
  },

  computed: {
    ...mapState([
      'config',
      'userToken',
      'dataset'
    ]),

    /**
     * Compute if the submit button is disabled
     * based on if the user selected a dataset and checked the checkbox
     * @returns {Boolean}
     */
    isCheckboxDisabled: function() {
      const basicRequirements = Object.keys(this.dataset).length === 0 || !this.isAgreementChecked
      return this.isEmbargoed
        ? !this.embargoReleaseDate
        : basicRequirements
    },

    /**
     * compute whether this dataset has been published, and thus can be revised
     * @returns {Boolean}
     */
    isRevisable: function() {
      return Boolean(this.selectedDataset.publication
        && this.selectedDataset.publication.publishedDataset
        && this.selectedDataset.publication.type === 'publication')
    },

    /**
     * Compute if the dataset is an embargoed dataset
     * @returns {Boolean}
     */
    isEmbargoedDataset: function() {
      return Boolean(this.selectedDataset.publication
        && this.selectedDataset.publication.publishedDataset
        && this.selectedDataset.publication.type === 'embargo')
    },

    /**
     * Compute if the dataset has been previously published
     * @returns {Boolean}
     */
    isCurrentlyPublished: function() {
      return Boolean(this.selectedDataset.publication
            && this.selectedDataset.publication.publishedDataset
            && this.selectedDataset.publication.type !== 'removal')
    },

    /**
     * Compute if the embargo checkbox is disabled
     * @returns {Boolean}
     */
    isEmbargoedDisabled: function() {
      return this.isEmbargoedDataset || this.isCurrentlyPublished
    }
  },

  watch: {
    /**
     * Watches visible value
     * @param {Boolean} visible
     */
    visible: function(visible) {
      if (visible) {
        this.getDatasets()
        this.isAgreementChecked = false
        this.isEmbargoed = false
        this.embargoReleaseDate = ''
      }
    },

    /**
     * Watches request_id query param
     * @param {String} val
     */
    '$route.query.request_id': {
      handler: function(val) {
        if (val) {
          this.$emit('update:visible', true)
        }
      },
      immediate: true
    },

    /**
     * Watch if the dataset is an embargoed dataset already, and check the box
     * while disallowing the user to uncheck it. This will ensure that the
     * `publicationType` is set to `embargo` on the request.
     * @param {Boolean} val
     */
    isEmbargoedDataset: function(val) {
      this.isEmbargoed = val
    },
  },

  methods: {
    ...mapActions(['updateDataset']),
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
    },

    /**
     * Compute getDatasets url
     * @returns {String}
     */
    getDatasetsUrl: function() {
      return `${this.config.apiUrl
      }/datasets/paginated?api_key=${this.userToken
      }&limit=10000&onlyMyDatasets=true&includePublishedDataset=true&canPublish=true`
    },

    /**
     * Get all datasets
     */
    getDatasets: function() {
      this.selectedDataset = {}
      this.isLoadingDatasets = true

      /*
       * High limit for now as discussed during the kickoff.
       * Recommended: Store the limit and check the `totalCount` that
       * returns from the request. If this is higher than the limit,
       * request again at the correct offset
       */
      this.sendXhr(this.getDatasetsUrl())
        .then(response => {
          this.datasets = response.datasets
          // Check if the user pre-selected a dataset
          if (this.$route.query.request_id) {
            // Find the dataset requested in the response and set it
            const selectedDataset = response.datasets.find(dataset => {
              return dataset.content.id === this.$route.query.request_id
            })
            this.selectedDataset = selectedDataset

            // Remove the query param in the URL
            this.$router.replace({
              query: {}
            })
          } else {
            // this is coming from the settings page
            this.selectedDataset = this.dataset
          }
        })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {
          this.isLoadingDatasets = false
        })
    },

    /**
     * Reset values of the dialog
     */
    resetDialog: function() {
      this.selectedDataset = {}
      this.isAgreementChecked = false
      this.embargoReleaseDate = ''
    },

    /**
     * Submit dataset for publication
     */
    submitDataset: function() {
      const id = this.datasetId
        ? this.datasetId
        : (this.selectedDataset.content ? this.selectedDataset.content.id : '')

      const publicationType = getPublicationType(this.isEmbargoed)

      if (id) {
        this.isSubmitting = true
        const url = `${this.config.apiUrl
          }/datasets/${id
          }/publication/request?api_key=${this.userToken
          }&publicationType=${publicationType
          }&embargoReleaseDate=${this.embargoReleaseDate}`
        this.sendXhr(url, { method: 'POST' })
          .then(() => {

            const updatedPublicationState = {
              ...this.dataset.publication,
              status: PublicationStatus.REQUESTED,
              type: publicationType
            }
            const updatedDataset = {
              ...this.dataset,
              publication: updatedPublicationState
            }

            this.updateDataset(updatedDataset)

            EventBus.$emit('toast', {
              detail: {
                type: 'success',
                msg: 'Your dataset has been successfully submitted for review.'
              }
            })

            this.close()
          })
          .catch(this.handleXhrError.bind(this))
          .finally(() => {
            this.isSubmitting = false
          })
      }
    },

    /**
     * Get allowed dates
     * @param {String} date
     * @returns {Boolean}
     */
    computeIsDisabledDate: function(date) {
      const isSameOrAfter = moment(date).isSameOrAfter(moment(), 'day')
      const isBeforeOneYear = moment(date).isSameOrBefore(moment().add(1, 'years'), 'day')

      const isAllowed = isSameOrAfter && isBeforeOneYear
      return !isAllowed
    }
  }
}
</script>

<style scoped>
.el-select,
.el-date-editor {
  width: 100%;
}
.help-link {
  display: inline-flex;
}
.long-label {
  margin-right: 0;
}
</style>
