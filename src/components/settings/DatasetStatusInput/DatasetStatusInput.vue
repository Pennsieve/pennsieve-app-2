<template>
  <div class="dataset-status-input">
    <el-popover
      ref="statusMenu"
      v-model="openMenu"
      placement="right-end"
      width="200"
      trigger="click"
      popper-class="no-top-bottom-padding no-left-padding"
      :visible-arrow="false"
    >
      <div class="bf-menu">
        <ul>
          <li>
            <a
              class="bf-menu-item"
              href="#"
              @click.prevent="renameStatus"
            >
              <svg-icon
                name="icon-pencil"
                class="bf-menu-icon"
              /> Rename
            </a>
          </li>
          <li>
            <a
              v-popover:changeColor
              width="181"
              class="bf-menu-item"
              href="#"
              @click.prevent="closeMenu"
            >
              <svg-icon
                name="icon-color"
                class="bf-menu-icon"
              /> Change Color
            </a>
          </li>
          <li :class="isRemoveOptionDisabled ? 'menu-li-disabled' : ''">
            <a
              :class="isRemoveOptionDisabled ? 'bf-menu-item-disabled' : 'bf-menu-item'"
              href="#"
              @click.prevent="removeStatus"
            >
              <svg-icon
                name="icon-trash"
                class="bf-menu-icon"
              /> Delete
            </a>
          </li>
        </ul>
      </div>
    </el-popover>

    <el-popover
      ref="changeColor"
      v-model="openColorMenu"
      placement="left-start"
      width="181"
      height="94"
      popper-class="no-width left-aligned"
      trigger="click"
      :visible-arrow="false"
    >
      <swatches
        v-model="selectedColor"
        :colors="colors"
        :close-on-select="true"
        shapes="circles"
        swatch-size="16"
        :swatch-style="getSwatchStyle"
        inline
        @input="getSelectedColor"
      />
    </el-popover>

    <div
      class="settings-status-dot"
      :style="getStatusDot(status)"
    />
    <input
      ref="statusInput"
      v-model="status.displayName"
      type="text"
      maxlength="60"
      class="settings-status-color"
      :style="getStatusColor(status)"
      :placeholder="status.placeholder"
      :disabled="isDisabled"
      @keyup.enter="$event.target.blur()"
      @blur="handleEvent(status.displayName, status)"
    >
    <button
      v-show="!showReturnArrow"
      v-popover:statusMenu
      class="btn-file-menu el-dropdown-link"
      :style="buttonStyle"
    >
      <svg-icon
        name="icon-menu"
        height="14"
        width="14"
      />
    </button>
    <div
      v-show="showReturnArrow"
      class="return-btn"
    >
      <svg-icon
        name="icon-return-arrow"
        height="12"
        width="12"
      />
    </div>
    <p
      v-if="invalidInput"
      class="input-error-text"
    >
      Please enter a unique status name
    </p>

    <rename-status-dialog
      :id="status.id"
      :visible="isRenameDialogVisible"
      @rename-status="editStatusName"
      @close-dialog="closeRenameStatusDialog"
    />

    <remove-status-dialog
      :id="status.id"
      :visible="isRemoveDialogVisible"
      :replacement-name="statusReplacementName"
      @remove-status="removeStatusName"
      @close-dialog="closeRemoveStatusDialog"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { find, propEq, propOr } from 'ramda'
import EventBus from '@/utils/event-bus'
import Swatches from 'vue-swatches'
import RenameStatusDialog from '../RenameStatusDialog/RenameStatusDialog.vue'
import RemoveStatusDialog from '../RemoveStatusDialog/RemoveStatusDialog.vue'
import Request from '@/mixins/request/index'


