<template>
  <div class="proposed-dataset-list-item">
    <el-row
      type="flex"
      :gutter="32"
    >
      <el-col :sm="8">
        <div class="dataset-info">
          <div>
            <h2>
              <a
                href="#"
                @click.prevent="triggerRequest(DatasetProposalAction.VIEW)"
              >
                {{ proposalName }}
              </a>
            </h2>
            <p class="dataset-meta">
              Submitted by
              <strong>{{ owner }}</strong>
            </p>
            <p class="dataset-meta">
              Submitted on
              <strong>{{ updated }}</strong>
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

      <el-col :span="2">
        <div class="bf-dataset-list-item-stat-align">
          <div
            class="dataset-actions"
          >
            <p>
              <a
                href="#"
                @click.prevent="triggerRequest(DatasetProposalAction.ACCEPT)"
              >
                Accept
              </a>
            </p>
            <p>
              <a
                href="#"
                @click.prevent="triggerRequest(DatasetProposalAction.REJECT)"
              >
                Reject
              </a>
            </p>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {pathOr} from "ramda";
import FormatDate from '@/mixins/format-date'
import { DatasetProposalAction } from '@/utils/constants';

export default {
  name: 'PublishingProposalsListItem',

  mixins: [
    FormatDate
  ],

  props: {
    proposal: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    /**
     * Compute title of dataset proposl
     */
    proposalName: function() {
      return this.proposal.name
    },
    /**
     * Compute formatted timestamp
     * @returns {String}
     */
    updated: function() {
      let epochSeconds = 0
      if (this.proposal.submittedAt) {
        epochSeconds = this.proposal.submittedAt
      } else {
        epochSeconds = this.proposal.updatedAt
      }
      let isoTimestamp = this.epochToISO(epochSeconds)
      return this.formatDate(isoTimestamp)
    },
    /**
     * Compute owner of dataset
     * @returns {String}
     */
    owner: function() {
      return this.proposal.ownerName
    },

    storage: function() { return 0},

    publicationType: function() {return "proposal"},

    DatasetProposalAction: function() {
      return DatasetProposalAction
    },
  },

  methods: {
    epochToISO: function(seconds) {
      let d = new Date(0)
      d.setUTCSeconds(seconds)
      return d.toISOString()
    },

    triggerRequest: function(request) {
      console.log(`PublishingProposalListItem::triggerRequest() request: ${request}`)
      this.$emit(request, this.proposal)
    },

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
