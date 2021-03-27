<template>
  <div class="dataset-settings-doi">
    <h4>
      DataCite DOI
    </h4>
    <p class="mb-16">
      Digital Object Identifiers allow you to reference your data in publications. DOIs make it easy for anyone to find your data.
    </p>
    <div class="doi-label">
      <bf-button
        v-if="!hasDoi"
        class="secondary"
        @click="requestDraftDoi"
      >
        Reserve a DataCite DOI
      </bf-button>
      <strong class="label-strong">
        {{ datasetDoi.doi }}
      </strong> {{ formattedDoi }}
    </div>
  </div>
</template>

<script>
  import {
    mapActions,
    mapState
  } from 'vuex'
  import {
    pathOr
  } from 'ramda'

  import FormatDate from '@/mixins/format-date'
  import Request from '@/mixins/request'
  import BfButton from "@/components/shared/bf-button/BfButton";

  export default {
    name: 'DatasetSettingsDoi',

    components: {
      BfButton
    },

    mixins: [
      FormatDate,
      Request
    ],

    computed: {
      ...mapState([
        'config',
        'datasetDoi',
        'isLoadingDatasetDoi',
        'userToken',
        'dataset'
      ]),

      /**
       * Compute URL for DOI endpoint
       * @returns {String}
       */
      doiUrl: function() {
        const datasetId = pathOr('', ['content', 'id'], this.dataset)
        return `${this.config.apiUrl}/datasets/${datasetId}/doi?api_key=${this.userToken}`
      },

      /**
       * Computes if the dataset has a DOI
       * @returns {Boolean}
       */
      hasDoi: function() {
        return Object.keys(this.datasetDoi).length
      },

      /**
       * Computes formatted DOI response
       * @returns {String}
       */
      formattedDoi: function() {
        if (this.hasDoi) {
          return ` updated on ${this.formatDate(this.datasetDoi.createdAt)}`
        }
        return ''
      }
    },

    methods: {
      ...mapActions([
        'setDatasetDoi',
        'setIsLoadingDatasetDoi'
      ]),

      /**
       * Retrieve DOI for dataset
       */
      getDoi: function() {
        if (!this.doiUrl) {
          return
        }
        this.sendXhr(this.doiUrl)
          .then(data => {
            this.doi = data
            this.isRequestingDoi = false
          })
          .catch(err => {
            this.isRequestingDoi = false
            this.handleXhrError(err)
          })
      },

      /**
       * Request Draft DOI
       */
      requestDraftDoi: function() {
        const title = pathOr('', ['content', 'name'], this.dataset)
        if (!this.doiUrl || !title) {
          return
        }

        this.setIsLoadingDatasetDoi(true)

        this.sendXhr(this.doiUrl, {
          method: 'POST',
          header: {
            Authorization: `bearer ${this.userToken}`
          },
          body: {
            title
          }
        })
          .then(response => {
            return this.setDatasetDoi(response)
          })
          .catch(err => {
            this.handleXhrError(err)
          })
          .finally(() => {
            this.setIsLoadingDatasetDoi(false)
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-loading-spinner {
    margin-top: -9px;

    .circular {
      height: 20px;
      width: 20px;
    }
  }

  p {
    color: #000;
  }

  .doi-label {
    color: #000;
  }
</style>
