<template>
  <div
    ref="ts_viewer"
    class="timeseries-viewer"
  >
    <timeseries-scrubber
      ref="scrubber"
      :ts_start="ts_start"
      :ts_end="ts_end"
      :c-width="cWidth"
      :label-width="labelWidth"
      :cursor-loc="cursorLoc"
      :start="start"
      :duration="duration"
      :constants="constants"
      @setStart="updateStart"
    />

    <div id="channelCanvas">
      <!-- Channel labels -->
      <div
        id="channelLabels"
        ref="channelLabels"
      >
        <div
          v-for="item in viewerChannels"
          v-if="item.visible"
          :key="item.label"
        >
          <div
            class="chLabelWrap"
            :data-id="item.id"
            @tap="onLabelTap"
          >
            <div class="labelDiv">
              {{ item.label }}
            </div>
            <div
              class="chLabelIndWrap"
              :hidden="hideLabelInfo"
              :selected="item.selected"
            >
              <div
                class="chLabelInd"
                :hidden="hideLabelInfo"
              >
                {{ _computeLabelInfo(item, globalZoomMult, item.rowScale) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeseries viewport -->
      <timeseries-viewer-canvas
        ref="viewerCanvas"
        :window_height="window_height"
        :window_width="window_width"
        :duration="duration"
        :start="start"
        :c-width="cWidth"
        :c-height="cHeight"
        :constants="constants"
        :ts-start="ts_start"
        :ts-end="ts_end"
        :cursor-loc="cursorLoc"
        :global-zoom-mult="globalZoomMult"
        @setStart="updateStart"
        @setCursor="setCursor"
        @setGlobalZoom="setGlobalZoom"
        @setDuration="setDuration"
        @channelsInitialized="onChannelsInitialized"
        @annLayersInitialized="onAnnLayersInitialized"
        @closeAnnotationLayerWindow="onCloseAnnotationLayerWindow"
        @addAnnotation="onOpenAnnotationWindow"
        @updateAnnotation="onUpdateAnnotation"
      />
    </div>

    <timeseries-viewer-toolbar
      :constants="constants"
      :duration="duration"
      :start="start"
      @pageBack="onPageBack"
      @pageForward="onPageForward"
      @incrementZoom="onIncrementZoom"
      @decrementZoom="onDecrementZoom"
      @updateDuration="onUpdateDuration"
      @nextAnnotation="onNextAnnotation"
      @previousAnnotation="onPreviousAnnotation"
      @setStart="updateStart"
    />

    <timeseries-filter-modal
      ref="filterWindow"
      :filter-window-open="filterWindowOpen"
      @closeWindow="onCloseFilterWindow"
    />

    <timeseries-annotation-modal
      ref="annotationModal"
      :visible.sync="annotationWindowOpen"
      @closeWindow="onCloseAnnotationWindow"
      @createUpdateAnnotation="onCreateUpdateAnnotation"
    />

    <timeseries-annotation-layer-modal
      ref="layerModal"
      :annotation-layer-window-open="annotationLayerWindowOpen"
      @closeWindow="onCloseAnnotationLayerWindow"
      @createLayer="onCreateAnnotationLayer"
    />

    <ts-annotation-delete-dialog
      :visible.sync="isTsAnnotationDeleteDialogVisible"
      :delete-annotation.sync="annotationDelete"
      @delete="deleteAnnotation"
    />


  </div>
</template>

<script>
    import {
        mapState
    } from 'vuex'

    import {
        head,
        pathOr,
        propOr,
        isEmpty
    } from 'ramda'

    import ViewerActiveTool from '@/mixins/viewer-active-tool'
    import Request from '@/mixins/request'
    import TsAnnotation from '@/mixins/ts-annotation'

    export default {
        name: 'TimeseriesViewer',

        components:{
            'timeseries-scrubber': () => import('@/components/viewers/TSViewer/TSScrubber.vue'),
            'timeseries-viewer-canvas': () => import('@/components/viewers/TSViewer/TSViewerCanvas.vue'),
            'timeseries-viewer-toolbar': () => import('@/components/viewers/TSViewer/TSViewerToolbar.vue'),
            'timeseries-filter-modal': () => import('@/components/viewers/TSViewer/TSFilterModal.vue'),
            'timeseries-annotation-layer-modal': () => import('@/components/viewers/TSViewer/TSViewerLayerWindow.vue'),
            'ts-annotation-delete-dialog': () => import('@/components/viewers/TSViewer/TSAnnotationDeleteDialog/TsAnnotationDeleteDialog.vue'),
            'timeseries-annotation-modal': () => import('@/components/viewers/TSViewer/TSAnnotationModal.vue')
        },

        mixins: [
            Request,
            ViewerActiveTool,
            TsAnnotation,
        ],
        watch: {
            viewerSidePanelOpen: {
                handler: function() {
                    // console.log('resized triggered')
                    this.onResize()
                },
                immediate: true
            },
        },
        computed: {
            ...mapState([
                'config',
                'userToken'
            ]),
            ...mapState('viewer', [
                'activeViewer',
                'viewerChannels',
                'viewerSidePanelOpen',
                'viewerAnnotations'
            ]),

            _cpStyleLabels: function(height, nrVisCh) {
              const h = Math.max(1, Math.min(12, (height)/nrVisCh-2));
              return 'font-size:' + h + 'px; height:' + h + 'px';
            },
            hideLabelInfo: function() {
                let hide = false;
                if (this.cHeight/this.nrVisChannels < 30) {
                    hide = true;
                }
                return hide;
            },
            nrVisChannels: function() {
                this.viewerChannels.reduce((accumulator, currentValue) => {
                  if(currentValue.visible) {
                    return accumulator + 1
                  }
                  return accumulator
                }, 0)
            },

        },
        data: function () {
            return {
                constants: {
                      TIMEUNIT: 'microSeconds',   // Basis for time
                      XOFFSET: 0,                 // X-offset of graph in canvas
                      XGRIDSPACING: 1000000,      // Time in microseconds between vertical lines
                      NRPXPERLABEL: 150,          // Number of pixels per label on x-axis
                      USEREALTIME: true,          // If true than interpret timepoints as UTC microseconds.
                      DEFAULTDPI: 96,             // Default pixels per inch
                      ANNOTATIONLABELHEIGHT: 20,  // Height of annotation label
                      ROUNDDATAPIXELS: false,     // If true, canvas point will be rounded to integer pixels for faster render (faster)
                      MINMAXPOLYGON: true,        // If true, then polygon is rendered thru minMax values, otherwise vertical lines (faster)
                      PAGESIZEDIVIDER: 0.5,       // Number of pages that span the current canvas.
                      PREFETCHPAGES: 2,           // Number of pages to read ahead of view.
                      LIMITANNFETCH: 500,         // Maximum number of annotations that are fetched per request
                      USEMEDIAN: false,           // Use Median instead of mean for centering channels
                      CURSOROFFSET: 5,            // Offset of cursor canvas
                      SEGMENTSPAN: 1209600000000, // One week of gap-data is returned per request.
                      MAXRECURSION: 20,           // Maximum recursion depth of gap-data requests (max 2 years)
                      MAXDURATION: 600000000,     // Maximum duration window (5min)
                      INITDURATION: 15000000      // Initial duration window  (15sec)
                  },
                summary: {},
                ts_start: null,
                ts_end: null,
                window_height: 0,
                window_width:0,
                start:0,                // Start Timestamp of viewer in microseconds
                duration: 0,            // Length of data in viewer in microseconds (ignore gaps)
                cWidth: 0,
                cHeight: 0,
                labelWidth:0,
                globalZoomMult: 1,
                cursorLoc: 1/10,
                filterWindowOpen: false,
                annotationWindowOpen: false,
                annotationLayerWindowOpen: false,
                annotationDelete: null,
                isTsAnnotationDeleteDialogVisible: false,
            }
        },

        mounted: function () {
            this.initChannels()
            this.window_height = window.innerHeight - 100;
            this.window_width = this.$refs.ts_viewer.offsetWidth
            window.addEventListener('resize', this.onResize)

            const labelDiv = this.$refs.channelLabels
            this.labelWidth = labelDiv.clientWidth
            this.cWidth = (this.window_width - labelDiv.clientWidth - 5 - 10)
            this.cHeight = (this.window_height - 88)
            this.duration = this.constants['INITDURATION']

        },

        beforeDestroy() {
            window.removeEventListener('resize', this.onResize)
        },

        methods: {
            openEditAnnotationDialog: function(annotation) {
              this.$store.dispatch('viewer/setActiveAnnotation', annotation).then(() =>{
                this.$refs.viewerCanvas.renderAnnotationCanvas()
                this.annotationWindowOpen = true
              })
            },
            onUpdateAnnotation: function(annotation) {
              this.openEditAnnotationDialog(annotation)
            },
            onCreateUpdateAnnotation: function(annotation) {
              this.annotationWindowOpen = false
              if (annotation.id) {
                this.updateAnnotation()
              } else {
                this.addAnnotation()
              }
            },
            onAnnotationUpdated: function() {
              this.$refs.viewerCanvas.renderAnnotationCanvas()
            },
            onOpenAnnotationWindow: function() {
              this.annotationWindowOpen = true
            },
            confirmDeleteAnnotation: function(annotation) {
              this.annotationDelete = annotation
              this.isTsAnnotationDeleteDialogVisible = true
            },
            deleteAnnotation: function(annotation) {
              this.isTsAnnotationDeleteDialogVisible = false
              this.removeAnnotation(annotation)
            },
            onAnnotationDeleted: function() {
              this.$refs.viewerCanvas.renderAnnotationCanvas()
            },
            onAddAnnotation: function (start, duration, onAll, label, description, layer) {
              this.addAnnotation(start, duration, onAll, label, description, layer)
            },
            onAnnotationCreated: function() {
              this.$refs.viewerCanvas.renderAnnotationCanvas()
            },
            onCreateAnnotationLayer: function (newLayer) {
                this.$refs.viewerCanvas.createAnnotationLayer(newLayer)
            },
            onCloseAnnotationLayerWindow: function() {
              this.annotationLayerWindowOpen = false
            },
            onCloseAnnotationWindow: function() {
              this.$refs.viewerCanvas.resetFocusedAnnotation()
              this.$refs.viewerCanvas.renderAnnotationCanvas()
              this.annotationWindowOpen = false
            },
            onCloseFilterWindow: function() {
                this.filterWindowOpen = false
            },
            onLabelTap: function(e) {
                e.stopPropagation();
                e.preventDefault();

                const append = e.detail.sourceEvent.metaKey;
                this.selectChannel({channelId: e.currentTarget.dataset.id, append:append});
                this.$refs.viewerCanvas.renderAll()
            },
            onNextAnnotation: function () {
                this.start  = this.$refs.viewerCanvas.getNextAnnotation()
            },
            onPreviousAnnotation: function () {
                this.start  = this.$refs.viewerCanvas.getPreviousAnnotation()
            },
            onUpdateDuration: function(value) {
                this.setDuration(value * 1e6)
            },
            onIncrementZoom: function () {
                this.globalZoomMult = this.globalZoomMult * 1.25
            },
            onDecrementZoom: function () {
                this.globalZoomMult = this.globalZoomMult * 0.8
            },
            onAnnLayersInitialized: function () {
                this.$refs.scrubber.getAnnotations()
            },
            onChannelsInitialized: function () {
                this.$refs.scrubber.initSegmentSpans()

                // Resize the canvas as label length likely changed
                this.$nextTick(() => {
                    this.onResize()
                })

            },
            onPageBack: function() {
              //TODO: Update logic to track gap over all channels

              let setStart = this.start - (3*this.duration)/4
              let channelOneSegments = this.viewerChannels[0].dataSegments

              let i = 0;
              for(let segment in channelOneSegments) {
                if (channelOneSegments[segment] > setStart) {
                  break
                }
                i++
              }

              // If new page completely in gap --> set start to next timestamp with data
              if(i % 2 == 0) {
                setStart = channelOneSegments[i-1] - 0.5*this.duration
              }

              this.start = setStart
            },
            onPageForward: function() {

                //TODO: Update logic to track gap over all channels
                let setStart = this.start + (3*this.duration)/4
                let channelOneSegments = this.viewerChannels[0].dataSegments

                let i = 0;
                for(let segment in channelOneSegments) {
                  if (channelOneSegments[segment] > setStart) {
                    break
                  }
                  i++
                }

                // If new page completely in gap --> set start to next timestamp with data
                if(i % 2 == 0) {
                  setStart = channelOneSegments[i] - 0.5*this.duration
                }

                this.start = setStart
            },
            selectAnnotation: function(payload) {
              let rsPeriod = this.$refs.viewerCanvas.rsPeriod
              this.updateStart(payload.annotation.start - ((this.cursorLoc*this.cWidth - this.constants['CURSOROFFSET']) * rsPeriod))
            },
            selectChannel: function(payload) {
              const _channels = this.viewerChannels.map(channel => {
                const selected = channel.selected

                if (payload['append'] === false) {
                  channel.selected = false
                }

                if (payload['channelId'] === channel.id) {
                  channel.selected = !selected
                }

                return channel
              })

              this.$store.dispatch('viewer/setChannels', _channels)

            },
            selectChannels: function(ids, append) {
                const channels = this.viewerChannels.map(channel => {
                    if (append === false) {
                        channel.selected = false
                    }
                    if( channel.id in ids) {
                        channel.selected = true
                    }
                    return channel
                })

                this.$store.dispatch('viewer/setChannels', channels)
            },
            updateStart: function(value) {
                // console.log('setting start to: ' + value)
                this.start = value
            },
            setCursor: function(value) {
                // set the cursor location as a fraction of the width of the canvas
                this.cursorLoc = value
            },
            setGlobalZoom: function(value) {
                // console.log('setGlobalZoom')
                this.globalZoomMult = value
            },
            setDuration: function(value) {
                if (value > this.constants['MAXDURATION']) {
                    this.duration = this.constants['MAXDURATION']
                } else {
                    this.duration = value
                }

            },
            getChannelId: function(channel) {
                const isViewingMontage = this.$store.state.viewer.viewerMontageScheme !== 'NOT_MONTAGED'
                let id = propOr('', 'id', channel)
                let list = []
                if (isViewingMontage) {
                    list = id.split('_')
                    id = list.length ? head(list) : id // remove channel name from id
                }
                return id
            },
            onResize(event) {
                if (this.$refs.ts_viewer === undefined) {
                    return
                }

                this.window_height = window.innerHeight - 100;
                this.window_width = this.$refs.ts_viewer.offsetWidth

                const labelDiv = this.$refs.channelLabels;
                this.labelWidth = labelDiv.clientWidth
                this.cWidth = (this.window_width - labelDiv.clientWidth - 16);
                this.cHeight = (this.window_height - 88);
            },
            _computeLabelInfo: function(item, globalZoomMult, rowscale) {
                const n = ( ( (this.constants['DEFAULTDPI'] * window.devicePixelRatio)/(globalZoomMult * rowscale) )/25.4).toFixed(1);
                return n+ ' ' + item.unit + '/mm'
            },
            initChannels: function() {
                const channels = this.activeViewer.channels
                if (channels.length > 0) {
                    // Find Global start and end
                    this.ts_start = channels[0].content.start
                    this.ts_end = channels[0].content.end
                    for (let ic = 1; ic<channels.length; ic++) {
                        const spanStart = this.ts
                        const spanEnd = pathOr(0, ['span', 'end', this.summary])
                        if (channels[ic].content.start < this.ts_start) {
                            this.ts_start = channels[ic].content.start
                        }
                        if (channels[ic].content.end > this.ts_end) {
                            this.ts_end = channels[ic].content.end
                        }
                    }

                    this.start = this.ts_start
                }
            },
            openLayerWindow: function(payload) {
              const layerModal = this.$refs.layerModal
              layerModal.isCreating = payload.isCreating

              if (!payload.isCreating) {
                layerModal.layer = payload.layer
              } else {
                layerModal.layer = {}
                // layerModal.setColorByIndex(this.viewerAnnotations.length % layerModal.colorOptions.length)
              }

              this.annotationLayerWindowOpen = true
            },
            openFilterWindow: function(payload) {

                const channels = propOr([], 'channels', payload);
                const filter = propOr('', 'filter', payload);
                const filterWindow = this.$refs.filterWindow;
                filterWindow.onChannels = channels;

                if (!isEmpty(filter)) {
                    filterWindow.input0 = filter.input0;
                    filterWindow.input1 = filter.input1;

                    for (let i=0; i<filterWindow._filters.length; i++) {
                        if (filterWindow._filters[i].value === filter.type) {
                            filterWindow.selectedFilter = filter.type;
                            break;
                        }
                    }

                    for (let i=0; i<filterWindow._notchValues.length; i++) {
                        if (filterWindow._notchValues[i].value === filter.notchFreq) {
                            filterWindow.selectedNotch = filter.notchFreq;
                            break;
                        }
                    }
                } else {
                    filterWindow.input0 = NaN;
                    filterWindow.input1 = NaN;
                    filterWindow.selectedFilter = null;
                    filterWindow.selectedNotch = null;
                }
                this.filterWindowOpen = true
            },
            setTimeseriesFilters: function(payload) {
                this.$refs.viewerCanvas.setFilters(payload)
            }

        }

    }

</script>

<style lang="scss" scoped>
    @import '../../../assets/_variables.scss';

    .timeseries-viewer {
        display: flex;
        height: 100%;
        flex-direction: column;
    }

    #channelCanvas {
        display: flex;
        background-color: white;
        flex: 1;
    }

    #channelLabels {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        line-height: normal;
        margin-bottom: 40px;
        min-width: 75px;
    }

    .chLabelWrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

    }
    .chLabelIndWrap {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        width: 100%;
        color: #3c54a4;
    }
    .chLabelInd {
        font-size: 0.6em;
        min-width: 70px;
        color: rgb(150,150,150);
        text-align: right;
        white-space: nowrap;
    }
    .labelDiv[selected] {
        color:#295eff; /*#ff9800;/*#358855;*/
    }
    .chLabelIndWrap[selected]{
        color:#295eff; /*#ff9800; /*#358855;*/
    }
    .labelDiv {
        align-self: flex-end;
        white-space: nowrap;
        color: var(--neuron);
    }

</style>