<template>
  <header
    class="bf-rafter"
    :class="[
      $slots['tabs'] ? 'with-tabs' : '',
      isEditing ? 'editing' : ''
    ]"
  >
  <template
    v-if="datasetNameVisible"
    >

      <div v-if="datasetNameVisible2" class="dataset-name" >
        {{datasetNameDisplay()}}
      </div>
      <br>
       <el-dropdown
              class="dataset-status-dropdown"
              trigger="click"
              placement="bottom-start"
              @command="updateDatasetStatus"
              @visible-change="datasetFilterOpen = $event"
            >
            <button
                 class="dataset-filter-dropdown el-dropdown-link"
                 :disabled="!(getPermission('manager'))"
            >
            <span class="dataset-info">
              <div
                :style="{ 'background-color': checkStatusColor }"
                class="status-dot main-status"
                />
              <div class="dataset-status">
                {{ formatDatasetStatus }}
              </div>
            </span>
            <svg-icon
                v-if="getPermission('manager')"
                name="icon-arrow-up"
                :dir="datasetFilterArrowDir"
                height="7"
                width="7"
                color="#404554"
             />
             </button>
             <el-dropdown-menu
               slot="dropdown"
               class="bf-menu auto-height"
               :offset="14"
               :arrow-offset="150"
             >
             <el-dropdown-item
                v-for="status in filterOrgStatusList"
                :key="status.id"
                class="status-item"
                :command="getStatusCommand(status)"
              >
              <span
                  class="status-dot"
                  :style="getDotColor(status)"
              />
                {{ status.displayName }}
                <svg-icon
                    v-if="formatDatasetStatus === `${status.displayName}`"
                    icon="icon-check"
                    class="dataset-filter-status-check"
                    width="20"
                    height="20"
                />
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
  </template>
  <br>
  <br>
    <div
      class="row bf-rafter-breadcrumb"
      :class="[ this.$slots['breadcrumb'] ? 'has-breadcrumb' : 'no-breadcrumb' ]"
    >
      <slot name="breadcrumb" />
    </div>
    <div class="row main">
      <div class="col">
        <h1 v-if="title">
          {{ title }}
        </h1>

        <div
          v-if="$slots['heading']"
          class="bf-rafter-heading"
        >
          <slot name="heading" />
        </div>

        <div
          v-if="$slots['description']"
          class="bf-rafter-description"
        >
          <slot name="description" />
        </div>
      </div>
      <div
        v-if="$slots['buttons']"
        class="col bf-rafter-buttons"
      >
        <slot name="buttons" />
      </div>
    </div>

    <div
      v-if="$slots['bottom']"
      class="row bf-rafter-bottom"
    >
      <slot name="bottom" />
    </div>

    <div class="tabs-stats-wrap">
      <div
        v-if="$slots['tabs']"
        class="row bf-rafter-tabs"
      >
        <slot name="tabs" />
      </div>

      <div
        v-if="$slots['stats']"
        class="col bf-rafter-stats mb-16"
      >
        <slot name="stats" />
      </div>
    </div>
  </header>
</template>

<style lang="scss">
  @import '../../../assets/_variables.scss';
  @import '../../../assets/components/_dataset-status.scss';

  .bf-rafter {
    padding: 9px 31px 1px 31px;
    transition: .15s padding linear;
    z-index: 5;
    &.small {
      padding-top: 28px;
      h1 {
        font-size: 24px;
        line-height: 40px;
      }
    }
    &.border, &.with-tabs {
      box-shadow: 1px 1px 0 0 $gray_2;
    }
    &.with-tabs {
      padding-bottom: 0
    }
    &.editing {
      background: $gray_1;
    }
    h1 {
      margin: 0;
      font-size: 20px;
      &.flex-heading {
        align-items: center;
        display: flex;
      }
    }
    .condensed & {
      background: $white;
      box-shadow: 1px 1px 0 0 $gray_2;
      padding: 16px 32px;
      &.with-tabs {
        padding-bottom: 0;
      }
    }
    .row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .main .col {
      flex: 1;
      min-width: 0;
    }
  }
  .bf-rafter-description {
    margin-top: 8px;
    .condensed & {
      display: none;
    }
  }
  .bf-rafter-tabs {
    margin-top: 6px;
    .condensed & {
      margin-top: 8px;
    }
  }
  .bf-rafter-bottom {
    margin-top: 24px;
    .condensed & {
      margin-top: 8px;
    }
  }
  .bf-rafter-breadcrumb {
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    margin-bottom: 8px;
    min-height: 17px;
    .condensed &.no-breadcrumb {
      display: none;
    }
  }
  .bf-rafter-buttons {
    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
    .bf-button {
      margin-left: 8px !important;
      padding-top: 11px;
      padding-bottom: 11px;
    }
  }
  .tabs-stats-wrap {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
  }
  .bf-rafter-stats {
    display: flex;
  }
  .dataset-filter-status-check {
    margin: -2px 0;
    float: right;
  }
  .dataset-name {
    font-weight: bold;
    font-size: 20px;
    color: $gray_6;
    margin-left: 4px;
  }
  .dataset-status {
    color: $gray_4;
    font-size: 12px;
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    margin-right: 5px;
    margin-left: 4px;
  }
  .dataset-info {
    display: flex;
    align-items: center;
    .dataset {
      color: $gray_4;
      font-size: 12px;
    }
    .dataset-filter-dropdown {
      display: flex;
      align-items: center;
    }
  }

