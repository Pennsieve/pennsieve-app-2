<template>
  <div class="palette-annotations">
    <div class="annotations-heading">
      <div class="controls">
        <div
          v-if="getPermission('editor')"
          class="inner"
          @tap="createLayer"
        >
          <iron-icon
            class="annotation-control create-new-layer"
            icon="blackfynn:add"
          />
          New Layer
        </div>
      </div>
      <div class="visibility">
        <iron-icon
          class="annotation-control toggle-visibility"
          :class="[ allVisible ? 'all-hidden' : '' ]"
          icon="blackfynn:remove-red-eye"
          @click="toggleAllGroupsVisibility"
        />
      </div>
    </div>

    <div id="annotationWrap">
      <accordion
        v-for="layer in viewerAnnotations"
        :ref="`accordion-${layer.id}`"
        :key="layer.id"
        :title="layer.name"
        :selected="layer.selected"
        icon="blackfynn:chevron-down-small"
        :border-color="layer.hexColor"
        :layer-id="layer.id"
      >
        <bf-annotation-group
          slot="title"
          ref="annotationGroup"
          :hide-title="true"
          :layer="JSON.stringify(layer)"
          :orig-label="layer.name"
          :can-crud-annotation="getPermission('editor')"
        />
        <div slot="items">
          <template v-for="annotation in layer.annotations.filter(ann => ann.layer_id === layer.id)">
            <!-- <p v-if="isTimeseriesViewer" :key="annotation.id">{{ annotation.description }}</p> -->
            <bf-ts-annotation
              v-if="isTimeseriesViewer"
              :ref="`ann-${annotation.id}`"
              :key="annotation.id"
              :layer-id="layer.id"
              :layer="JSON.stringify(layer)"
              :annotation="JSON.stringify(annotation)"
              @click="onAnnTap(annotation)"
            />

            <bf-annotation
              v-else
              :id="`ann-${annotation.id}`"
              :key="annotation.id"
              :layer-id="layer.id"
              :annotation="JSON.stringify(annotation)"
              :can-crud-annotation="getPermission('editor')"
              @click="onAnnTap(annotation)"
            />
          </template>
        </div>
      </accordion>

      <bf-viewer-side-panel-empty-state v-show="!hasLayers">
        <img
          id="illustration"
          src="/static/images/illustrations/illo-sharing.svg"
          alt="illustration of two people interacting"
        >
        <p>Add an annotation by using the annotation tool.</p>
      </bf-viewer-side-panel-empty-state>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import {
  pathEq,
  propOr,
  head
} from 'ramda'

import EventBus from '../../../utils/event-bus'
import Sorter from '../../../mixins/sorter'
import ImportHref from '../../../mixins/import-href'

import Accordion from '../../shared/Accordion/Accordion.vue'

