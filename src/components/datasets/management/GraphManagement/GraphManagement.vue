<template>
  <bf-page class="graph-management">
    <locked-banner
      slot="banner"
    />
    <template v-if="getPermission('manager')">
      <bf-rafter slot="heading">
        <h1
          slot="heading"
          class="flex-heading"
        >
          <svg-icon
            v-if="datasetLocked"
            class="mr-8"
            color="#71747C"
            name="icon-lock-filled"
            height="24"
            width="24"
          />
          Data Management
        </h1>
        <ul
          slot="tabs"
          class="tabs unstyled"
        >
          <li>
            <router-link :to="{ name: 'models' }">
              Models
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'relationship-types' }">
              Relationship Types
            </router-link>
          </li>
        </ul>

        <div
          v-if="hasDatasetTemplatesFeature"
          slot="buttons"
          class="buttons"
        >
          <el-dropdown
            trigger="click"
            placement="bottom-end"
            @command="onOverflowMenuClick"
          >
            <bf-button class="secondary icon el-dropdown-link">
              <svg-icon
                icon="icon-menu"
                color="#71747C"
              />
            </bf-button>
            <el-dropdown-menu
              slot="dropdown"
              class="bf-menu"
            >
              <el-dropdown-item
                class="bf-menu-item"
                command="create-dataset-template"
              >
                Create Dataset Template
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </bf-rafter>

      <bf-stage slot="stage">
        <router-view name="stage" />
      </bf-stage>
    </template>

    <create-dataset-template-dialog :visible.sync="isCreateDatasetDialogVisible" />

    <bf-empty-page-state
      v-if="!getPermission('manager')"
      class="empty-state"
    >
      <h2>Access Denied</h2>
      <p>You have reached a page in which you do not have access. Please use the navigation to the left to browse your organization's data.</p>
    </bf-empty-page-state>
  </bf-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import { pathOr, propOr, findIndex, propEq } from 'ramda'

import BfEmptyPageState from '../../../shared/bf-empty-page-state/BfEmptyPageState.vue'
import BfRafter from '../../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import CreateDatasetTemplateDialog from './CreateDatasetTemplateDialog/CreateDatasetTemplateDialog.vue'
import LockedBanner from '../../LockedBanner/LockedBanner';

export default {
  name: 'GraphManagement',

  components: {
    BfRafter,
    BfEmptyPageState,
    BfButton,
    CreateDatasetTemplateDialog,
    LockedBanner
  },

  data() {
    return {
      archiveDialogVisible: false,
      lockDialogVisible: false,
      createConceptDialogVisible: false,
      activeModel: {
        name: '',
        displayName: ''
      },
      isCreateDatasetDialogVisible: false
    }
  },

  computed: {
    ...mapState(['concepts', 'config', 'dataset', 'userToken']),

    ...mapGetters(['hasFeature', 'getPermission', 'datasetLocked']),

    /**
     * Compute model URL
     * @returns {String}
     */
    modelUrl: function() {
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const modelId = propOr('', 'id', this.activeModel)
      return `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/${modelId}`
    },

    /**
     * Computes whether or not concepts feature is enabled
     * @returns {Boolean}
     */
    hasConceptsFeature: function() {
      return this.hasFeature('concepts_feature')
    },

    /**
     * Computes whether or not model templates feature is enabled
     * @returns {Boolean}
     */
    hasModelTemplatesFeature: function() {
      return this.hasFeature('model_templates_feature')
    },

    galleryLinkComponent: function() {
      return this.datasetLocked ? 'div' : 'router-link'
    },

    /**
     * Compute if org has dataset templates feature
     * @returns {Boolean}
     */
    hasDatasetTemplatesFeature: function() {
      return this.hasFeature('dataset_templates_feature')
    }
  },

  watch: {
    '$route.query.openNewModelDialog': {
      handler: function(openNewModelDialog) {
        if (openNewModelDialog) {
          this.createConcept()
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     *
     */
    onGalleryLinkClick: function(evt) {
      if (this.datasetLocked) {
        evt.preventDefault()
      }
    },

    /**
     * Create a new concept
     */
    createConcept: function() {
      this.createConceptDialogVisible = true
    },

    /**
     * Handle overflow menu click event
     * @param {String} command
     */
    onOverflowMenuClick: function(command) {
      if (command === 'create-dataset-template' && this.concepts.length === 0) {
        return
      }

      const commands = {
        'create-dataset-template': this.showCreateDatasetDialog
      }

      const handler = commands[command]

      if (typeof handler === 'function') {
        handler()
      }
    },

    /**
     * Show archive dialog
     */
    showCreateDatasetDialog: function() {
      this.isCreateDatasetDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.graph-management {
  background: $white-matter;

  h2 {
    font-size: 20px;
    line-height: 24px;
  }

  .graph-management-cards {
    display: flex;
    margin-bottom: 48px;
  }

  .gallery-link {
    &:hover {
      text-decoration: none;
    }
    &.disabled {
      cursor: default;
      opacity: 0.6;
    }
  }

  .view-templates-link {
    align-items: center;
    display: flex;
    justify-content: center;

    .view-templates-link-text {
      width: 64px;
    }
  }

  .bf-card {
    height: 183px;
    min-width: 175px;
    max-width: 175px;
    padding: 32px 16px;
  }

  .owner-message p {
    max-width: 680px;
  }
}
</style>
