<template>
  <div class="create-button-wrapper">
    <locked-dialog
      :visible="visible"
      @toggle-visible="toggleVisible"
    />
    <el-popover
      ref="recordMenu"
      v-model="recordMenuOpen"
      popper-class="no-padding new-record-menu scroll"
      placement="right-start"
      width="300"
      trigger="hover"
      :offset="-8"
      transition=""
      :open-delay="100"
      :visible-arrow="false"
      @hide="onRecordMenuHide"
    >
      <filter-input
        v-show="showFilter"
        ref="inputModelFilter"
        v-model="modelFilter"
        placeholder="Type an model name to filter"
      />

      <div class="bf-menu scroll-menu">
        <ul>
          <li
            v-for="item in filteredConcepts"
            :key="item.id"
          >
            <router-link
              class="bf-menu-item"
              :to="{
                name: 'concept-instance',
                params: {
                  conceptId: item.id,
                  instanceId: 'new'
                }
              }"
              @click.native="closeMenus"
            >
              {{ item.displayName }}
            </router-link>
          </li>
        </ul>
      </div>

      <filter-empty-state
        v-if="filteredConcepts.length === 0"
        class="filter-empty-state"
      >
        <h3>You don't have any records</h3>
        <p>
          Once you set up <router-link
            :to="{ name: 'models' }"
            class=""
          >
            models
          </router-link>, you'll be able to create records.
        </p>
      </filter-empty-state>
    </el-popover>
    <el-popover
      ref="createMenu"
      v-model="createMenuOpen"
      :popper-class="createPopoverClass"
      width="260"
      trigger="click"
      transition=""
      :visible-arrow="false"
      :popper-options="{
        modifiers: [ 'offset', 'preventOverflow', createMenuModifier, 'applyStyle' ]
      }"
    >
      <template v-if="datasetLocked">
        <p class="locked-copy">
          {{ datasetLockedMessage }}
        </p>
        <a
          v-if="dataset.publication.type === PublicationType.EMBARGO"
          href="#"
          @click.prevent="toggleVisible(true)"
        >
          <svg-icon
            class="mr-8"
            icon="icon-help-message"
            height="15"
            width="15"
          />
          Tell Me More
        </a>
        <a
          v-else
          href="#"
          target="_blank"
          @click.prevent="showIntercom"
        >
          Get Help
        </a>
      </template>

      <template v-else>
        <div class="bf-menu">
          <template v-if="getPermission('editor')">
            <ul v-show="hasConcepts">
              <li>
                <a
                  v-popover:recordMenu
                  class="bf-menu-item icon-item"
                  data-cy="newRecordBtn"
                  href="#"
                  @click.prevent
                >
                  New Record <svg-icon
                    icon="icon-arrow-right"
                    width="10"
                    height="10"
                  />
                </a>
              </li>
            </ul>

            <hr v-show="hasConcepts">
          </template>

          <ul v-if="getPermission('editor')">
            <li>
              <a
                class="bf-menu-item"
                href="#"
                @click.prevent="uploadFile"
              >
                Upload File
              </a>
            </li>
            <li>
              <a
                class="bf-menu-item"
                href="#"
                @click.prevent="linkToExternalFile"
              >
                Link to External File
              </a>
            </li>
          </ul>

          <template v-if="getPermission('manager')">
            <hr>

            <ul>
              <li>
                <router-link
                  class="bf-menu-item"
                  :to="{
                    name: 'models',
                    query: {
                      openNewModelDialog: true
                    }
                  }"
                  @click.native="closeMenus"
                >
                  New Model
                </router-link>
              </li>
              <li v-if="modelTemplates.length > 0">
                <router-link
                  class="bf-menu-item"
                  :to="{
                    name: 'model-templates'
                  }"
                  @click.native="closeMenus"
                >
                  Model from Template
                </router-link>
              </li>
              <li>
                <router-link
                  class="bf-menu-item"
                  :to="{
                    name: 'relationships',
                    query: {
                      createRelationshipType: true
                    }
                  }"
                  @click.native="closeMenus"
                >
                  Create Relationship Type
                </router-link>
              </li>
            </ul>
          </template>


        </div>
      </template>
    </el-popover>

    <button
      id="create-button"
      v-popover:createMenu
      class="bf-navigation-item"
      :class="{ 'open' : createMenuOpen }"
    >
      <img
        v-if="datasetLocked"
        src="/static/images/icons/lock-create.svg"
        alt="icon for locked dataset"
      >
      <svg
        v-if="!datasetLocked"
        id="create-button-icon"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
      >
        <defs>
          <linearGradient
            id="create_icon_gradient"
            x1="15.9987"
            y1="5.0012"
            x2="21.9987"
            y2="5.0012"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0.0161"
              stop-color="#fff"
              stop-opacity="0.2"
            /><stop
              offset="0.322"
              stop-color="#f2f3f4"
              stop-opacity="0.1875"
            /><stop
              offset="0.5772"
              stop-color="#cacdd1"
              stop-opacity="0.1487"
            /><stop
              offset="0.8134"
              stop-color="#878d96"
              stop-opacity="0.0836"
            /><stop
              offset="1"
              stop-color="#3b4554"
              stop-opacity="0.01"
            />
          </linearGradient>
        </defs><g id="document">
          <polygon
            points="21.999 22.001 1.999 22.001 1.999 2.001 15.999 2.001 21.999 7.97 21.999 22.001"
            fill="#dadada"
          /><path
            d="M15.9987,2.0012v4.5a1.5,1.5,0,0,0,1.5,1.5h4.5Z"
            fill="#71747c"
          /><g
            id="_generic_"
            data-name="&lt;generic&gt;"
          >
            <g
              id="_artwork_"
              data-name="&lt;artwork&gt;"
            >
              <polygon
                points="21.999 22.001 1.999 22.001 1.999 2.001 15.999 2.001 21.999 7.97 21.999 22.001"
                fill="#dadada"
              /><path
                d="M15.9987,2.0012v4.5a1.5,1.5,0,0,0,1.5,1.5h4.5Z"
                fill="#71747c"
              />
            </g><path
              id="_gradient_"
              data-name="&lt;gradient&gt;"
              d="M15.9987,2.0012v4.5a1.5,1.5,0,0,0,1.5,1.5h4.5Z"
              fill="url(#create_icon_gradient)"
            />
          </g>
        </g><g id="plus-sign">
          <path
            d="M15.9987,11.0012h-3v-3a1,1,0,0,0-2,0v3h-3a1,1,0,1,0,0,2h3v3a1,1,0,0,0,2,0v-3h3a1,1,0,0,0,0-2Z"
            fill="currentColor"
          />
        </g>
      </svg>
      <template v-show="!condensed">
        <span
          v-if="datasetLocked"
          class="label"
        >
          View Only
        </span>
        <span
          v-else
          class="label"
        >
          Create
        </span>
        <svg-icon
          color="#71747C"
          class="icon-arrow"
          icon="icon-arrow-up"
          :dir="createArrowDir"
          width="10"
          height="10"
        />
      </template>
    </button>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { filter, propEq } from 'ramda'

