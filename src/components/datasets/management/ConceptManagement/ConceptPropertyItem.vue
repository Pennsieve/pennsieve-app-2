<template>
  <div
    class="concept-property-item"
    :class="[
      dragged ? 'dragged' : '',
      dragOver ? 'drag-over' : '',
      changed ? 'changed' : '',
      isLocked ? 'locked' : '',
      modelLocked ? 'locked-model' : '',
      isModelTitle ? 'model-title' : ''
    ]"
    :draggable="!modelLocked && !isModelTitle && !datasetLocked"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <el-row
      type="flex"
      :gutter="32"
      align="middle"
    >
      <el-col
        :span="10"
        class="property-info"
      >
        <svg-icon
          v-if="!modelLocked"
          class="icon-reorder"
          color="currentColor"
          height="24"
          name="icon-reorder"
          width="24"
        />
        <el-tooltip
          placement="top"
          :content="displayName(property)"
          :disabled="!visibility"
        >
          <div
            ref="propertyLabel"
            class="property-name property-label"
            @mouseover="showLabel"
            @mouseout="hideLabel"
          >
            <span>{{ property.displayName }}</span>
            <svg-icon
              v-if="propertyLocked && !modelLocked"
              icon="icon-lock-filled"
            />
          </div>
        </el-tooltip>
      </el-col>
      <el-col :span="5">
        {{ dataType === 'Model' ? modelDisplayName : dataType }}
      </el-col>
      <el-col :span="5">
        {{ unitOrSubtype }}
      </el-col>
      <el-col :span="7">
        {{ property.conceptTitle ? 'Model Title' : '' }}
      </el-col>
      <el-col
        :span="2"
        class="align-right"
      >
        <el-dropdown
          v-if="!modelLocked"
          placement="bottom-end"
          trigger="click"
          @command="handlePropertyUpdate"
        >
          <span class="btn-file-menu el-dropdown-link">
            <svg-icon
              class="icon-menu"
              icon="icon-menu"
            />
          </span>
          <el-dropdown-menu
            slot="dropdown"
            class="bf-menu"
            :offset="9"
          >
            <template v-if="!propertyLocked">
              <el-dropdown-item
                :disabled="datasetLocked"
                command="edit"
              >
                Update
              </el-dropdown-item>
              <el-dropdown-item
                v-if="canArchive"
                :disabled="datasetLocked"
                command="archive"
              >
                Delete
              </el-dropdown-item>
              <el-dropdown-item
                v-if="canRemove"
                :disabled="datasetLocked"
                command="remove"
              >
                Remove
              </el-dropdown-item>
            </template>

            <template v-else>
              <el-dropdown-item command="unlock">
                Unlock
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
import { propOr, defaultTo, pathOr } from 'ramda'
import CheckOverflow from '../../../../mixins/check-overflow'
import { getUnitDisplayName } from '../../../../mixins/data-type/utils'
import DataType from '../../../../mixins/data-type'
import EventBus from '../../../../utils/event-bus'

  export default {
  name: 'ConceptPropertyItem',

  mixins: [
    CheckOverflow,
    DataType
  ],

  props: {
    property: {
      type: Object,
      default: function() {
        return {
          name: '',
          displayName: '',
          value: '',
          locked: false,
          dataType: '',
          conceptTitle: false
        }
      }
    },
    changed: {
      type: Boolean,
      default: false
    },
    modelLocked: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dragged: false,
      dragOver: false,
      dragCounter: 0,
      visibility: false,
    }
  },

  computed: {
    ...mapState([
      'dataset',
      'conceptsHash',
      'scientificUnits'
    ]),

    ...mapGetters([
      'datasetLocked'
    ]),

    /**
     * Computes data type of property
     * @returns {String}
     */
    dataType: function() {
      return this.formatDataType(this.property)
    },

    /**
     * computes the unit or subtype, if applicable
     */
    unitOrSubtype: function() {
      const isNumeric = type => ['Long', 'Double'].includes(type)
      const hasSubtype = obj => obj.type === 'String' && obj.format && obj.format !== 'Date'

      const dt = this.property.dataType

      // ready for your blood pressure to go up?  read the lovely logic to follow...

      if (typeof dt === 'string') return '';

      if (dt.items) {
        if (isNumeric(dt.items.type)) {
          return getUnitDisplayName(dt.items.unit) || ''
        } else if (hasSubtype(dt.items)) {
          return dt.items.format
        }
        return ''
      }

      if (isNumeric(dt.type)) return getUnitDisplayName(dt.unit)

      if (hasSubtype(dt)) return dt.format

      return ''
    },

    /**
     * Compute if the property is locked
     */
    propertyLocked: function() {
      return propOr(false, 'locked', this.property)
    },

    /**
     * Compute if the property is locked by property locked or model locked
     * @returns {Boolean}
     */
    isLocked: function() {
      return this.modelLocked || this.propertyLocked
    },

    /**
     * Compute if the property is a model title
     * @returns {Boolean}
     */
    isModelTitle: function() {
      return this.property.conceptTitle
    },

    /**
     * Compute if property can be archived
     * @returns {Boolean}
     */
    canArchive: function() {
      return this.property.createdAt && !this.property.conceptTitle
    },

    /**
     * Compute if property can be removed
     * @returns {Boolean}
     */
    canRemove: function() {
      return !this.property.conceptTitle && !this.property.createdAt
    },

    modelDisplayName: function() {
      const id = propOr('', 'to', this.property)
      return propOr('', 'displayName', this.conceptsHash[id])
    }
  },

  methods: {

    /**
     * Determines if label should be visible
     */
    showLabel: function() {
      const elem = this.$refs.propertyLabel
      this.visibility = this.checkWidth(elem)
    },
    /**
     * Hides tooltip
     */
    hideLabel: function() {
      this.visibility = false
    },
    /**
     * Generates display name
     */
    displayName: function(val) {
      const displayName = propOr('', 'displayName', val)
      const name = propOr('', 'name', val)
      return defaultTo(name, displayName)
    },
    /**
     * Handle Property Updates
     * @param {String} cmd
     */
    handlePropertyUpdate: function(cmd) {
      const commands = {
        'edit': () => EventBus.$emit('edit-property', this.property),
        'archive': () => EventBus.$emit('archive-property', this.property),
        'remove': () => EventBus.$emit('remove-property', this.property)
      }
      const func = commands[cmd]
      if (typeof func === 'function') {
        func()
      }
    },
    /**
     * Emit dragstart event
     * @param {Object} evt
     */
    onDragStart: function(evt) {
      evt.dataTransfer.setData('application/node type', null)
      this.visibility = false
      this.$emit('dragstart', evt, this.property)
      this.dragged = true

      // Bind dragver on body to get position of mouse
      document.body.addEventListener('dragover', this.onDocumentDragOver)
    },

    /**
     * Emit drag event
     * @param {Object} evt
     */
    onDocumentDragOver: function(evt) {
      this.$emit('drag', evt)
    },

    /**
     * Emit dragend event
     * @param {Object} evt
     */
    onDragEnd: function(evt) {
      // Unbind dragover on body to get position of mouse
      document.body.removeEventListener('dragover', this.onDocumentDragOver)
      EventBus.$emit('dragend', evt)
      this.dragged = false
    },

    /**
     * Add dragCounter and set dragOver state for styling
     */
    onDragEnter: function() {
      this.dragCounter += 1
      this.dragOver = true
    },

    /**
     * Remove dragCounter and set dragOver state for styling
     */
    onDragLeave: function(evt) {
      // update counter -= 1
      this.dragCounter -= 1
      if (this.dragCounter === 0) {
        this.dragOver = false
      }
    },

    onDragOver: function(evt) {
      evt.preventDefault()
      evt.dataTransfer.dropEffect = 'move';
    },

    /**
     * Resets state
     */
    onDrop: function(evt) {
      this.$emit('drop', evt, this.property)
      this.dragOver = false
      this.dragCounter = 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/variables';

.concept-property-item {
  box-sizing: border-box;
  color: $glial;
  cursor: grab;
  border-top: 1px solid $cortex;
  min-height: 49px;
  padding: 24px 16px;

  &#property-drag-info {
    background: #fff;
    border: none;
    box-shadow: 2px 0 8px 0 rgba(0,0,0,0.1), 0 2px 8px 0 rgba(0,0,0,0.1);
    box-sizing: border-box;
    left: 0;
    pointer-events: none;
    position: fixed;
    top: 0;
    visibility: hidden;
    z-index: 99999;
    &.dragging {
      visibility: visible
    }

    .icon-reorder {
      color: $dopamine;
    }
  }

  .property-info {
    align-items: center;
    display: flex;
  }

  .property-label {
    max-width: 75%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.changed {
    .icon-reorder {
      color: $nucleus
    }
  }

  &.dragged {
    background: #F5F6F9;
  }

  &.drag-over {
    border-bottom: 4px solid $dopamine;
    cursor: grabbing;
  }

  &.locked-model, &.model-title {
    cursor: default;
  }
}

.concept-property-item:first-of-type {
  border-top: none;
}

.icon-reorder {
  flex-shrink: 0;
  margin-right: 16px;
}

.property-name {
  color: black;
  display: block;
  font-weight: 500;
  .svg-icon {
    color: $glial;
    margin-left: 8px;
  }
  .locked-model & {
    color: inherit
  }
}
</style>