export default {
  name: 'PaletteAnnotations',

  components: {
    Accordion
  },

  mixins: [
    Sorter,
    ImportHref
  ],

  data: function() {
    return {
      allVisible: true
    }
  },

  computed: {
    ...mapGetters(['getPermission']),
    ...mapState('viewer', ['activeViewer', 'viewerAnnotations']),

    /**
     * Compute sorted layers and annotations
     * @returns {Array}
     */
    sortedLayers: function() {
      const layers = this.viewerAnnotations

      return this.isTimeseriesViewer ?
        this.setLayerSort(layers, 'start', 'start') :
        this.setLayerSort(layers, 'name', 'updatedAt')
    },

    /**
     * Compute if the active viewer is a timeseries viewer
     * @returns {Boolean}
     */
    isTimeseriesViewer: function() {
      return pathEq(['content', 'packageType'], 'TimeSeries', this.activeViewer)
    },

    /**
     * Compute if the package has layers
     * @returns {Boolean}
     */
    hasLayers: function() {
      return this.viewerAnnotations.length > 0
    }
  },

  /**
   * Vue lifecycle method
   * Import required Polymer components
   */
  mounted: function() {
    // bf-accordion
    this.importHref('/web-components/src/components/blackfynn/shared/bf-accordion/bf-accordion.html')

    // bf-annotation-group
    this.importHref('/web-components/src/components/blackfynn/palettes/annotations/bf-annotation-group.html')

    // bf-ts-annotation
    this.importHref('/web-components/src/components/blackfynn/palettes/annotations/bf-ts-annotation.html')

    // bf-annotation
    this.importHref('/web-components/src/components/blackfynn/palettes/annotations/bf-annotation.html')

    // bf-viewer-side-panel-empty-state
    this.importHref('/web-components/src/components/blackfynn/data/bf-viewer/bf-viewer-side-panel-empty-state.html')
  },

  methods: {
    /**
     * View annotation
     * Opens annotation palette, opens the layer for the annotation
     * and scrolls the palette to the annotation
     * @param {Number} id
     */
    viewAnnotation: function(id) {
      const annotation = this.$store.getters['viewer/getAnnotationById'](id)
      const layerId = propOr('', 'layer_id', annotation)
      const layer = head(this.$refs[`accordion-${layerId}`])

      layer.open = true

      let annotationSelector = 'bf-annotation'
      if (this.isTimeseriesViewer) {
        annotationSelector = 'bf-ts-annotation'
      }

      const annotations = this.$el.querySelectorAll(annotationSelector)
      annotations.forEach(ann => ann.selected = false)

      // Select annotation and scroll it into view
      this.$nextTick(() => {
        const annotationEl = this.$el.querySelector(`#ann-${id}`)
        if (annotationEl) {
          annotationEl.selected = true
          annotationEl.scrollIntoView()
        }
      })
    },

    /**
     * Callback for annotation click
     * Select the annotation in the viewer
     * @param {Object} annotation
     */
    onAnnTap: function(annotation) {
      const annStart = propOr(null, 'start', annotation)
      const annLayerId = propOr('', 'layer_id', annotation)
      const annLayerIndex = this.viewerAnnotations.findIndex(layer => layer.id === annLayerId)
      const annLayer = this.viewerAnnotations[annLayerIndex]

      // Update cursor position in Timeseries Canvas
      EventBus.$emit('active-viewer-action', {
        method: 'onAnnotationSelect',
        payload: annStart
      })

      this.setActiveLayer(annLayerId)

    },

    setActiveLayer: function(layerId) {

      const annLayers = this.viewerAnnotations.map(layer => {
        layer.selected = false

          if( layer.id === layerId) {
              layer.selected = true
          }
          return layer
      })
      for (layer in annLayers) {
        this.$store.dispatch('viewer/updateLayer', layer)
      }

      // this.$store.dispatch('viewer/setChannels', annLayers)

    },

    /**
     * toggles visibility of all groups
     */
    toggleAllGroupsVisibility: function() {
      // check if all layers are all hidden; visible property does not initially exist
      const allHiddenLayers = this.viewerAnnotations.filter(layer => layer.visible === false)
      const allVisibleValue = allHiddenLayers.length === this.viewerAnnotations.length ? true : !this.allVisible

      this.allVisible = allVisibleValue

      const groups = this.$refs.annotationGroup
      groups.forEach(group => group.toggleLayer(this.allVisible))
    },

    /**
     * Set layer and annotation sort
     * @param {Array} list
     * @param {String} sortLayerPath
     * @param {String} sortAnnotationsPath
     * @returns {Array}
     */
    setLayerSort: function(list, sortLayerPath, sortAnnotationsPath) {
      let layers = this.returnSort(sortLayerPath, list, 'desc')
      layers.map(layer => {
        const sortedAnnotations = this.returnSort(sortAnnotationsPath, layer.annotations, 'desc')
        return layer.annotations = sortedAnnotations
      })

      return layers
    },

    /**
     * Open layer window in create state
     */
    createLayer: function(evt) {
      //TODO move to vuex
      EventBus.$emit('active-viewer-action', {
        method: 'openLayerWindow',
        payload: {
          isCreating: true
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .palette-annotations {
    background: #fff;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  h3 {
    margin: 15px 0;
  }

  .annotations-heading {
    align-items: center;
    background: #f7f7f7;
    border-bottom: solid 1px $gray_2;
    display: flex;
    min-height: 33px;
    overflow: hidden;
    width: 100%;
    // @apply(--layout-horizontal);
    // @apply(--layout-center);
  }

  .controls {
    flex: 1;
    margin-left: 10px;
  }

  .controls .inner {
    width: 100px;
  }

  .controls .inner:hover {
    cursor: pointer;
  }

  .visibility {
    margin-right: 10px;
    // @apply(--layout-flex-end);
  }

  .annotation-control {
    height: 20px;
    width: 20px;
    transition: color .15s linear;
  }

  .annotation-control:hover {
    cursor: pointer;
  }

  #annotationWrap {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
  }

  [slot="title"] {
    flex: 1;
    height: 100%;
  }

  iron-icon {
    color: #9B9B9B;
  }
  iron-icon:hover, iron-icon[focused] {
    color: $app-primary-color
  }
  .all-hidden {
    color: #DADADA;
  }
</style>