import EventBus from '../../../utils/event-bus'
import FilterInput from '../../shared/FilterInput/FilterInput.vue'
import FilterEmptyState from '../../shared/FilterEmptyState/FilterEmptyState.vue'
import LockedDialog from '../../datasets/LockedDialog/LockedDialog.vue'
import { PublicationType } from '@/utils/constants'
import { DatasetLockedMessaging } from '@/utils/constants'


export default {
  name: 'CreateButton',

  components: {
    FilterInput,
    FilterEmptyState,
    LockedDialog
  },

  props: {
    condensed: Boolean
  },

  data() {
    return {
      createMenuOpen: false,
      recordMenuOpen: false,
      modelFilter: '',
      visible: false
    }
  },

  computed: {
    ...mapState([
      'dataset',
      'concepts',
      'modelTemplates'
    ]),

    ...mapGetters([
      'hasFeature',
      'getPermission',
      'datasetLocked'
    ]),


      /**
       * Dataset locked message based on dataset publication type
       * @returns {String}
       */
      datasetLockedMessage: function() {
        return this.dataset.publication.type === PublicationType.EMBARGO ? DatasetLockedMessaging.EMBARGO_LOCKED_MESSAGE :
        DatasetLockedMessaging.DEFAULT_LOCKED_MESSAGE
      },

    /**
     * Publication Type constant
     * @returns {String}
    */
    PublicationType: function() {
      return PublicationType
    },

    /**
     * Compute popover class based on locked dataset status
     * @returns {String}
     */
    createPopoverClass: function() {
      return this.datasetLocked ? 'create-menu dataset-locked' : 'create-menu no-padding'
    },

    /**
     * Compute if the org has unlocked concepts
     * @returns {Boolean}
     */
    hasConcepts: function() {
      return this.unlockedConcepts.length > 0
    },

    /**
     * Compute the direction of the create arrow icon
     * @returns {String}
     */
    createArrowDir: function() {
      return this.createMenuOpen ? 'up' : 'down'
    },

    /**
     * Compute if the filter should be shown
     * @returns {Boolean}
     */
    showFilter: function() {
      return this.unlockedConcepts.length >= 20
    },

    /**
     * Compute list of all unlocked concepts
     * @returns {Array}
     */
    unlockedConcepts: function() {
      return filter(propEq('locked', false), this.concepts)
    },

    /**
     * Compute concepts based off of filter
     * @return {Array}
     */
    filteredConcepts: function() {
      if (this.unlockedConcepts.length) {
        return this.unlockedConcepts.filter(concept => {
          return concept.displayName.toLowerCase().indexOf(this.modelFilter.toLowerCase()) > -1 && concept.propertyCount > 0
        })
      }

      return []
    }
  },

  methods: {

    /**
     * Toggles modal to be visible or not
     * @param {Boolean} val
     */
    toggleVisible: function(val) {
      this.visible = val
      if (this.createMenuOpen) {
        this.createMenuOpen = false
      }
    },
    /**
     * Compute placement for create menu
     * @param {Object}
     * @returns {Object}
     */
    createMenuModifier: function(data) {
      // Compute offset
      if (this.condensed) {
        const condensedOffset = 41
        data.offsets.popper.top += condensedOffset
      } else {
        data.offsets.popper.left += 38
      }

      // Compute placement
      const placement = this.condensed ? 'right-start' : 'bottom-start'
      data.instance._options.placement = placement

      return data
    },

    /**
     * Show intercom window
     */
    showIntercom: function() {
      window.Intercom('show')
      this.createMenuOpen = false
    },

    /**
     * Close all menus
     */
    closeMenus: function() {
      this.createMenuOpen = false
      this.recordMenuOpen = false
    },

    /**
     * Open file upload window
     */
    uploadFile: function() {
      this.closeMenus()

      EventBus.$emit('open-uploader', true)

      // Update upload location
      this.$store.dispatch('updateUploadDestination', this.dataset)
    },

    /**
     * Open link to external file window
     */
    linkToExternalFile: function() {
      this.closeMenus()

      EventBus.$emit('open-external-file-modal')
    },

    /**
     * Callback for when the record menu is hidden
     * Use `setTimeout` rather than nextTick to ensure
     * the menu is hidden before resetting
     */
    onRecordMenuHide: function() {
      window.setTimeout(() => {
        this.modelFilter = ''
      }, 250)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .create-button-wrapper {
    font-size: 14px;
  }

  .bf-navigation-item {
    cursor: pointer;
    &:hover, &:focus, &.open {
      background: none;
      #create-button-icon {
        color: $app-primary-color;
      }
    }
    .svg-icon.icon-arrow {
      margin-right: 0;
      min-width: 0;
    }
  }


  #create-button-icon {
    color: $gray_6;
    flex-shrink: 0;
    height: 28px;
    margin: -2px;
    width: 28px;
    .condensed & {
      margin: -4px
    }
  }

  #create-button {
    color: $gray_6;
    display: flex;
    width: 100%;
    display: flex;
    align-items: center;

    .label {
      margin-left: 20px;
      text-align: initial;
      font-size: 14px;
    }
  }
  .locked-copy {
    color: #000
  }

  .filter-empty-state {
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px;
    }
    p {
      margin: 0;
    }
  }
</style>
<style lang="scss">
  .new-record-menu {
    margin-left: 0 !important;
  }
  .create-menu.el-popover {
    box-sizing: border-box;
    margin-top: 16px;
  }
  .create-menu.dataset-locked {
    padding: 24px 16px;
    text-align: center;
    p {
      font-size: 13px;
    }
    a {
      align-items: center;
      display: flex;
      justify-content: center;
    }
  }
</style>