export default {
  name: 'DatasetStatusInput',

  components: {
    Swatches,
    RenameStatusDialog,
    RemoveStatusDialog
  },

  mixins: [Request],

  props: {
    activeOrgId: {
      type: String,
      default: ''
    },

    status: {
      type: Object,
      default: () => {}
    },

    createdNewStatus: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      colors: [
        '#71747C',
        '#6D48CE',
        '#2760FF',
        '#08B3AF',
        '#17BB62',
        '#835800',
        '#FFB000',
        '#F67325',
        '#E94B4B',
        '#DE38B3'
      ],
      selectedColor: '',
      isRemoveDialogVisible: false,
      isRenameDialogVisible: false,
      statusId: 0,
      openMenu: false,
      openColorMenu: false,
      showReturnArrow: false,
      isDisabled: true,
      invalidInput: false,
      statusReplacementName: ''
    }
  },

  computed: {
    ...mapState(['config', 'userToken', 'datasets', 'orgDatasetStatuses']),

    /**
     * Disables remove menu option if there is only one status left in the list
     * @returns {Boolean}
     */
    isRemoveOptionDisabled: function() {
      return this.orgDatasetStatuses.length === 1 ? true : false
    },

    /**
     * Defines button color to use in stylesheet for button menu focus and active
     * @returns {Object}
     */
    buttonStyle() {
      return {
        '--button-color': this.status.color
      }
    },
    /**
     * Create a new dataset status option url
     * @returns {String}
     */
    createNewDatasetStatusUrl: function() {
      return `${this.config.apiUrl}/organizations/${this.activeOrgId}/dataset-status?api_key=${this.userToken}`
    },

    /**
     * Updates or deletes a dataset status option url
     * @returns {String}
     */
    modifyDatasetStatusUrl: function() {
      return `${this.config.apiUrl}/organizations/${this.activeOrgId}/dataset-status/${this.statusId}?api_key=${this.userToken}`
    },

    /**
     * Returns custom styling for color swatches
     * @returns {Object}
     */
    getSwatchStyle: function() {
      return {
        marginRight: '19px'
      }
    }
  },

  watch: {
    /**
     * Watches if this gets set to true, indicating a new status has been created
     * and we can enable it so that a user can enter a status name
     */
    createdNewStatus: {
      handler: function(val) {
        if (val && this.status.isNew) {
          this.$nextTick(() => {
            const input = this.$refs.statusInput
            this.resetDisabledState(false)
            if (input) {
              this.$nextTick(() => input.focus())
              this.showReturnArrow = true
            }
          })
        }
      },
      immediate: true
    },
  },

  methods: {
    ...mapActions(['updateOrgDatasetStatuses']),
    ...mapActions('datasetModule', [
        'updateDatasetSearchStatus'
      ]),

    /**
     * This updates the status array in local before we
     * update the state in vuex
     */
    updateStatusArray: function(response) {
      const statuses = this.orgDatasetStatuses.map(status => {
        if (status.displayName === this.status.displayName) {
          status = response
        }
          return status
        })
        const name = propOr('', 'name', response)
        this.resetDisabledState(true)
        this.updateOrgDatasetStatuses(statuses)
        this.updateDatasetSearchStatus(name)
    },

    /**
     * Closes default status menu
     */
    closeMenu: function() {
      this.openMenu = false
    },

    /**
     * Action to rename a status
     */
    renameStatus: function() {
      if (!this.status.inUse) {
        // this means entirely new status
        // and you can just rename right away
        this.editStatusName(this.status.id)
      } else {
        // this status already exists and
        // is being used
        this.isRenameDialogVisible = true
      }
    },

    /**
     * Action to remove a status
     */
    removeStatus: function() {
      if (!this.status.inUse) {
        // this means status isn't being used
        // and you can just remove right away
        this.removeStatusName()
      } else {
        // this status exists and is being used
        // first we need the index to know what name we're passing
        // if index = 0, get the second name
        // if index is >= 1 get the first name
        const statusName = find(propEq('displayName', this.status.displayName), this.orgDatasetStatuses)
        const index = this.orgDatasetStatuses.indexOf(statusName)
        if (index === 0) {
          this.statusReplacementName = this.orgDatasetStatuses[1].displayName
        } else {
          this.statusReplacementName = this.orgDatasetStatuses[0].displayName
        }

        this.isRemoveDialogVisible = true
      }
    },

    /**
     * Removes status from org
     * @param {Number} id
     */
    removeStatusName: function() {
      this.statusId = this.status.id
      this.sendXhr(this.modifyDatasetStatusUrl, {
        method: 'DELETE'
      })
        .then(() => {
          let statuses = []
          statuses = this.orgDatasetStatuses.filter(status => {
            return status.id !== this.status.id
          })
          this.updateDatasetSearchStatus('')
          this.updateOrgDatasetStatuses(statuses)
          EventBus.$emit('reload-datasets')
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Enables status field to be renamed
     * @param {Number} id
     */
    editStatusName: function(id) {
      // find the status in the list and get the disabled property
      // to enable it for editing
      this.orgDatasetStatuses.forEach(status => {
        if (status.id === id) {
          status.displayName = ''
          this.resetDisabledState(false)
          const input = this.$refs.statusInput
          if (input) {
            this.showReturnArrow = true
            this.openMenu = false
            // we need to do this because the element/focus func
            // is not available immediately
            this.$nextTick(() => input.focus())
          }
        }
      })
    },

    /**
     * Resets disabled state
     * @param {Boolean} state
     */
    resetDisabledState: function(state) {
      this.isDisabled = state
    },

    /**
     * Changes current status color
     */
    getSelectedColor: function(color) {
      this.openColorMenu = false
      this.selectedColor = color
      this.statusId = this.status.id
      // update it using endpoint
      this.sendXhr(this.modifyDatasetStatusUrl, {
        method: 'PUT',
        body: {
          displayName: this.status.displayName,
          color: color
        }
      }).then(this.updateStatusArray.bind(this))
      .catch(this.handleXhrError.bind(this))
    },

    /**
     * Closes rename status dialog
     */
    closeRenameStatusDialog: function() {
      this.isRenameDialogVisible = false
    },

    /**
     * Closes remove status dialog
     */
    closeRemoveStatusDialog: function() {
      this.isRemoveDialogVisible = false
    },

    /**
     * Gets the color for the dataset status dot
     * @returns {Object}
     */
    getStatusDot: function(status) {
      return {
        backgroundColor:
          this.selectedColor !== '' ? this.selectedColor : status.color
      }
    },

    /**
     * Gets the color for the dataset status input box
     * @returns {Object}
     */
    getStatusColor: function(status) {
      return {
        border:
          this.selectedColor !== ''
            ? `solid 1px ${this.selectedColor}`
            : `solid 1px ${status.color}`
      }
    },

    /**
     * Action event after new status name is entered in input box
     * @param {String} newStatusName
     * @param {Object} status
     */
    handleEvent: function(newStatusName, status) {
      this.statusId = status.id
      this.showReturnArrow = false
      const nameExists = this.checkForDuplicates()
      if (newStatusName.length > 0 && !nameExists) {
        this.invalidInput = false
        if (status.isNew) {
          // this means its a new status that
          // we need to create
          this.createNewStatus(newStatusName)
        } else {
          this.updateStatus(newStatusName, status)
        }
      } else {
        this.invalidInput = true
        this.showReturnArrow = true
      }
    },

    /**
     * Checks for duplicates in list
     * @returns {Boolean}
     */
    checkForDuplicates: function() {
      const alreadySeen = []
      for (const status of this.orgDatasetStatuses) {
        if (status.displayName !== '') {
          if (alreadySeen[status.displayName]) {
            return true
          } else {
             alreadySeen[status.displayName] = true
          }
        }
      }
      return false
    },

    /**
     * Creates a new status in an organization
     * @param {String} newStatusName
     */
    createNewStatus: function(newStatusName) {
      this.sendXhr(this.createNewDatasetStatusUrl, {
            method: 'POST',
            body: {
              displayName: newStatusName,
              color: '#71747C'
            }
          }).then(this.updateStatusArray.bind(this))
          .catch(this.handleXhrError.bind(this))
    },

    /**
     * Updates an existing status in an organization
     * @param {String} newStatusName
     * @param {Object} status
     */
    updateStatus: function(newStatusName, status) {
      this.sendXhr(this.modifyDatasetStatusUrl, {
            method: 'PUT',
            body: {
              displayName: newStatusName,
              color:
                this.selectedColor !== '' ? this.selectedColor : status.color
            }
          }).then(this.updateStatusArray.bind(this))
          .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';
@import '../../../assets/components/_dataset-status.scss';

.dataset-status-input {
  margin-top: 8px;
}

ul {
  list-style-type: none;
  text-decoration: none;
}

.input-error-text {
  font-size: 12px;
  font-weight: normal;
  font-style: italic;
  margin-top: 8px;
  color: $red_1;
}

.settings-status-color {
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   padding-right: 26px;
}

.no-status-ul {
  padding-left: 0px;
  margin-top: 0;
  padding-top: 0;

  li {
    &:hover {
      background-color: $gray_2;
      width: 216px;
      padding-left: 0px !important;
    }
  }

  a {
    &:hover {
      text-decoration: none;
    }
  }
}

input[type='text']:disabled {
  background: none;
}

.bf-menu-item {
  margin-right: -14px;
  padding-left: 8px !important;
  color: black;
}

.bf-menu-item-disabled {
  pointer-events: none;
  cursor: default;
  text-decoration: none;
  color: black;
  opacity: 0.6;
  margin-right: -14px;
}

.menu-li-disabled {
  padding: 8px;
  padding-top: 4px;
}

.bf-menu-icon {
  width: 13px;
  height: 13px;
  padding-right: 1px;
  padding-bottom: 3px;
}

.bf-menu-no-status {
  height: 64px;
  width: 202px;
  font-size: 14px;
  font-weight: normal;
  line-height: 32px;
  color: #000000;
  padding-top: 0;
}

.btn-file-menu {
  margin-left: -28px;
  position: relative;
  top: -1px;
  &:active {
    color: var(--button-color);
  }
  &:focus {
    color: var(--button-color);
  }
}

.return-btn {
  display: inline-flex;
  flex-direction: row;
  margin-left: -28px;
}
</style>

<style lang="scss">
@import 'vue-swatches/dist/vue-swatches.min.css';

.vue-swatches {
  .vue-swatches__container {
    .vue-swatches__wrapper {
      width: 181px !important;
    }
  }
}
</style>
