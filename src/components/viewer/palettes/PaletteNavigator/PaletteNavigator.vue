<template>
  <div class="palette-navigator">
    <div class="navigator-wrap navigatorWrap palette-section">
      <div id="navigator" />
    </div>

    <bf-zoom-tool
      :zoom.sync="zoom"
      :min="min"
      :max="max"
    />

    <bf-rotate-tool
      class="palette-section"
      :angle="angle"
    />

    <div
      v-show="hasMpp"
      id="ruler"
      class="palette-section"
    >
      <svg-icon
        id="iconRuler"
        name="icon-ruler"
      /> <p class="mb-0">
        Ruler <span v-show="viewerIsMeasuring">
          {{ ruler }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import { propOr, defaultTo, pathOr, compose } from 'ramda'
  import EventBus from '../../../../utils/event-bus'
  import BfRotateTool from '../../../shared/bf-rotate-tool/BfRotateTool.vue';
  import BfZoomTool from '../../../shared/bf-zoom-tool/BFZoomTool.vue'

  const getValue = (prop, obj) => compose(
    defaultTo(0),
    parseFloat,
    propOr(0, prop),
    defaultTo({})
  )(obj)

  export default {
    name: 'PaletteNavigator',

    components: {
      BfRotateTool,
      BfZoomTool
    },

    data: function() {
      return {
        zoomSlider: 0,
        min: 0,
        max: 200,
        angle: 0,
        zoom: 0
      }
    },

    computed: {
      ...mapGetters('viewer', ['viewerMpp']),
      ...mapState('viewer', ['viewerSlideInfo']),

      /**
       * Compute if the slide viewer has the MPP property to enable zooming
       * @returns {Boolean}
       */
      hasMpp: function() {
        return propOr(false, this.viewerMpp)
      },

      /**
       * Compute if the user is currently
       * measuring in the slide viewer
       * @returns {Boolean}
       */
      viewerIsMeasuring: function() {
        return propOr(false, 'isMeasuring', this.viewerSlideInfo)
      },


      /**
       * Compute ruler length
       * @returns {String}
       */
      ruler: function() {
        return this.viewerIsMeasuring
          ? defaultTo('', this.viewerSlideInfo.measureLength)
          : ''
      },

      /**
       * Compute value to zoom by
       * @returns {Number}
       */
      zoomBy: function() {
        return propOr(0, 'zoomPerClick', this.viewerSlideInfo)
      }
    },

    watch: {
      angle: {
        handler: function(val) {
          EventBus.$emit('active-viewer-action', {
            method: 'rotateCallback',
            payload: this.angle
          })
        },
        immediate: true
      },
      'viewerSlideInfo.curZoom': function() {
        this.zoom = this.computeZoom()
      },
      'viewerSlideInfo.curRotation': function(val) {
        this.angle = defaultTo(0, val)
      }
    },

    /**
     * Vue lifecycle method
     * Import required Polymer components
     */
    mounted: function() {
      EventBus.$on('change-viewer-angle', this.setAngle.bind(this))
      EventBus.$on('change-slider-zoom', this.setZoomSlider.bind(this))
      EventBus.$on('update-value', this.updateSelectedValue.bind(this))
      EventBus.$on('change-zoom-scale', this.setZoom.bind(this))
      EventBus.$on('zoom-fit-on-screen', this.onZoomFitOnScreen.bind(this))
    },

    methods: {
      /**
       * Compute zoom level
       * @returns {Number}
       */
      computeZoom: function() {
        const curZoom = getValue('curZoom', this.viewerSlideInfo)
        const minZoom = getValue('minZoom', this.viewerSlideInfo)
        const maxZoom = getValue('maxZoom', this.viewerSlideInfo)

        return Math.round(((curZoom - minZoom) * this.max) / (maxZoom - minZoom))
      },
      /**
       * Watch zoomSlider value change from `bf-zoom-tool`
       * and set zoom for the slide viewer
       * @param {Object} val
       */
      setZoomSlider: function(val) {
        const curZoom = getValue('curZoom', this.viewerSlideInfo)
        const minZoom = getValue('minZoom', this.viewerSlideInfo)
        const maxZoom = getValue('maxZoom', this.viewerSlideInfo)

        const zoomValue = (val * (maxZoom - minZoom) / this.max) + minZoom
        this.zoom = Math.round(zoomValue*100)

        EventBus.$emit('active-viewer-action', {
          method: 'zoomTo',
          payload: zoomValue
        })
      },
      /**
       * Updates the value in the zoom/angle dropdowns and inputs
       * from the BfSelectTool component
       * @param {Object} val
       */
      updateSelectedValue: function(val){
        if (val.type === 'zoom'){
          this.setZoomSlider(val.value)
          this.zoom = val.value
        } else {
          this.setAngle(val.value)
          this.angle = val.value
        }
      },

      /**
       * Listen for angle value change from `bf-rotate-tool`
       * and set the angle for the slide viewer
       * @param {Object} evt
       */
      setAngle: function(val) {
        this.angle = val;
      },

      /**
       * Listen for zoom value change from BfZoomTool
       * and set the zoom scale for the slide viewer
       * @param {String} val
       */
      setZoom: function(val) {
        val === 'in' ? this.zoomTo(this.zoomBy / 1.0) : this.zoomTo(1.0 / this.zoomBy)
      },

      /**
       * Zoom in listener
       */
      zoomIn: function() {
        this.zoomTo(this.zoomBy / 1.0)
      },

      /**
       * Zoom out listener
       */
      zoomOut: function() {
        this.zoomTo(1.0 / this.zoomBy)
      },

      /**
       * Zoom in or out
       * @param {Number} zoom
       */
      zoomTo: function(zoom) {
        // to show the zoom scale as a percentage rather than a decimal
        this.zoom = zoom*100
        EventBus.$emit('active-viewer-action', {
          method: 'navigatorZoom',
          payload: zoom
        })
      },

      /**
       * Fit the viewer on screen
       */
      onZoomFitOnScreen: function() {
        EventBus.$emit('active-viewer-action', {
          method: 'fitOnScreen'
        })
        this.zoom = this.computeZoom()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';
  .palette-navigator {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  #ruler {
    align-items: center;
    display: flex;
    font-size: 12px;
    line-height: 1;
  }

  #iconRuler {
    margin-right: 5px;
  }

  .navigator-wrap {
    box-sizing: border-box;
    height: 224px;
    padding: 5px;
  }

  .palette-section {
    border-bottom: 1px solid $light-gray;
    padding: 10px 5px;
    width: 100%;
  }

  .palette-section:last-child {
    border: none;
  }
</style>

<style lang="scss">
  @import '../../../../assets/_variables.scss';
  .palette-navigator {
    #navigator-displayregion {
      border: 2px solid $synapse !important;
    }
    .navigator {
      background: #dedede;
      height: 100%;
      width: 100%;
    }
  }
</style>
