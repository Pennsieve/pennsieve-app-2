<template>
  <side-drawer
    class="preview-models"
    heading="Preview Models"
    :visible="visible"
    @close-side-drawer="closeSideDrawer"
  >
    <template slot="copy">
      You can create relationships between this record on your graph.
    </template>

    <div
      slot="body"
      class="selected-templates-list"
    >
      <selected-template
        v-for="item in activeTemplates"
        :key="item.$id"
        :item="item"
        :checked="item.checked"
        @check-selected-template="handleTemplateChecked"
        @uncheck-selected-template="handleTemplateUnChecked"
      />
    </div>

    <template slot="buttons">
      <bf-button
        class="secondary"
        @click="closeSideDrawer"
      >
        Cancel
      </bf-button>
      <bf-button
        :processing="processing"
        processing-text="Adding to Your Graph"
        :disabled="primaryDisabled"
        @click="addToGraph"
      >
        Add to Your Graph
      </bf-button>
    </template>
  </side-drawer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { propOr, pathOr, defaultTo } from 'ramda'
import SideDrawer from '../../../shared/side-drawer/SideDrawer.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import SelectedTemplate from './SelectedTemplate.vue'
import Request from '../../../../mixins/request'
import EventBus from '../../../../utils/event-bus'

export default {
  name: 'PreviewModels',

  components: {
    SelectedTemplate,
    SideDrawer,
    BfButton,
  },

  mixins: [
    Request,
  ],

  props: {
    selectedTemplates: {
      type: Array,
      default: () => []
    },
  },

  data() {
    return {
      visible: false,
      activeTemplates: [],
      processing: false,
      primaryDisabled: true,
    }
  },

  computed: {
    ...mapGetters([
      'config',
      'dataset',
      'userToken',
    ]),
  },

  methods: {
    ...mapActions([
      'updateConcepts',
    ]),
    /**
     * Opens the side drawer
     */
    openDrawer: function() {
      this.visible = true
      this.activeTemplates = this.selectedTemplates
      this.activeTemplates.forEach(temp => temp.checked = true)
      this.checkActiveTemplates()
    },
    /**
     * Handles close-side-drawer event
     */
    closeSideDrawer: function() {
      this.visible = false
      this.$emit('clear-selected-templates')
    },
    /**
     * Builds xhr request queue
     * @returns {Promises}
     */
    buildXhrQueue: function() {
      const queue = this.activeTemplates
        .filter(template => template.checked)
        .map(template => {
          const templateId = propOr('', '$id', template)
          const datasetId = pathOr('', ['content', 'intId'], this.dataset)
          const url = `${templateId}/datasets/${datasetId}`
          return this.sendXhr(url, {
            header: {
              'Authorization': `bearer ${this.userToken}`
            },
            method: 'POST'
          })
        })
      return queue
    },
    /**
     * Get concepts for dataset
     * @returns {Promise}
     */
    getConcepts: function() {
      const datasetId = pathOr('', ['content', 'id'], this.dataset)
      const url = `${this.config.conceptsUrl}/datasets/${datasetId}/concepts`
      return this.sendXhr(url, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
    },
    /**
     * Adds selected templates to the graph
     */
    addToGraph: function() {
      this.processing = true
      const queue = this.buildXhrQueue()
      Promise.all(queue)
        .then(this.getConcepts.bind(this))
        .then(this.updateConcepts.bind(this))
        .then(() => {
          this.processing = false
          this.closeSideDrawer()
          this.$router.push({name: 'models'})

          this.$nextTick(() => {
            const s = queue.length === 1 ? '' : 's'
            const msg = `${queue.length} Model${s} added to your graph.`
            EventBus.$emit('toast', {
              detail: {
                type: 'success',
                msg
              }
            })
            EventBus.$emit('track-event', {
              name: 'Model Template Added'
            })
          })
        })
        .catch(err => {
          this.processing = false
          const status = defaultTo(500, err.status)
          if (status === 400 || status === 403) {
            const msg = this.getErrMsg(status)
            return EventBus.$emit('toast', {
              detail: {
                type: 'error',
                msg
              }
            })
          }
          this.handleXhrError(err)
        })
    },
    /**
     * Get error message string from status code
     * @param {Number} code
     * @returns {String}
     */
    getErrMsg: function(code) {
      const messages = {
        400: 'Attempted to create a template already in use. Please uncheck and try again.',
        403: 'You do not have permission to create a model from one or more templates.',
      }
      return defaultTo('', messages[code])
    },
    /**
     * Sets the checked property to specified value for a given template
     * @param {Object} template
     * @param {Boolean} val
     */
    setCheckedProp: function(template, val) {
      this.activeTemplates = this.activeTemplates.map(temp => {
        if (temp.$id === template.$id) {
          temp.checked = val
        }
        return temp
      })
    },
    /**
     * Handles template checked event
     * @param {Object} template
     */
    handleTemplateChecked: function(template) {
      this.setCheckedProp(template, true)
      this.checkActiveTemplates()
    },
    /**
     * Handles template unchecked event
     * @param {Object} template
     */
    handleTemplateUnChecked: function(template) {
      this.setCheckedProp(template, false)
      this.checkActiveTemplates()
    },
    /**
     * Checks checked property of active templates
     */
    checkActiveTemplates: function() {
      const selectedLength = this.activeTemplates.filter(temp => temp.checked).length
      this.primaryDisabled = selectedLength === 0
    },
  }
}
</script>

<style lang="scss" scoped>
  .preview-models {
    .selected-templates-list {
      overflow: hidden;
      width: 100%;
    }
    .button-spinner {
      height: 20px;
      margin: -3px 8px -3px 0;
      width: 20px;
    }
  }
</style>
