<template>
  <div
    v-loading="isLoading"
    class="latest-records"
  >
    <div>
      <slat-info
        v-for="record in records"
        :key="record.id"
      >
        <router-link
          :to="{
            name: 'concept-instance',
            params: {
              conceptId: modelId,
              instanceId: record.id
            }
          }"
        >
          {{ displayModelTitle(record) }}
        </router-link>
        <template slot="info">
          {{ formatDate(record.createdAt) }}
        </template>
      </slat-info>
    </div>
  </div>
</template>

<script>
  import { pathOr, find, propEq, pluck, propOr } from 'ramda'
  import { mapState, mapGetters } from 'vuex'

  import SlatInfo from '../SlatInfo/SlatInfo.vue'

  import EncodeInternalFields from '../../../mixins/encode-internal-fields'
  import FormatDisplayValue from '../../datasets/explore/ConceptInstance/format-display-value'
  import FormatDate from '../../../mixins/format-date'
  import Request from '../../../mixins/request/index'

  export default {
    name: 'LatestRecords',

    components: {
      SlatInfo
    },

    mixins: [
      Request,
      FormatDisplayValue,
      FormatDate,
      EncodeInternalFields
    ],

    props: {
      modelName: String,
      limit: {
        type: Number,
        default: 5
      }
    },

    data: function() {
      return {
        records: []
      }
    },

    computed: {
      ...mapState([
        'config',
        'userToken'
      ]),

      ...mapGetters([
        'getModelByName'
      ]),

      /**
       * Compute the model ID for records that are being listed
       * @returns {String}
       */
      modelId: function() {
        const model = this.getModelByName(this.modelName)

        return propOr(this.modelName, 'id', model)
      }
    },

    watch: {
      modelName: {
        handler: function() {
          this.getRecords()
        },
        immediate: true
      }
    },

    methods: {
      /**
       * Get Records
       */
      getRecords: function() {
        if (!this.userToken) {
          return
        }

        const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
        const url = `${this.config.conceptsUrl}/datasets/${datasetId}/query/run`
        const body = {
          type: {
            concept: {
              type: this.modelName
            }
          },
          filters: [],
          joins: [],
          offset: 0,
          limit: this.limit,
          orderBy: {
            Descending: {
              field: this.prefixField('createdAt', false)
            }
          }
        }

        this.sendXhr(url, {
          header: {
            'Authorization': `bearer ${this.userToken}`
          },
          method: 'POST',
          body
        })
        .then(response => {
          this.records = Array.isArray(response) ? pluck('targetValue', response) : this.records
        })
        .catch(this.handleXhrError.bind(this))
      },

      /**
       * Display formatted model title
       * @param {Object} record
       * @returns {String}
       */
      displayModelTitle: function(record) {
        const modelTitle = find(propEq('conceptTitle', true), record.values)
        return this.formatDisplayValue(modelTitle)
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';
  .latest-records.el-loading-parent--relative {
    min-height: 100px;
  }
  .slat-info {
    border-top: 1px solid $gray_2;
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    &:first-child {
      border: none
    }
  }
  .info {
    text-align: right;
  }
</style>
