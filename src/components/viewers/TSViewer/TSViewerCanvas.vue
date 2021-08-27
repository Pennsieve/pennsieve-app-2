<template>
  <div class="timeseries-viewer-canvas">
    <!-- <annotation-popover on-mouseleave="_onPopoverMouseLeave" id="annotationPopover"></annotation-popover> -->

    <div id="canvasWrapper">
      <timeseries-plot-canvas
        ref="plotCanvas"
        :c-width="cWidth"
        :c-height="cHeight"
        :start="start"
        :ts_start="tsStart"
        :ts_end="tsEnd"
        :duration="duration"
        :constants="constants"
        :rs-period="rsPeriod"
        :global-zoom-mult="globalZoomMult"
        @channelsInitialized="channelsInitialized"
        @setGlobalZoom="setGlobalZoom"
      >
        <canvas
          id="axisArea"
          ref="axisArea"
          slot="axisCanvas"
          class="canvas"
          :width="_cpCanvasScaler(cWidth, pixelRatio, 0)"
          :height="_cpCanvasScaler(cHeight, pixelRatio,0)"
          :style="canvasStyle1"
        />
        <canvas
          id="annArea"
          ref="annArea"
          slot="annCanvas"
          class="canvas"
          :width="_cpCanvasScaler(cWidth, pixelRatio, 0)"
          :height="_cpCanvasScaler(pHeight, pixelRatio,0)"
          :style="canvasStyle2"
        />
      </timeseries-plot-canvas>

      <canvas
        id="cursorArea"
        ref="cursorArea"
        class="canvas"
        :width="_cpCanvasScaler(cWidth + 5, pixelRatio, 0)"
        :height="_cpCanvasScaler(cHeight, pixelRatio,0)"
        :style="canvasStyle3"
      />

      <timeseries-annotation-canvas
        ref="annCanvas"
        :c-width="cWidth"
        :c-height="cHeight"
        :constants="constants"
        :annotations-canvas="this.$refs.annArea"
        :pixel-ratio="pixelRatio"
        :rs-period="rsPeriod"
        :start="start"
        :duration="duration"
        :ts-end="tsEnd"
        :pointer-mode="pointerMode"
        @annLayersInitialized="onAnnLayersInitialized"
        @annotationsReceived="onAnnotationsReceived"
        @closeAnnotationLayerWindow="onCloseAnnotationLayerWindow"
      />

      <canvas
        id="iArea"
        ref="iArea"
        class="canvas"
        :width="_cpCanvasScaler(cWidth, pixelRatio, 0)"
        :height="_cpCanvasScaler(cHeight, pixelRatio,0)"
        :style="canvasStyle1"
        tabindex="-1"
        @wheel="_onMouseWheel"
        @mousemove="_onMouseMove"
        @mousedown="_onMouseDown"
        @mouseup="_onMouseUp"
        @mouseout="_onMouseOut"
        @mouseenter="_onMouseEnter"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-case-declarations */
    import {
        mapState
    } from 'vuex'

    import {
        find,
        propEq,
    } from 'ramda'

    import ViewerActiveTool from '@/mixins/viewer-active-tool'
    import Request from '@/mixins/request'

    export default {
        name: 'TimeseriesViewerCanvas',

        components:{
            'timeseries-plot-canvas': () => import('@/components/viewers/TSViewer/TSPlotCanvas.vue'),
            'timeseries-annotation-canvas': () => import('@/components/viewers/TSViewer/TSAnnotationCanvas.vue')
        },

        mixins: [
            Request,
            ViewerActiveTool
        ],

        props: {
            windowHeight: Number,
            windowWidth: Number,
            duration: Number,
            start: Number,
            cHeight: Number,
            cWidth: Number,
            globalZoomMult: Number,
            constants: Object,
            tsStart: Number,
            tsEnd: Number,
            cursorLoc: Number,
        },

        computed: {
            ...mapState([
              'config',
              'userToken'
            ]),
            ...mapState('viewer', [
              'activeViewer',
              'viewerChannels',
              'viewerActiveTool',
              'viewerAnnotations'
            ]),
            pHeight: function() {
                return this.cHeight -20;
            },
            cursorWidth: function() {
                return this.cWidth + this.constants['CURSOROFFSET']
            },
            blurCanvas: function() {
                return this.$refs.blurCanvas
            },
            canvasStyle1: function() {
                return {
                    width: this.cWidth  + 'px',
                    height: this.cHeight + 'px'
                }
            },
            canvasStyle2: function() {
                return {
                    width: this.cWidth  + 'px',
                    height: this.pHeight + 'px'
                }
            },
            canvasStyle3: function() {
                return {
                    width: this.cursorWidth  + 'px',
                    height: this.cHeight + 'px'
                }
            },
        },

        watch: {
            cHeight: function () {
                this.resize()
            },
            cWidth: function () {
                this.resize()
            },
            start: function() {
                this.renderAll()
            },
            duration: function() {
                this.$refs.plotCanvas.invalidate()
                this.updateRsPeriod(this.cWidth, this.duration)
                this.renderAll()
            },
            globalZoomMult: function() {
                this.$nextTick(() => {
                    this.$refs.plotCanvas.throttledDataRender()
                })
            },
            viewerChannels: function () {
                this.$nextTick(() => {
                    this.renderAll()
                })
            }
        },
        data: function () {
            return {
                summary: {},
                rsPeriod:0,
                pageSize:0,
                lastrRsUpdate:0,
                pixelRatio: 1,                   // Pixel Ratio of screen (1 for regular, >1 for high-res screens)
                mouseDown: false,
                resizeClicked: false,
                pointerMode: 'pan',
                trackDirection: false,
                startDragCoord: {x: 0, y: 0},
                actionMode: null,                 // Secondary mode for pointer specific to tsviewer canvas
                defaultLabels: ['Event', 'Artifact', 'Seizure', 'Mark', 'Stim On', 'Stim Off', 'Start', 'Stop'],
                labelSelect: 0
            }
        },

        mounted: function () {
            this.pixelRatio = this.getScreenPixelRatio();

        },

        methods: {
            createAnnotationLayer: function(newLayer) {
                this.$refs.annCanvas.createAnnotationLayer(newLayer)
            },
            getNextAnnotation: function() {
                let cursorOffset = (this.cursorLoc*this.cWidth - this.constants['CURSOROFFSET']) * this.rsPeriod
                let nextAnn = this.$refs.annCanvas.findNextAnnotation(this.start + cursorOffset)
                return nextAnn.start - cursorOffset
            },
            getPreviousAnnotation: function() {
                let cursorOffset = (this.cursorLoc*this.cWidth - this.constants['CURSOROFFSET']) * this.rsPeriod
                let nextAnn = this.$refs.annCanvas.findPreviousAnnotation(this.start + cursorOffset)
                return nextAnn.start - cursorOffset
            },
            onCloseAnnotationLayerWindow: function() {
                this.$emit('closeAnnotationLayerWindow')
            },
            onAnnotationsReceived: function() {
                this.renderAll(100)
            },
            onAnnLayersInitialized: function() {
                this.$emit('annLayersInitialized')
            },
            setGlobalZoom: function(value) {
                this.$emit('setGlobalZoom', value)
            },
            channelsInitialized: function() {
                this.$emit('channelsInitialized')
            },
            _onMouseWheel: function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(e.shiftKey) {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        if (e.deltaY >0) {
                            this.$emit('setDuration', this.duration*1.1 )
                        } else {
                            this.$emit('setDuration', this.duration/1.1 )
                        }
                    }
                }else{
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        if (e.deltaY > 0 ) {
                            this.$emit('setGlobalZoom',this.globalZoomMult*1.2);
                        } else {
                            this.$emit('setGlobalZoom',this.globalZoomMult/1.2);
                        }
                    }



                }
            },
            _onMouseUp: function(e) {
                const iCanvas = this.$refs.iArea;
                const ctx = iCanvas.getContext('2d');
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);

                this.resizeClicked = false;
                this.mouseDown = false;

                switch (this.viewerActiveTool) {
                  case 'pointer':
                    const append = e.metaKey;
                    const yEnd = e.clientY - iCanvas.getBoundingClientRect().top
                    const yStart = this.startDragCoord.y - iCanvas.getBoundingClientRect().top

                    const channels = this.viewerChannels.map(channel => {
                        if (append === false) {
                            channel.selected = false
                        }
                        if( (channel.rowBaseline > yStart && channel.rowBaseline < yEnd) ||
                                (channel.rowBaseline < yStart && channel.rowBaseline > yEnd)) {
                                    channel.selected = true
                        }

                        return channel
                        })

                    this.$store.dispatch('viewer/setChannels', channels)
                    break
                  case 'annotate':
                    let curLIndex = null;
                    for (let i=0; i<this.viewerAnnotations.length; i++) {
                      if (this.viewerAnnotations[i].selected) {
                        curLIndex = i;
                        break;
                      }
                    }

                    // No layers
                    if (curLIndex === null) {
                      return;
                    }

                    const selectedChannels = this.$store.getters['viewer/viewerSelectedChannels']
                    const allChannels = selectedChannels.length === this.viewerChannels.length || selectedChannels.length === 0

                    const duration = (-e.clientX + this.startDragCoord.x) * this.rsPeriod
                    const startTime = this.start +  this.startDragCoord.x * this.rsPeriod
                    this.$emit("addAnnotation", startTime, duration, allChannels, this.defaultLabels[this.labelSelect], '', this.viewerAnnotations[curLIndex] )
                    break;

                }

            },
            _onMouseDown: function(evt) {
                this.mouseDown = true;
                this.startDragTimeStamp = this.start
                this.startDragCoord.x = evt.clientX
                this.startDragCoord.y = evt.clientY

                switch(this.pointerMode) {
                    case 'annResize-left':
                    case 'annResize-right':
                        this.resizeClicked = true;
                        break;
                }
            },
            _onMouseOut: function(e) {
                this.mouseDown = false;
            },
            _onMouseEnter: function(e) {
                if (e.buttons === 1) {
                    this.mouseDown = true;
                } else {
                    this.mouseDown = false;
                }

            },
            _onMouseMove: function(e) {
                e.preventDefault();
                e.stopPropagation();

                this.$refs.iArea.removeAttribute('col_resize');
                this.$refs.iArea.removeAttribute('active');
                this.$refs.iArea.removeAttribute('point');
                this.$refs.iArea.removeAttribute('cursor_hover');


                switch (this.viewerActiveTool) {
                    case 'pan':
                        if( this.mouseDown){
                            // Update StartTime and get new data
                            const setStart = this.startDragTimeStamp - ((e.clientX-this.startDragCoord.x) * this.rsPeriod);
                            this.$emit('setStart', setStart)
                        }

                        break;
                    case 'pointer':
                        this.$refs.iArea.setAttribute('point', "true");
                        if( this.mouseDown){
                            this.renderSelectBox(e.clientX, e.clientY);
                        }

                        break;
                    case 'annotate':
                        this.$refs.iArea.setAttribute('point', "true");
                        if( this.mouseDown) {
                          this.renderAnnotationBox(e.clientX)
                        }
                        break;

                }


            },
            resize: function() {
                this.updateRsPeriod(this.cWidth, this.duration)
                this.renderAll(25)

            },
            updateRsPeriod: function(w, d) {
                const oldRs = this.rsPeriod;
                const newPeriod = (d / w);
                if (newPeriod !== oldRs) {
                    this.invalidateCache = true;
                    this.lastRsUpdate = Date.now();
                    this.rsPeriod = newPeriod;
                    this.pageSize = Math.floor(this.duration / this.constants['PAGESIZEDIVIDER']);
                }
            },
            _cpCanvasScaler: function(sz, pixelRatio, offset) {
                return pixelRatio * (sz + offset);
            },
            renderAll: function(delay, requestLeadingEdge = true) {
                if (!this.renderFnc || delay !== this.renderThrottle || this.requestLeadingEdge !== requestLeadingEdge) {
                    this.renderFnc = this.throttle(this._renderAll, delay, {leading: requestLeadingEdge} );
                    this.renderThrottle = delay;
                    this.requestLeadingEdge = requestLeadingEdge;
                }
                this.renderFnc(this);
            },
            // Returns a function, that, when invoked, will only be triggered at most once
            // during a given window of time. Normally, the throttled function will run
            // as much as it can, without ever going more than once per `wait` duration;
            // but if you'd like to disable the execution on the leading edge, pass
            // `{leading: false}`. To disable execution on the trailing edge, ditto.
            throttle: function(func, wait, options) {
                let context;
                let args;
                let result;
                let timeout = null;
                let previous = 0;
                if (!options) options = {};
                const later = function() {
                    previous = options.leading === false ? 0 : Date.now();
                    timeout = null;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                };
                return function() {
                    const now = Date.now();
                    if (!previous && options.leading === false) previous = now;
                    const remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                    } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            _renderAll: function() {
                this.$nextTick(() => {
                    this._renderAxis();
                    this._renderCursor();
                    this.$refs.plotCanvas.renderAll()
                    this.$refs.annCanvas.render()
                })

            },
           // Render the X and Y axis, and time ticks
            _renderAxis: function() {
                const pa = this.$refs.axisArea;
                const ctx = pa.getContext('2d');
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

                // clear canvas
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.stroke();
                // render side/bottom line
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.moveTo(this.constants.XOFFSET+0.5, 0.5);
                ctx.lineTo(this.constants.XOFFSET+0.5, (this.pHeight +0.5));
                ctx.lineTo(this.cWidth+0.5, (this.pHeight+0.5));
                ctx.stroke();

                // Render y-ticks
                let tickOffset = (((this.pHeight/(2*this.nrVisibleChannels))+0.5)<<1)>>1;
                ctx.lineWidth=0.5;
                for (let i = 0; i< this.nrVisibleChannels; i++) {

                    ctx.beginPath();
                    ctx.moveTo(this.constants.XOFFSET - 2, tickOffset);
                    ctx.lineTo(this.constants.XOFFSET + 2, tickOffset);
                    ctx.stroke();
                    tickOffset += this.pHeight/this.nrVisibleChannels;
                }


                // --- --- --- --- ---
                // Render x-ticks
                const gridSpacing = this.constants['XGRIDSPACING'] * Math.ceil(this.duration / 100000000);
                const nrGridLines = Math.ceil(this.duration / gridSpacing) + 1;
                const labelDecimator = Math.ceil( this.constants['NRPXPERLABEL'] / (gridSpacing / this.rsPeriod));
                let curXLabelIdx = 1;

                // XLOC1 is time to first timeIndicator line
                const xLoc1 = (gridSpacing - (this.start % gridSpacing) ) % gridSpacing;

                // Iterate over all potential time-lines
                for(let i = 0; i < nrGridLines; i++) {

                    // actual time of the timeline = canvas start time + xLoc1 time
                    let realX = this.start + xLoc1 + i * gridSpacing;
                    if (realX > this.tsEnd) {
                        break;
                    }

                    // curLoc is pixel coordinates of realX
                    const realOffset = realX - this.start;
                    const curLoc = ( this.constants['XOFFSET'] + (realOffset / this.rsPeriod) );
                    const roundedCurLoc = Math.round(curLoc);

                    if (roundedCurLoc > 1) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.lineWidth=0.5;
                        ctx.strokeStyle='rgb(235,235,235)';
                        ctx.moveTo(roundedCurLoc + 0.5, 0.5);
                        ctx.lineTo(roundedCurLoc+ 0.5, this.pHeight -0.5);
                        ctx.stroke();
                        ctx.restore();

                        // Render X-Label when appropriate
                        const test = (((realX / gridSpacing) + gridSpacing / 10) % labelDecimator) |0;
                        if( test === 1 || labelDecimator === 1 ) {

                            ctx.beginPath();
                            ctx.lineWidth = 1;
                            ctx.moveTo(roundedCurLoc+ 0.5, this.pHeight - 3);
                            ctx.lineTo(roundedCurLoc+ 0.5, this.pHeight + 3);
                            ctx.stroke();

                            const d = new Date(realX/1000);
                            ctx.font = '12px sans-serif';
                            ctx.fillStyle = 'rgb(150,150,150)';
                            ctx.fillText(this.getUTCTimeString(d), roundedCurLoc - 20.5, this.cHeight-0.2);

                            curXLabelIdx = curXLabelIdx + 1;
                        }
                    }
                }
            },
            // Render the selection box on click-drag using point for selecting channels
            renderSelectBox: function(curX, curY) {
                const iCanvas = this.$refs.iArea;
                const ctx = iCanvas.getContext('2d');
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

                ctx.clearRect(0, 0, this.cWidth, this.cHeight);

                ctx.beginPath();
                ctx.lineWidth=2;
                ctx.strokeStyle='#295eff';
                ctx.setLineDash([5, 5, 15, 5]);

                const xStart = curX - iCanvas.getBoundingClientRect().left;
                const yStart = curY - iCanvas.getBoundingClientRect().top;

                ctx.rect(xStart, yStart, -curX+this.startDragCoord.x, -curY+this.startDragCoord.y);
                ctx.stroke();
            },
            _renderCursor: function() {
                // --- --- --- --- ---
                // Render cursor

                const pa = this.$refs.cursorArea;
                const ctx = pa.getContext('2d');
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
                ctx.clearRect(0, 0, (this.cWidth + this.constants['CURSOROFFSET']), this.cHeight);

                ctx.save()
                ctx.beginPath();
                ctx.fillStyle = 'red';
                const cCursorLoc = this.cursorLoc * this.cWidth
                if (cCursorLoc > this.constants['CURSOROFFSET']) {
                    ctx.strokeStyle = 'red';
                    ctx.moveTo(cCursorLoc, 0);
                    ctx.lineTo(cCursorLoc, this.pHeight);
                    ctx.stroke();
                } else {
                    ctx.moveTo(cCursorLoc, this.pHeight);
                }

                ctx.beginPath();
                ctx.lineTo(cCursorLoc - 5, this.pHeight + 8);
                ctx.lineTo(cCursorLoc + 5, this.pHeight + 8);
                ctx.lineTo(cCursorLoc, this.pHeight );
                ctx.fill();

                ctx.restore();
            },
            // Render an annotation during dragging mouse while creating annotation
            renderAnnotationBox: function(curX) {
              const iCanvas = this.$refs.cursorArea
              const ctx = iCanvas.getContext('2d');
              ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);


              const annotationHeight = this.constants['ANNOTATIONLABELHEIGHT'];
              const halfAnnotationHeight = (annotationHeight/2) |0;

              // Find active layer
              let curLIndex = null;
              for (let i=0; i<this.viewerAnnotations.length; i++) {
                if (this.viewerAnnotations[i].selected) {
                  curLIndex = i;
                  break;
                }
              }

              // No active Layers
              if (curLIndex === null) {
                return;
              }

              ctx.save();
              ctx.clearRect(0, 0, this.cWidth, this.cHeight);
              ctx.lineWidth = 1;

              // Determine if the user is adding annotation to specific channels
              const selectedChannels = this.$store.getters['viewer/viewerSelectedChannels']
              const allChannels = selectedChannels.length === this.viewerChannels.length || selectedChannels.length === 0

              const xStart = curX - iCanvas.getBoundingClientRect().left;
              const dx = -curX + this.startDragCoord.x

              if (allChannels) {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(xStart, 0, dx, this.pHeight);

                ctx.fillStyle = this.viewerAnnotations[curLIndex].color;
                ctx.strokeStyle = ctx.fillStyle;

                let lblStart = xStart -1;
                let lblEnd = dx +2;
                if (dx < 0) {
                  lblStart = xStart +1;
                  lblEnd = dx-2;
                }

                ctx.fillRect(lblStart, 0, lblEnd, annotationHeight);

                ctx.setLineDash([5, 5, 5, 5]);
                ctx.beginPath();
                ctx.moveTo(xStart, annotationHeight);
                ctx.lineTo(xStart, this.pHeight );
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(xStart+dx, annotationHeight);
                ctx.lineTo(xStart+dx, this.pHeight );
                ctx.stroke();
              } else {

                let minOffset = this.cHeight | 0;
                let maxOffset = 0;
                const channelConfig = this.viewerChannels;

                ctx.fillStyle = this.viewerAnnotations[curLIndex].color;
                ctx.strokeStyle=ctx.fillStyle;

                let lblStart = xStart -1;
                let lblEnd = dx +2;
                if (dx < 0) {
                  lblStart = xStart +1;
                  lblEnd = dx-2;
                }

                for (let ch=0; ch< channelConfig.length; ch++) {
                  const curChannelView = channelConfig[ch];
                  if(curChannelView.selected && curChannelView.visible) {
                    const channelOffset = curChannelView.rowBaseline |0;
                    if (channelOffset < minOffset) { minOffset = channelOffset; }
                    if (channelOffset > maxOffset) { maxOffset = channelOffset; }

                    ctx.fillRect(lblStart, channelOffset - halfAnnotationHeight, lblEnd, annotationHeight);

                  }
                }

                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.setLineDash([5, 5, 5, 5]);

                ctx.fillRect(xStart -1, minOffset+halfAnnotationHeight,
                  dx +2, maxOffset-minOffset -annotationHeight);
                ctx.beginPath();
                ctx.moveTo(xStart, minOffset +halfAnnotationHeight);
                ctx.lineTo(xStart, maxOffset-halfAnnotationHeight );
                ctx.moveTo(xStart+dx, minOffset +halfAnnotationHeight);
                ctx.lineTo(xStart+dx, maxOffset -halfAnnotationHeight);
                ctx.stroke();


              }
              ctx.restore();
            },
            getScreenPixelRatio: function() {
                let ctx = this.$refs.iArea.getContext('2d');
                let dpr = window.devicePixelRatio || 1
                let bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

                return dpr / bsr;
            },
            getUTCTimeString: function(d) {
                return ( ('0' + d.getUTCHours()).slice(-2) + ':' +
                    ('0' + d.getUTCMinutes()).slice(-2) + ':' + ('0' + d.getUTCSeconds()).slice(-2) );
            },
            setFilters: function(payload) {

                  let input0 = parseFloat(payload.input0)
                  let input1 = parseFloat(payload.input1)
                  let message = {};
                      switch (payload.filterType) {
                          case 'clear':
                              message = {'channelFiltersToClear':payload.selChannels};
                              break;
                          case 'bandpass':
                              let bp_center = (input0 + input1) / 2;
                              let bp_width = Math.abs( (input1 - input0) / 2 )
                              message = {'filter':payload.filterType, 'filterParameters': [4, bp_center, bp_width], 'channels':payload.selChannels};
                              break;
                          case 'highpass':
                              message = {'filter':payload.filterType, 'filterParameters': [4, input0], 'channels':payload.selChannels};
                              break;
                          case 'lowpass':
                              message = {'filter':payload.filterType, 'filterParameters': [4, input0], 'channels':payload.selChannels};
                              break;
                          case 'bandstop':
                              let bs_width = 10;
                              const bs_center = payload.notchFreq;
                              message = {'filter':payload.filterType, 'filterParameters': [4, bs_center, bs_width], 'channels':payload.selChannels};
                              break;
                          default:
                              return;
                      }

                  this.$refs.plotCanvas.sendFilterMessage(message)

                  for (let i=0; i<payload.selChannels.length; i++) {
                      let channelId = payload.selChannels[i]
                      let channel = find(propEq('id', channelId), this.viewerChannels)

                      if (payload.filterType === 'clear') {
                          channel.filter = {}
                      } else {
                          channel.filter = {
                              type: payload.filterType,
                              input0: input0,
                              input1: input1,
                              notchFreq: payload.notchFreq
                          }
                      }
                      this.$store.dispatch('viewer/updateChannel', channel)
                  }

                  this.$refs.plotCanvas.invalidate();
                  this.renderAll();

              }


          }

    }

</script>

<style lang="scss" scoped>
    @import '../../../assets/_variables.scss';

    .timeseries-viewer-canvas {
        display: flex;
        background-color: white;
        flex: 1;
    }
    #canvasWrapper {
        position: relative;
    }
    #channelCanvas {
        display: flex;
    }
    .canvas {
        position: absolute;
        top: 0;
        left: 0;
        margin-left: 5px;
        cursor: ew-resize;
        outline: none;
    }
    .canvas[active]{
        cursor: pointer;
    }
    .canvas[col_resize]{
        cursor: col-resize;
    }
    .canvas[point]{
        cursor: default;
    }
    .canvas[cursor_hover]{
        cursor: col-resize;
    }
    #cursorArea {
        margin-left: 0;
    }
    #annotationPopover {
        position: absolute;
        opacity: 0;
        display: none;
        top: 75px;
        z-index: 1000;
        left: 400px;
    }

</style>