<template>
  <div class="slide-viewer">
    <div
      ref="dragonWrapper"
      class="openseadragon-wrapper"
    />

    <slide-annotation-dialog
      :visible.sync="isSlideAnnotationDialogVisible"
      :is-creating.sync="isCreatingAnnotation"
      :annotation.sync="annotation"
      @cancel="cancelAnnotation"
      @create-annotation="createAnnotation"
      @edit-annotation="editAnnotation"
    />

    <slide-annotation-delete-dialog
      :visible.sync="isSlideAnnotationDeleteDialogVisible"
      :delete-annotation="annotationDelete"
      @delete="deleteAnnotation"
      @cancel="cancelDeleteAnnotation"
    />

    <slide-layer-dialog
      :visible.sync="isSlideLayerDialogVisible"
      :layer.sync="layer"
      :is-creating.sync="isCreatingLayer"
      @cancel="cancelLayer"
      @create-layer="createLayer"
      @edit-layer="editLayer"
    />

    <slide-layer-delete-dialog
      :visible.sync="isSlideLayerDeleteDialogVisible"
      :layer.sync="layerDelete"
      @delete="deleteLayer"
      @cancel="resetLayerDeleteData"
    />
  </div>
</template>

<script>
  import {
    mapActions,
    mapGetters,
    mapState
  } from 'vuex'
  import {
    compose,
    defaultTo,
    find,
    head,
    pathOr,
    propEq,
    propOr
  } from 'ramda'

  import 'fabric/dist/fabric.js'
  import './lib/openseadragon-custom.js'
  import './lib/bf-openseadragon-fabricjs-overlay.js'
  import './lib/bf-scalebar.js'
  import './lib/bf-openseadragon-viewerinputhook.js'

  import SlideAnnotationDialog from './SlideAnnotationDialog/SlideAnnotationDialog.vue'
  import SlideAnnotationDeleteDialog from './SlideAnnotationDeleteDialog/SlideAnnotationDeleteDialog.vue'
  import SlideLayerDialog from './SlideLayerDialog/SlideLayerDialog.vue'
  import SlideLayerDeleteDialog from './SlideLayerDeleteDialog/SlideLayerDeleteDialog.vue'

  import Request from '@/mixins/request'
  import ViewerActiveTool from '@/mixins/viewer-active-tool'
  import EventBus from '@/utils/event-bus'

  /**
   * Convert value to length with unit
   * @param {Number} value
   * @param {String} unitSuffix
   * @returns {String}
   */
  const getWithUnit = function(value, unitSuffix) {
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + ' m' + unitSuffix
    }
    return value.toFixed(2) + ' μ' + unitSuffix
  }

  /**
   * Get old ID of annotation
   * @param {Object} annotation
   * @returns {String}
   */
  const getOldId = (annotation) => compose(
    propOr('', 'value'),
    defaultTo({}),
    find(propEq('key', 'annID')),
    propOr([], 'attributes')
  )(annotation)

  /**
   * Calculate measure length
   * @param {Object} measureTool
   * @param {Number} mpp
   * @returns {Number}
   */
  const calculateMeasureLength = function(measureTool, mpp) {
    const linePixelsX = measureTool.get('x1') - measureTool.get('x2')
    const linePixelsY = measureTool.get('y1') - measureTool.get('y2')

    const lineMetersX = linePixelsX * mpp
    const lineMetersY = linePixelsY * mpp

    let lineMetersTotal = (lineMetersX * lineMetersX + lineMetersY * lineMetersY)

    lineMetersTotal = Math.sqrt(lineMetersTotal)

    return lineMetersTotal
  }

  /**
   * Parse metadata from annotation
   * @param {Object} annotation
   * @returns {Array}
   */
  const getAnnotationMetadata = (annotation) => {
    return Object.keys(annotation).map(function(key) {
      let value
      if(key !== 'path') {
        value = annotation[key]
      } else {
        value = ''
      }

      return { key, value}
    })
  }

  /**
   * Parse encoded path from annotation
   * @param {Object} annotation
   * @returns {Array}
   */
  const getAnnotationEncodedPath = (annotation) => {
    let encodedPath = []
    for (let i = 0; i < annotation.path.length; i++) {
      const pathObj = {
        elementType: '',
        data: []
      }

      for (let index = 0; index < annotation.path[i].length; index++) {
        if(index === 0) {
          pathObj.elementType = annotation.path[i][index]
        } else {
          pathObj.data.push(annotation.path[i][index])
        }
      }

      encodedPath.push(pathObj)
    }

    return encodedPath
  }

  export default {
    name: 'SlideViewer',

    components: {
      SlideAnnotationDialog,
      SlideAnnotationDeleteDialog,
      SlideLayerDialog,
      SlideLayerDeleteDialog
    },

    mixins: [
      Request,
      ViewerActiveTool
    ],

    data: function () {
      return {
        slideViewer: {},
        overlay: {},
        overlayMeasure: {},
        measureTool: null,
        measureText: null,
        isMeasuring: false,
        isDown: false,
        isSlideAnnotationDialogVisible: false,
        isSlideAnnotationDeleteDialogVisible: false,
        isSlideLayerDialogVisible: false,
        isSlideLayerDeleteDialogVisible: false,
        isCreatingAnnotation: false,
        isCreatingLayer: false,
        annotation: {},
        annotationDelete: {},
        layer: {},
        layerDelete: {}
      }
    },

    computed: {
      ...mapGetters('viewer', [
        'viewerMpp'
      ]),

      ...mapState([
        'config',
        'userToken'
      ]),

      ...mapState('viewer', [
        'activeViewer',
        'viewerAnnotations',
        'viewerSlideInfo'
      ]),

      /**
       * Compute get viewer data URL
       * @returns {String}
       */
      getViewerDataUrl: function () {
        const packageId = pathOr('', ['content', 'id'], this.activeViewer)
        return this.userToken && packageId
          ? `${this.config.apiUrl}/packages/${packageId}/view?api_key=${this.userToken}&includePackages=true&depth=1`
          : ''
      },

      /**
       * Compute get annotations URL
       * @returns {String}
       */
      getAnnotationsUrl: function () {
        const packageId = pathOr('', ['content', 'id'], this.activeViewer)
        return this.userToken && packageId
          ? `${this.config.apiUrl}/packages/${packageId}/annotations?api_key=${this.userToken}`
          : ''
      },
    },

    watch: {
      getViewerDataUrl: {
        handler: function (val) {
          if (val) {
            this.getViewerData()
          }
        },
        immediate: true
      },
      getAnnotationsUrl: {
        handler: function (val) {
          if (val) {
            this.getAnnotations()
          }
        },
        immediate: true
      },
      isMeasuring: function(isMeasuring) {
        const curIsMeasuring = propOr(false, 'isMeasuring', this.viewerSlideInfo)
        if (curIsMeasuring !== isMeasuring) {
          this.$store.dispatch('viewer/updateViewerSlideInfo', {
            isMeasuring
          })
        }
      },
    },

    mounted: function () {
      this.initViewer()
    },

    methods: {
      ...mapActions('viewer', [
        'updateViewerSlideInfo'
      ]),

      /**
       * Get viewer data from API
       */
      getViewerData: function () {
        this.sendXhr(this.getViewerDataUrl)
          .then(response => this.getViewerTileData(response))
          .catch(this.handleXhrError.bind(this))
      },

      /**
       * Get the tile data for the viewer
       * @param {Object} response
       */
      getViewerTileData: function (response) {
        const fileId = compose(
          pathOr('', ['content', 'id']),
          defaultTo({}),
          head
        )(response)
        const packageId = pathOr('', ['content', 'id'], this.activeViewer)
        this.slideViewer.open(`${this.config.apiUrl}/packages/${packageId}/files/${fileId}/presign/slide.dzi?api_key=${this.userToken}`)

        this.slideViewer.tileSource = {
          getTileUrl: function( level, x, y ) {
            return `${this.config.apiUrl}/packages/${packageId}/files/${fileId}/presign/slide_files/${level}/${y}_${x}.jpeg?api_key=${this.userToken}`
          }
        }
      },

      /**
       * Initialize the viewer with openseadragon
       * and all of its options
       */
      initViewer: function () {
        // eslint-disable-next-line
        this.slideViewer = OpenSeadragon({
          element: this.$refs.dragonWrapper,
          showNavigator: false,
          showNavigationControl: false,
          springStiffness: 10,
          blendTime: 0,
          minLevel: 10,
          preserveImageSizeOnResize: true,
          maxZoomPixelRatio: 2
        })

        this.overlay = this.slideViewer.fabricjsOverlay()
        this.overlay.slideViewer = this

        this.overlay.fabricCanvas().isAnnotating = false
        this.overlay.fabricCanvas().isPanning = false

        this.overlayMeasure = this.slideViewer.fabricjsOverlay({selection: false})
        this.overlayMeasure.slideViewer = this
        this.overlayMeasure.fabricCanvas().isMeasuring = false

        // iOS Hack
        this.slideViewer.container.style.height = 'auto'

        this.slideViewer.addViewerInputHook({
          hooks: [{
            tracker: 'viewer',
            handler: 'dragHandler',
            hookHandler: (evt) => {
              const maxZoom = this.slideViewer.viewport.getMaxZoom() / (this.slideViewer.viewport.maxZoomPixelRatio - .1)
              const curZoom = this.slideViewer.viewport.getZoom()

              const transform = this.overlayMeasure._fabricCanvas.viewportTransform

              const pos = {
                x: (1/transform[0])* (evt.position.x - transform[4]),
                y: (1/transform[0])* (evt.position.y - transform[5])
              }

              if(!this.isMeasuring) return

              evt.preventDefaultAction = true

              if(!this.isDown) {

                // Remove old measureTool
                this.overlayMeasure.fabricCanvas().remove(this.measureTool)

                // Remove old measure text
                this.overlayMeasure.fabricCanvas().remove(this.measureText)

                this.isDown = true

                // eslint-disable-next-line
                this.measureTool = new fabric.Line([pos.x, pos.y, pos.x, pos.y], {
                  fill: 'rgba(0,0,0,.65)',
                  stroke: 'rgba(0,0,0,.65)',
                  strokeWidth: 2 * Math.max(1, maxZoom / curZoom),
                  selectable: false,
                  lockScalingX: true,
                  lockScalingY: true,
                  lockUniscaling: true,
                  lockRotation: true,
                  hasBorders: false,
                  hasControls: false,
                  lockMovementX: true,
                  lockMovementY: true,
                  angle: 0,
                  _originalAngle: this.slideViewer.viewport.getRotation(),
                  _originalLeft: 0,
                  _originalTop: 0,
                  type: 'PennsieveMeasureTool',
                })
                this.overlayMeasure.fabricCanvas().add(this.measureTool)

                // Add measure text
                // eslint-disable-next-line
                this.measureText = new fabric.Text('Length', {
                  textBackgroundColor: 'rgba(0,0,0,.65)',
                  left: pos.x + 20,
                  top: pos.y,
                  fill: '#fff',
                  fontSize: 12* Math.max(1, maxZoom / curZoom),
                  lineHeight: 1,
                  fontFamily: 'Roboto, Helvetica, sans-serif',
                  padding: 100,
                  originY: 'center',
                  centeredRotation: false,
                  lockScalingX: true,
                  lockScalingY: true,
                  lockUniscaling: true,
                  lockRotation: true,
                  hasBorders: false,
                  hasControls: false,
                  selectable: false,
                  angle: 0,
                  _originalAngle: this.slideViewer.viewport.getRotation(),
                  _originalLeft: pos.x + 20,
                  _originalTop: pos.y,
                  type: 'PennsieveMeasureText'
                 })

                this.overlayMeasure.fabricCanvas().add(this.measureText)
              } else {
                this.measureTool.set({
                  x2: pos.x,
                  y2: pos.y,
                  _originalLeft: this.measureTool.left + 20,
                  _originalTop: this.measureTool.top
                })

                const measureTextHeight = this.measureText.getHeight() / 2
                const measureLength = getWithUnit(calculateMeasureLength(this.measureTool, this.viewerMpp), 'm')

                this.$store.dispatch('viewer/updateViewerSlideInfo', {
                  measureLength
                })

                // move the measure text
                this.measureText.set({
                  left: pos.x + 20,
                  top: pos.y - measureTextHeight,
                  _originalLeft: pos.x,
                  _originalTop: pos.y - measureTextHeight,
                  text: measureLength
                })
              }
              this.overlayMeasure._fabricCanvas.renderAll()
            }
          }, {
            tracker: 'viewer',
            handler: 'dragEndHandler',
            hookHandler: () => {
              this.isDown = false
            }
          }]
        })

        this.slideViewer.scalebar({
          minWidth: '100px',
          color: 'grey',
          stayInsideImage: false
        })

        this.slideViewer.addHandler('zoom', this.onZoom, this)
        this.slideViewer.addHandler('pan', this.onPan, this)
        this.slideViewer.addHandler('rotate', this.onRotate, this)
        this.slideViewer.addHandler('open', this.onOpen, this)
        this.slideViewer.addHandler('resize', this.updateState, this)

        // this.setPointer()

        if (this.activeViewerMpp) {
          this.setScalebar(this.activeViewerMpp)

          this.$store.dispatch('viewer/updateViewerSlideInfo', {
            hasMpp: true
          })
        } else {
          this.$store.dispatch('viewer/updateViewerSlideInfo', {
            hasMpp: false
          })
        }

        this.resetPalette()

        this.initNavigator()

        this.$store.watch(state => state.viewer.viewerSidePanelView, this.redrawSlideViewer.bind(this))
      },

      /*
       * Set the MPP and enable zoom
       * @param {String} mpp
       */
      setScalebar: function(mpp) {
        let zm
        if(mpp !== null) {
          zm = 1e6 / mpp
        } else {
          zm = null
        }

        this.slideViewer.scalebar({
          pixelsPerMeter: zm
        })
      },

      /**
       * Clear the palette container to get ready for the new one
       */
      resetPalette: function() {
        const navigatorWrap = document.querySelector(`.palette-navigator .navigatorWrap`)

        if (navigatorWrap) {
          navigatorWrap.innerHTML = `<div id="navigator"></div>`
        }
      },

      /**
       * Initialize the navigator if the viewer is active
       */
      initNavigator: function() {
        const navigator = document.querySelector(`.palette-navigator #navigator`)

        if(!this.slideViewer.navigator) {
          // eslint-disable-next-line
          this.slideViewer.navigator = new OpenSeadragon.Navigator({
            element: navigator,
            viewer: this.slideViewer,
            width: 311,
            height: 224,
            autoResize: false,
            navigatorRotate: true
          })
        }
      },

      /**
       * Redraw opensedragon viewer and update size of navigator
       * This ensures that the navigator is up to date with the viewer
       */
      redrawSlideViewer: function(viewerSidePanelView) {
        const viewer = defaultTo({}, this.slideViewer)
        if (viewerSidePanelView === 'navigator' && Object.keys(viewer).length >= 0 && viewer.navigator) {
          this.slideViewer.navigator.updateSize()
          this.slideViewer.forceRedraw()
        }
      },
      /**
      * Event handler for zoom funcionality
      * @param {Object} e
      */
      onZoom: function(evt) {
        evt.eventSource.gestureSettingsMouse.scrollToZoom = true
        evt.eventSource.gestureSettingsMouse.clickToZoom = true
        evt.eventSource.gestureSettingsTouch.scrollToZoom = true
        evt.eventSource.gestureSettingsTouch.clickToZoom = true

        if (this.overlay) {
          this.overlay.resizecanvas()
          this.overlay.resize()
        }

        this.$emit('ZoomMessage', {value: evt.zoom, center: this.slideViewer.viewport.getCenter() })

        if(this.overlayMeasure.fabricCanvas().getObjects().length && this.measureText !== null && this.measureTool !== null) {
          const maxZoom = this.slideViewer.viewport.getMaxZoom() / (this.slideViewer.viewport.maxZoomPixelRatio - .1)
          const curZoom = this.slideViewer.viewport.getZoom()
          this.measureText.set({fontSize: 12* Math.max(1, maxZoom / curZoom)})
          this.measureTool.set({strokeWidth: 2* Math.max(1, maxZoom / curZoom)})
        }

        this.$store.dispatch('viewer/updateViewerSlideInfo', {
          curZoom: evt.zoom
        })
      },

      /**
       * On Pan, emit event
       * @param {Object] evt}
       */
      onPan: function(evt) {
        this.$emit('PanMessage', {center: evt.center})
      },

      /**
       * On rotate, update State
       * @param {Object] evt}
       */
      onRotate: function(evt) {
        this.$emit('RotateMessage', {angle: evt.degrees})

        this.$store.dispatch('viewer/updateViewerSlideInfo', {
          curRotation: evt.degrees
        })
      },

      /**
       * Reset viewer state on open
       * @param {Object} evt
       */
      onOpen: function(evt) {
        this.updateState(evt, true)
      },

      /**
       * Update viewer state
       * @param {Object} evt
       * @param {Boolean} onOpen
       */
      updateState: function(evt, onOpen) {
        const viewport = propOr({}, 'viewport', this.slideViewer)

        if (viewport) {
          let state = {
            curZoom: viewport.getZoom(),
            minZoom: viewport.getMinZoom(),
            maxZoom: viewport.getMaxZoom(),
            zoomPerClick: propOr(0, 'zoomPerClick', this.slideViewer),
            curRotation: viewport.getRotation()
          }

          // Reset measure length and isMeasuring when opening
          if (onOpen) {
            state = Object.assign({}, state, {
              measureLength: 0,
              isMeasuring: false
            })
          }
          this.$store.dispatch('viewer/updateViewerSlideInfo', state)
        }
      },

      /**
       * Set annotation mode for viewer
       */
      setAnnotationMode: function() {
        if (!this.slideViewer) {
          return
        }
        this.slideViewer.setMouseNavEnabled(false)
        this.overlay.fabricCanvas().isDrawingMode = false
        this.overlay.fabricCanvas().isAnnotating = true
        this.isMeasuring = false
        this.overlayMeasure.fabricCanvas().remove(this.measureTool)
        this.overlayMeasure.fabricCanvas().remove(this.measureText)
        this.overlayMeasure.fabricCanvas().isMeasuring = false
        this.overlay.fabricCanvas().isPanning = false
        this.setSelectableFabric(true)
      },

      /**
       * Set pan mode for viewer
       */
      setPan: function() {
        if (!this.slideViewer) {
          return
        }
        this.slideViewer.setMouseNavEnabled(true)
        this.overlay.fabricCanvas().isDrawingMode = false
        this.overlay.fabricCanvas().isAnnotating = false
        this.overlay.fabricCanvas().isPanning = true

        this.setSelectableFabric(false)

        this.isMeasuring = false
        this.overlayMeasure.fabricCanvas().isMeasuring = false
      },

      /**
       * Set pointer mode for viewer
       */
      setPointer: function() {
        if (Object.keys(this.slideViewer).length === 0 && Object.keys(this.overlay).length === 0) {
          return
        }
        this.overlayMeasure.fabricCanvas().remove(this.measureTool)
        this.overlayMeasure.fabricCanvas().remove(this.measureText)

        this.slideViewer.setMouseNavEnabled(true)
        this.overlay.fabricCanvas().isCircleMode = false
        this.overlay.fabricCanvas().isDrawingMode = false
        this.overlay.fabricCanvas().isAnnotating = false
        this.overlay.fabricCanvas().isPanning = false
        this.overlay.fabricCanvas().isMeasuring = false
        this.isMeasuring = false
        this.setSelectableFabric(true)
      },

      /**
       * Set selectable option for fabric
       */
      setSelectableFabric: function(option) {
        this.overlay.fabricCanvas().getObjects().forEach(function(obj) {
          obj.selectable = option
        })
      },

      /**
       * Set annotation shape mode for viewer
       */
      setAnnotationShape: function() {
        if (!this.slideViewer) {
          return
        }
        this.isMeasuring = false
        this.overlayMeasure.fabricCanvas().remove(this.measureTool)
        this.overlayMeasure.fabricCanvas().remove(this.measureText)
        this.overlayMeasure.fabricCanvas().isMeasuring = false

        this.overlay.fabricCanvas().isAnnotating = false
        this.overlay.fabricCanvas().isDrawingMode = false
        this.overlay.fabricCanvas().isCircleMode = true
        this.overlay.fabricCanvas().isPanning = false
        this.slideViewer.setMouseNavEnabled(false)
        // eslint-disable-next-line
        this.overlay.fabricCanvas().freeDrawingBrush = new fabric.BlackfynnBrush(this.overlay.fabricCanvas())

        this.setSelectableFabric(true)

        const maxZoom = this.slideViewer.viewport.getMaxZoom() / (this.slideViewer.viewport.maxZoomPixelRatio - .1)
        const curZoom = this.slideViewer.viewport.getZoom()
        this.overlay.fabricCanvas().freeDrawingBrush.width = Math.max(3, maxZoom / curZoom)
      },

      /**
       * Set annotation draw mode for viewer
       */
      setAnnotationDraw: function() {
        if (!this.slideViewer) {
          return
        }
        // Load annotations component
        this.isMeasuring = false
        this.overlayMeasure.fabricCanvas().remove(this.measureTool)
        this.overlayMeasure.fabricCanvas().remove(this.measureText)
        this.overlayMeasure.fabricCanvas().isMeasuring = false

        this.overlay.fabricCanvas().isCircleMode = false
        this.overlay.fabricCanvas().isAnnotating = false
        this.overlay.fabricCanvas().isDrawingMode = true
        this.overlay.fabricCanvas().isPanning = false
        this.slideViewer.setMouseNavEnabled(false)
        // eslint-disable-next-line
        this.overlay.fabricCanvas().freeDrawingBrush = new fabric.BlackfynnBrush(this.overlay.fabricCanvas())

        this.setSelectableFabric(true)

        const maxZoom = this.slideViewer.viewport.getMaxZoom() / (this.slideViewer.viewport.maxZoomPixelRatio - .1)
        const curZoom = this.slideViewer.viewport.getZoom()
        this.overlay.fabricCanvas().freeDrawingBrush.width = Math.max(3, maxZoom / curZoom)
      },

      /**
       * Set measure mode for viewer
       */
      setMeasure: function() {
        if (!this.slideViewer) {
          return
        }
        // Toggle measuring flag
        this.isMeasuring = true
        this.overlayMeasure.fabricCanvas().isMeasuring = true

        this.overlay.fabricCanvas().isDrawingMode = false
        this.overlay.fabricCanvas().isAnnotating = false
        this.overlay.fabricCanvas().isPanning = false
        this.setSelectableFabric(false)

        this.slideViewer.setMouseNavEnabled(true)
      },

      /**
       * Get annotations and set state
       */
      getAnnotations: function() {
        this.sendXhr(this.getAnnotationsUrl)
          .then(response => {
            const annotations = propOr({}, 'annotations', response)
            const layers = propOr([], 'layers', response)

            if (!layers.length) {
              const packageId = pathOr('', ['content', 'id'], this.activeViewer)
              // crete default layer if one doesn't exist
              this.createLayer({
                name: 'Default',
                annotatedItem: packageId,
                color: '#18BA62'
              })
            } else {
              for (let layer of layers) {
                layer.annotations = annotations[layer.id] || []

                if (!layer.color) {
                  layer.color = '#18BA62'
                }
                layer.hexColor = layer.color
              }

              this.$store.dispatch('viewer/setAnnotations', layers)

              this.addAnnotationsToOverlay(response.annotations)
            }
          })
          .catch(this.handleXhrError.bind(this))
      },


      /**
       * Add annotations to overlay
       * @param {Array}
       */
      addAnnotationsToOverlay: function(annotations) {
        this.overlay.addAnnotationFromJSON(annotations)
      },

      /**
       * Create annotation
       * @param {Object} annotation
       */
      createAnnotation: function(annotation) {
        const metadata = annotation
          ? getAnnotationMetadata(annotation)
          : []

        const encodedPath = annotation.path
          ? getAnnotationEncodedPath(annotation)
          : ''

        const packageId = pathOr('', ['content', 'id'], this.activeViewer)
        const body = {
          layerId: annotation.newLayerId,
          description: annotation.description,
          annotatedItem: packageId,
          path: encodedPath,
          properties: metadata
        }

        const url = `${this.config.apiUrl}/annotations?api_key=${this.userToken}`

        this.sendXhr(url, {
          method: 'POST',
          body
        })
          .then(response => {
            this._handleCreateAnnotation(response)
          })
          .catch(this.handleXhrError.bind(this))
      },

      /**
       * Create annotation endpoint callback
       * @param {Object} response
       */
      _handleCreateAnnotation: function(response) {
        const annotation = propOr({}, 'annotation', response)
        const layers = this.viewerAnnotations
        const layerIndex = layers.findIndex(layer => layer.id === annotation.layer_id)

        if (layerIndex === -1) {
          return
        }

        const layer = layers[layerIndex]

        this.$store.dispatch('viewer/createAnnotation', annotation)

        const newId = propOr('', 'id', annotation)

        const oldId = getOldId(annotation)
        const existingAnnotation = this.overlay.getAnnotationByUuid(oldId)

        existingAnnotation.set({
          annID: newId,
          layerId: layer.id,
          stroke: layer.color,
          fill: this.overlay.getRGBA(layer.color)
        })
        this.overlay._fabricCanvas.renderAll()

        this.resetAnnotationData()
      },

      /**
       * Set edit annotation mode
       * @param {Object} payload
       */
      setEditAnnotationMode: function(payload) {
        const annotation = propOr({}, 'annotation', payload)

        this.isSlideAnnotationDialogVisible = true
        this.annotation = annotation
      },

      /**
       * Call edit annotation endpoint
       * @param {Object} annotation
       */
      editAnnotation: function(annotation) {
        const description = propOr('', 'description', annotation)
        const layerId = propOr('', 'newLayerId', annotation)
        const body = {
          description,
          layerId
        }

        const annotationId = propOr('', 'id', annotation)
        const url = `${this.config.apiUrl}/annotations/${annotationId}?api_key=${this.userToken}`
        this.sendXhr(url, {
          method: 'PUT',
          body
        })
          .then(response => {
            this._handleEditAnnotation(annotation, response)
          })
      },

      /**
       * Edit annotation endpoint callback
       * @param {Object} originalAnnotation
       * @param {Object} response
       */
      _handleEditAnnotation: function(originalAnnotation, response) {
        const annotation = propOr({}, 'annotation', response)

        if (originalAnnotation.newLayerId !== originalAnnotation.layer_id) {
          this.$store.dispatch('viewer/createAnnotation', annotation)
            .then(() => {
              this.$store.dispatch('viewer/deleteAnnotation', originalAnnotation)
            })

          // update canvas
          const layers = this.viewerAnnotations
          const layerIndex = layers.findIndex(layer => layer.id === originalAnnotation.newLayerId)
          const layer = layers[layerIndex]

          const fabricAnn = this.overlay.getAnnotationByUuid(annotation.id)

          if (fabricAnn) {
            fabricAnn.set({
              annID: annotation.id,
              layerId: layer.id,
              stroke: layer.color,
              fill: this.overlay.getRGBA(layer.color)
            })
          }
          this.overlay._fabricCanvas.renderAll()
        } else {
          this.$store.dispatch('viewer/updateAnnotation', annotation)
        }

        this.resetAnnotationData()
      },

      /**
       * On cancel callback from dialog
       * Reset annotation data and remove annotation from viewer
       */
      cancelAnnotation: function() {
        const annotationId = propOr('', 'annID', this.annotation)
        this.overlay.removeAnnotation(annotationId)
        this.resetAnnotationData()
      },

      /**
       * Reset annotation data to original state
       */
      resetAnnotationData: function() {
        this.annotation = {}
        this.isCreating = false
        this.isSlideAnnotationDialogVisible = false
      },

      /**
       * Handles confirm-delete-annotation event and launches delete confirmation window
       * @param {Object} payload
       */
      confirmDeleteAnnotation: function(payload) {
        this.annotationDelete = payload
        this.isSlideAnnotationDeleteDialogVisible = true
      },

      /**
       * Remove individual annotation
       */
      deleteAnnotation: function() {
        const annotationId = pathOr(0, ['annotation', 'id'], this.annotationDelete)
        const withDiscussions = propOr(false, 'withDiscussions', this.annotationDelete)

        const url = `${this.config.apiUrl}/annotations/${annotationId}?api_key=${this.userToken}&withDiscussions=${withDiscussions}`

        fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-type': 'application/json'
          }
        })
          .then(response => {
            const {status, statusText} = response
            if (status >= 400) {
              throw new Error(statusText)
            }
            return response.json()
          })
          .then(() => {
            const annotation = propOr({}, 'annotation', this.annotationDelete)
            this.$store.dispatch('viewer/deleteAnnotation', annotation)
              .then(() => {
                // Find annotation on canvas and remove it
                try {
                  this.overlay.removeAnnotation(annotationId)
                  EventBus.$emit('toast', {type: 'MESSAGE', msg: 'Annotation deleted'})
                } catch(ex) {
                  EventBus.$emit('toast', {type: 'MESSAGE', msg: 'There was an error'})
                }

                this.isSlideAnnotationDeleteDialogVisible = false
              })
          })
          .catch(() => {
            const payload = Object.assign({}, this.annotationDelete, { withDiscussions: true })
            this.confirmDeleteAnnotation(payload)
          })
      },

      /**
       * Cancel delete annotation
       */
      cancelDeleteAnnotation: function() {
        this.annotationDelete = {}
        this.isSlideAnnotationDeleteDialogVisible = false
      },

      /**
       * Hide / Show annotations in the canvas
       */
      updateCanvasLayers: function() {
        if (this.slideViewer) {
          const canvas = this.overlay.fabricCanvas()
          const annotations = canvas.getObjects()
          const layers = this.viewerAnnotations

          // loop through each layer
          layers.forEach(layer => {
            // get annotations for current layer
            const layerAnnotations = annotations.filter(ann => ann.layerId === layer.id)
            // set opacity for all annotations in layer to 0
            layerAnnotations.forEach(ann => {
              // using false comparison as layers don't have visible property by default
              const opacity = layer.visible === false ? 0 : 1
              ann.set({ opacity })

              // Update colors
              const fillColor = this.overlay.getRGBA(layer.color)
              ann.set({
                stroke: layer.color,
                fill: fillColor
              })
            })
          })
          // render annotations
          this.overlay._fabricCanvas.renderAll()
        }
      },

      /**
       * Rotate to a specific angle
       * @param {Number} angle
       */
      rotateCallback: function(angle) {
        const val = defaultTo(0, angle)
        if (this.slideViewer.viewport.getRotation() !== val) {
          this.slideViewer.viewport.setRotation(val)
          this.overlay.setRotation(val)
          this.overlayMeasure.setRotation(val)
        }
      },

      /**
       * Set the viewer back to its original zoom
       */
      zoomToFull: function() {
        this.viewport.zoomTo(1)
      },

      /**
       * Zoom to a level and constrain the viewport
       * Event listener from palette
       * @param {Number} zoom
       */
      navigatorZoom: function(zoom) {
        const viewport = this.slideViewer.viewport

        viewport.zoomBy(zoom)
        viewport.applyConstraints()
      },

      /**
       * Zoom to a specific level
       * @param {Number} zoomLevel
       */
      zoomTo: function(zoomLevel) {
        this.slideViewer.viewport.zoomTo(zoomLevel)
      },

      /**
       * Fit the slide viewer on screen
       */
      fitOnScreen: function() {
        this.slideViewer.viewport.goHome()
      },

      /**
       * Open layer window
       * @param {Object} payload
       */
       openLayerWindow: function(payload) {
        const isCreating = propOr(false, 'isCreating', payload)

        this.isCreatingLayer = isCreating
        if (!isCreating) {
          const layer = propOr({}, 'layer', payload)
          this.layer = layer
        }

        this.isSlideLayerDialogVisible = true
      },

      /**
       * Create layer
       * @param {Object} layer
       */
      createLayer: function(layer) {
        const url = `${this.config.apiUrl}/annotations/layer?api_key=${this.userToken}`
        const packageId = pathOr('', ['content', 'id'], this.activeViewer)

        this.sendXhr(url, {
          method: 'POST',
          body: {
            name: layer.name,
            annotatedItem: packageId,
            color: layer.color
          }
        })
          .then(response => {
            const transformedLayer = {
              annotations: [],
              hexColor: response.color
            }

            this.$store.dispatch('viewer/createLayer', Object.assign({}, response, transformedLayer))
              .then(() => {
                if (layer.name === 'Default') {
                  return
                }
                this.resetLayerData()

                EventBus.$emit('toast', {
                  type: 'MESSAGE',
                  msg: `'${layer.name}' Layer Created`
                })
              })
          })
      },

      editLayer: function(layer) {
        const url = `${this.config.apiUrl}/annotations/layer/${layer.id}?api_key=${this.userToken}`

        this.sendXhr(url, {
          method: 'PUT',
          body: {
            name: layer.name,
            color: layer.color
          }
        })
          .then(response => {
            const layer = Object.assign({}, response, { hexColor: response.color })

            this.$store.dispatch('viewer/updateLayer', layer).then(() => {
              this.updateCanvasLayers()
              this.resetLayerData()

              EventBus.$emit('toast', {
                type: 'MESSAGE', msg: `'${layer.name}' Layer Updated`
              })
            })
          })
          .catch(this.handleXhrError.bind(this))
      },

      /**
       * Reset layer data
       */
      resetLayerData: function() {
        this.layer = {}
        this.isCreatingLayer = false
        this.isSlideLayerDialogVisible = false
      },

      /**
       * Cancel delete annotation
       */
      cancelLayer: function() {
        this.layer = {}
        this.isSlideLayerDialogVisible = false
      },

      /**
      * Confirm layer deletion
      * @param {Object} payload
      */
      deleteLayerConfirmation: function(payload) {
        const layer = propOr({}, 'layer', payload)
        this.layerDelete = layer
        this.isSlideLayerDeleteDialogVisible = true
      },

      /**
       * Reset layer delete data
       */
      resetLayerDeleteData: function() {
        this.layerDelete = {}
        this.isSlideLayerDeleteDialogVisible = false
      },

      /**
      * Delete layer
      * @param {Object} layer
      */
      deleteLayer: function(layer) {
        const url = `${this.config.apiUrl}/annotations/layer/${layer.id}?api_key=${this.userToken}`

        this.sendXhr(url, {
          method: 'DELETE'
        })
          .then(() => {
            const layerAnnotations = layer.annotations
            layerAnnotations.forEach(ann => {
              const annotationId = propOr('', 'id', ann)
              this.overlay.removeAnnotation(annotationId)
            })

            this.$store.dispatch('viewer/deleteLayer', layer).then(() => {

              this.resetLayerDeleteData()

              EventBus.$emit('toast', {
                type: 'MESSAGE',
                msg: `'${layer.name}' Layer Deleted`
              })
            })
          })
          .catch(this.handleXhrError.bind(this))
      }
    }
  }
</script>

<style lang="scss" scoped>
.slide-viewer,
.openseadragon-wrapper {
  display: flex;
  flex: 1;
}
</style>
