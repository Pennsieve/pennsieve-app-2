<template>
  <div class="create-button-wrapper">
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
      <div class="bf-menu">
        <ul>
          <!-- <li>
            <router-link
              class="bf-menu-item"
              @click.native="closeMenus"
              :to="{ name: 'create-dashboard' }"
            >
              New Dashboard
            </router-link>
          </li> -->
          <li>
            <router-link
              class="bf-menu-item"
              :to="{ name: 'create-view' }"
              @click.native="closeMenus"
            >
              New View
            </router-link>
          </li>
          <li>
            <!-- TODO: change route to 'create-query' -->
            <router-link
              class="bf-menu-item"
              :to="{ name: 'create-query' }"
              @click.native="closeMenus"
            >
              New Query
            </router-link>
          </li>
        </ul>
      </div>
    </el-popover>

    <button
      id="create-button"
      v-popover:createMenu
      class="bf-navigation-item"
      :class="{ 'open' : createMenuOpen }"
    >
      <svg
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
        <span class="label">
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
import BfButton from '../../shared/bf-button/BfButton'
import FilterInput from '../../shared/FilterInput/FilterInput.vue'
import FilterEmptyState from '../../shared/FilterEmptyState/FilterEmptyState.vue'

export default {
  name: 'CreateButtonWorkspace',

  components: {
    BfButton,
    FilterInput,
    FilterEmptyState,
  },

  props: {
    condensed: Boolean
  },

  data() {
    return {
      createMenuOpen: false,
      recordMenuOpen: false,
      modelFilter: ''
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
      'datasetLocked'
    ]),

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
     * Close all menus
     */
    closeMenus: function() {
      this.createMenuOpen = false
      this.recordMenuOpen = false
    },
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
    margin-left: 0 !important
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
