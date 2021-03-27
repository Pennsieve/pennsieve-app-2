<template>
  <div>
    <!-- First time creating a model with no properties -->
    <dataset-owner-message
      title="Add Some Properties"
      :display-owner-message="displayOwnerMessage"
      class="missing-properties-message"
      @got-it="handleGotIt"
    >
      <img
        slot="img"
        src="/static/images/illustrations/illo-missing-relationships.svg"
        alt=""
      >
      <p slot="copy">
        Create properties for things like names, dates, etc… Click the Add Property button to the right to get started.
      </p>
      <bf-button
        slot="button"
        class="missing-properties-button"
        @click="addModelProperty"
      >
        Add Property
      </bf-button>
    </dataset-owner-message>
    <!-- No properties, more than 1 model has been created -->
    <dataset-owner-message
      title="Add Some Properties"
      :display-owner-message="!displayOwnerMessage && properties.length === 0"
      :hide-got-it="true"
      class="missing-properties-message"
    >
      <img
        slot="img"
        src="/static/images/illustrations/illo-missing-relationships.svg"
        alt=""
      >
      <p slot="copy">
        Create properties for things like names, dates, etc… Click the Add Property button to the right get started.
      </p>
      <template slot="button">
        <bf-button
          slot="button"
          class="missing-properties-button"
          @click="addModelProperty"
        >
          Add Property
        </bf-button>
      </template>
    </dataset-owner-message>
    <div class="concept-property-list">
      <concept-property-item
        v-for="property in properties"
        :key="property.name"
        :property="property"
        :changed="hasChanged(property.name)"
        :model-locked="modelLocked"
        @dragstart="_onDragStart"
        @dragend="_onDragEnd"
        @drag="_onDrag"
        @drop="_onDrop"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { contains } from 'ramda'

import ConceptPropertyItem from './ConceptPropertyItem'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import DatasetOwnerMessage from '../../../shared/DatasetOwnerMessage/DatasetOwnerMessage.vue'
import EventBus from '../../../../utils/event-bus'

export default {
  name: 'ConceptPropertyList',

  components: {
    BfButton,
    ConceptPropertyItem,
    DatasetOwnerMessage,
  },

  props: {
    properties: {
      type: Array,
      default: []
    },
    changedProperties: {
      type: Array,
      default: []
    },
    modelLocked: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
      'concepts'
    ]),
  },

  watch: {
    concepts: {
      handler: function() {
        this.shouldDisplayOwnerMessage()
      },
      immediate: true
    },
    properties: {
      handler: function() {
        this.shouldDisplayOwnerMessage()
      },
      immediate: true
    },
  },

  data() {
    return {
      selectedProperty: {},
      displayOwnerMessage: false,
      gotItKey: 'newConceptOwnerMsg',
    }
  },

  mounted() {
    EventBus.$on('dragend', this._onDragEnd.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('dragend', this._onDragEnd.bind(this))
  },

  methods: {
    /**
     * Emit add model property message
     */
    addModelProperty: function() {
      this.$emit('open-create-property')
    },
    /**
     * Determines whether or not to display the owner message
     */
    shouldDisplayOwnerMessage: function() {
      const showOwnerMsg = localStorage.getItem(this.gotItKey)
      const predicate = !showOwnerMsg && this.properties.length === 0 && this.concepts.length === 1
      this.displayOwnerMessage = predicate
    },

    /**
     * Compute if the property has changed
     * @param {String} name
     * @returns {Boolean}
     */
    hasChanged: function(name) {
      return this.changedProperties.findIndex(prop => prop.name === name) >= 0
    },

    /**
     * Set LocalStorage flag whether to display message to dataset owner
     */
    handleGotIt: function() {
      localStorage.setItem(this.gotItKey, 'hide')
      this.displayOwnerMessage = false
    },
    /**
      * When the user starts dragging the item
      * @param {Object} evt
      * @param {Object} property
      */
    _onDragStart: function(evt, property) {
      // update selected property
      this.selectedProperty = property
      // Set custom drag image
      const dragEl = evt.target.cloneNode(true)
      const boundingBox = evt.target.getBoundingClientRect()

      dragEl.style.width = `${boundingBox.width}px`
      dragEl.id = "property-drag-info"
      dragEl.style.top = `-${evt.offsetY}px`
      dragEl.style.left = `-${evt.offsetX}px`
      document.body.appendChild(dragEl)
      evt.dataTransfer.setDragImage(dragEl, 0, 0)
    },

    /**
     * When the user stops dragging the item
     * Hide Drag Info
     */
    _onDragEnd: function() {
      const dragEl = document.getElementById('property-drag-info')
      if (dragEl) {
        // remove cloned element
        document.body.removeChild(dragEl)
        // reset selected file state
        this.selectedProperty = {}
      }
    },

    /**
     * When the user is dragging an item
     * @param {Object} evt
     */
    _onDrag: function(evt) {
      evt.preventDefault()
      const dragEl = document.getElementById('property-drag-info')
      if (dragEl) {
        dragEl.classList.add('dragging')
        if (evt.clientX > 0 && evt.clientY > 0) {
          dragEl.style.transform = `translate3d(${evt.clientX}px, ${evt.clientY}px, 0)`
        }
      }
    },

    /**
      * Handles drop events
      * @param {Object} evt
      * @param {Object} property
      */
    _onDrop: function(evt, property) {
      evt.preventDefault()
      evt.stopPropagation()

      this.$emit('update-property-order', {
        targetProperty: property,
        selectedProperty: this.selectedProperty
      })
    },
  }
}
</script>

<style scoped lang="scss">
  .missing-properties-message {
    border: none !important;
    img {
      height: 79px;
      width: 119px;
    }

    p {
      color: #71747C;
      font-size: 14px;
      line-height: 16px;
      text-align: center;
      padding-bottom: 16px !important;
      width: 567px;
      height: 32px;
    }
  }

  .missing-properties-button {
      height: 40px;
      width: 162px;
  }
</style>