</style>

<script>
import  { mapState, mapGetters, mapActions } from 'vuex';
import { path, pathOr } from 'ramda'
import EventBus from '@/utils/event-bus'
import Request from '../../../mixins/request/index'
  export default {
    name: 'BfRafter',

    props: {
      title: {
        type: String,
        default: ''
      },
      size: {
        type: String,
        default: ''
      },
      isEditing: {
        type: Boolean,
        default: false
      }
    },

  mixins: [Request],

  data: function() {
    return {
      datasetNameTruncated: false,
      datasetname: '',
      datasetFilterOpen: false,
    }
  }

    ,
  computed: {
    ...mapState(['dataset', 'orgDatasetStatuses','datasetRafterVisStatus','datasetRafterVisStatus2']),

    ...mapGetters([
      'getPermission',
      'userToken',
      'config'
    ]),

    /**
     * Filters empty status names from orgDatasetStatuses
     * @returns {Array}
     */
    filterOrgStatusList: function() {
      return this.orgDatasetStatuses.filter(status => {
        return status.displayName !== ''
    })
  },
  /**
   * Returns the dataset status displayName
   * @returns {String}
   */
  formatDatasetStatus: function() {
    return pathOr('', ['status', 'displayName'], this.dataset)
  },

    datasetNameDisplay: function() {
      const name = this.datasetName
      this.toggleDatasetVis(true);
      this.datasetNameTruncated = false

      return name
    },

    getDatasetUpdateUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const datasetId = path(['content', 'id'], this.dataset)

      if (!url) {
        return ''
      }

      return `${url}/datasets/${datasetId}?api_key=${this.userToken}`
    },
    /**
     * Returns dataset filter arrow direction
     * @returns {String}
     */
    datasetFilterArrowDir: function() {
      return this.datasetFilterOpen ? 'up' : 'down'
    },
    /**
     * Returns color for dataset status
     * @returns {String}
     */
    checkStatusColor: function() {
      return pathOr('', ['status', 'color'], this.dataset)
    },

    datasetNameVisible: function() {
      console.log(this.datasetNameDisplay())
      if (this.datasetRafterVisStatus){
        console.log("IS THE DATASET NAME VISIBLE?", this.datasetRafterVisStatus)
        return true
      }
      else {
        console.log("IS THE DATASET NAME VISIBLE?", this.datasetRafterVisStatus)
        return false
      }
    },

    datasetNameVisible2: function() {
      if (this.datasetRafterVisStatus2) {
        return true
      }
      else {
        return false
      }
    }
  },

  methods: {
    ...mapActions([
      'updateDataset',
      'setDataset',
      'toggleDatasetVis'
    ]),


    datasetName: function() {
      return pathOr('', ['content', 'name'], this.dataset)
    },
    /**
     * Returns dataset status name based on command selection in menu
     * @returns {String}
     */
    getStatusCommand: function(status) {
      return status.displayName
    },
    /**
     * Returns dataset status dot styling based on status color
     * @returns {Object}
     */
    getDotColor: function(status) {
      const obj = {
        backgroundColor: `${status.color}`
      }

      return obj
    },
    /**
     * Updates a dataset's status based on
     * status menu selection
     * @param {String}
     */
    updateDatasetStatus: function(command) {
      const status = this.orgDatasetStatuses.find(status => {
        return status.displayName === command
      })

      if (!this.getDatasetUpdateUrl) {
        return
      }

      // API request to update the status
      this.sendXhr(this.getDatasetUpdateUrl, {
        method: 'PUT',
        body: {
          status: status.name
        }
      })
        .then(response => {
          EventBus.$emit('toast', {
            detail: {
              msg: 'Your status has been saved'
            }
          })

          this.updateDataset(response)
          this.setDataset(response)

        })
        .catch(this.handleXhrError.bind(this))
    }
  }
  }
</script>
