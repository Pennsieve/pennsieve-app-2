<template>
  <div class="palette-annotations">
    <div class="annotations-heading">
      <div class="controls">
        <el-tooltip
          placement="top"
          content="Hide all channels"
          :popper-options="{ boundariesElement: 'window' }"
          :open-delay="300"
        >
          <button @click="createLayer">
            <svg-icon
              name="icon-plus"
              height="20"
              width="20"
            />
            New Layer
          </button>
        </el-tooltip>
      </div>
        <div class="visibility">
          <el-tooltip
          placement="top"
          content="Hide all annotations"
          :popper-options="{ boundariesElement: 'window' }"
          :open-delay="300"
        >
          <button @click="toggleAllGroupsVisibility">
            <svg-icon
              name="icon-eyeball"
              height="20"
              width="20"
            />
          </button>
        </el-tooltip>
      </div>
    </div>

    <div id="annotationWrap">
      <accordion
        v-for="layer in viewerAnnotations"
        :ref="`accordion-${layer.id}`"
        :key="layer.id"
        :title="layer.name"
        :window-height="windowHeight"
        :selected="layer.selected"
        :nr-layers="viewerAnnotations.length"
        icon="blackfynn:chevron-down-small"
        :border-color="layer.hexColor"
        :layer-id="layer.id"
        @selectItem="onLayerSelected(layer.id)"
      >
        <annotation-group
          slot="operations"
          ref="annotationGroup"
          :hide-title="false"
          :layer="layer"
          :orig-label="layer.name"
          :can-crud-annotation="getPermission('editor')"
        />
        <div slot="items">
          <template v-for="annotation in layer.annotations.filter(ann => ann.layer_id === layer.id)">
            <ts-annotation
              v-if="isTimeseriesViewer"
              :ref="`ann-${annotation.id}`"
              :key="annotation.id"
              :annotation="annotation"
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
import {mapActions, mapGetters, mapState} from 'vuex'
import {
  pathEq,
  propOr,
  head
} from 'ramda'

import EventBus from '../../../../utils/event-bus'
import Sorter from '../../../../mixins/sorter'
import ImportHref from '../../../../mixins/import-href'

import Accordion from '../../../shared/Accordion/Accordion.vue'
import AnnotationGroup from './AnnotationGroup.vue'
import TsAnnotation from './TSAnnotation.vue'

export default {
  name: 'PaletteAnnotations',

  components: {
    Accordion,
    AnnotationGroup,
    TsAnnotation
  },

  props: {
    windowHeight: {
      type: Number,
      default: 0
    }
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

    // bf-annotation
    this.importHref('/web-components/src/components/blackfynn/palettes/annotations/bf-annotation.html')

    // bf-viewer-side-panel-empty-state
    this.importHref('/web-components/src/components/blackfynn/data/bf-viewer/bf-viewer-side-panel-empty-state.html')
  },

  methods: {
    onLayerSelected: function(layer_id) {

      // Fold all layers except selected one.
      for (let [key, value] of Object.entries(this.$refs)) {
        if (/^accordion/.test(key) && value[0].layerId !== layer_id) {
          value[0].fold()
        }
      }

      this.$store.dispatch('viewer/setActiveAnnotationLayer', layer_id)
    },
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
      EventBus.$emit('active-viewer-action', {
        method: 'onAnnotationSelect',
        payload: annStart
      })
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
  @import '../../../../assets/_variables.scss';

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
    min-height: 35px;
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
