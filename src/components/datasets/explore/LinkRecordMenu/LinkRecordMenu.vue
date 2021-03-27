<template>
  <div class="link-record-menu">
    <el-popover
      ref="menu"
      v-model="menuOpen"
      popper-class="no-padding scroll"
      placement="bottom-start"
      width="300"
      trigger="click"
      transition=""
      :visible-arrow="false"
    >
      <div
        v-if="modelsWithRecords.length === 0 && modelsWithoutRecords.length === 0"
        class="empty-state"
      >
        <img
          class="mb-16"
          src="/static/images/illustrations/illo-missing-relationships.svg"
          alt=""
          width="120"
          height="80"
        >
        <h2>No Relationships Defined</h2>
        <p>
          Set up some <router-link :to="{ name: 'relationship-types' }">
            relationship types
          </router-link> in your models tab to enable links to records.
        </p>
      </div>

      <template v-else>
        <div
          v-if="showExistingFile"
          class="bf-menu existing-file-menu"
        >
          <ul>
            <li>
              <a
                href="#"
                class="bf-menu-item"
                @click.prevent="onMenuClick('files')"
              >
                Existing File
              </a>
            </li>
          </ul>
        </div>


        <div class="scroll-wrap">
          <div class="bf-menu scroll-menu">
            <template v-if="modelsWithRecords.length">
              <h2>Relationships with Records</h2>
              <ul>
                <li
                  v-for="model in modelsWithRecords"
                  :key="model.id"
                >
                  <a
                    href="#"
                    class="bf-menu-item"
                    @click.prevent="onMenuClick(model.id)"
                  >
                    {{ model.displayName }}
                  </a>
                </li>
              </ul>
            </template>

            <template v-if="modelsWithoutRecords.length">
              <h2>Relationships without records</h2>
              <ul>
                <li
                  v-for="model in modelsWithoutRecords"
                  :key="model.id"
                >
                  <span class="bf-menu-item disabled">
                    {{ model.displayName }}
                  </span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </template>
    </el-popover>

    <bf-button
      v-popover:menu
      class="compact"
      :disabled="datasetLocked"
    >
      Link to Record
      <svg-icon
        slot="suffix"
        class="icon-caret"
        icon="icon-arrow-up"
        color="#fff"
        :dir="arrowDir"
        height="10"
        width="10"
      />
    </bf-button>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { prop, uniqBy, reject, propEq } from 'ramda'

import BfButton from '../../../shared/bf-button/BfButton.vue'

export default {
  name: 'LinkRecordMenu',

  components: {
    BfButton
  },

  props: {
    relationships: {
      type: Array,
      default: function() {
        return []
      }
    },
    showExistingFile: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      menuOpen: false
    }
  },

  computed: {
    ...mapState([
      'concepts'
    ]),

    ...mapGetters([
      'getModelByName', 'datasetLocked'
    ]),

    modelsHasLoaded: function() {
      return this.concepts.length > 0
    },

    hasRelationships: function() {
      return this.relationships.length > 0
    },

    models: function() {
      if (this.modelsHasLoaded && this.hasRelationships) {
        const relationships = reject(propEq('name', 'package'), this.relationships)
        return relationships.map(rel => this.getModelByName(rel.name))
      }

      return []
    },

    /**
     * Compute direction of the dropdown arrow based on open state
     * @returns {String}
     */
    arrowDir: function() {
      return this.menuOpen ? 'up' : 'down'
    },

    /**
     * Compute list of all models with records
     * @returns {Array}
     */
    modelsWithRecords: function() {
      if (this.modelsHasLoaded && this.hasRelationships) {
        const modelsWithRecords = this.models.filter(model => model.count > 0)
        return uniqBy(prop('displayName'), modelsWithRecords)
      }

      return []
    },

    /**
     * Compute list of all models without records
     * @returns {Array}
     */
    modelsWithoutRecords: function() {
      if (this.modelsHasLoaded && this.hasRelationships) {
        const modelsWithoutRecords = this.models.filter(model => model.count === 0)
        return uniqBy(prop('displayName'), modelsWithoutRecords)
      }

      return []
    },
  },

  methods: {
    /**
     * On menu click, close menu and emit event about option clicked
     * @param {String} command
     */
    onMenuClick: function(command) {
      this.menuOpen = false
      this.$emit('menu-click', command)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';
  .link-record-menu {
    .bf-button {
      border: none;
      font-size: 12px;
      line-height: 17px;
      &:hover {
        box-shadow: none !important;
      }
    }
  }
  .existing-file-menu {
    border-bottom: 1px solid $cortex;
  }
  .empty-state {
    padding: 64px 24px;
    text-align: center;
    p {
      margin: 0;
    }
  }
</style>
