<template>
    <div class="timeseries-scrubber">
        <div class="dateWrap">
            <div>{{ts_start_str}}</div>
            <div>{{fullDateStr}}</div>
            <div>{{ts_end_str}}</div>
        </div>
        <div class="noselect">
            <div id="scrubber" noselect>
                <div id="canvasWrap" ref="canvasWrap">
                    <canvas id="segmentsCanvas" class="canvas" ref="segmentsCanvas" 
                        :width="_cpCanvasScaler(cWidth, pixelRatio,0)" 
                        :height="_cpCanvasScaler(viewportHeight-2, pixelRatio,0)"
                        :style="canvasStyle"></canvas>
                    <canvas id="annotationCanvas" class="canvas" ref="annotationCanvas" 
                        :width="_cpCanvasScaler(cWidth, pixelRatio, 0)" 
                        :height="_cpCanvasScaler(viewportHeight-2, pixelRatio,0)"
                        :style="canvasStyle"></canvas>
                    <canvas id="iCanvas" class="canvas" ref="iCanvas" :width="_cpCanvasScaler(cWidth, pixelRatio, 0)" :height="_cpCanvasScaler(viewportHeight, pixelRatio,0)" 
                        v-on:tap="_onTap" 
                        v-on:mousemove="_onMouseMove" 
                        v-on:mousedown="_onMouseDown" 
                        v-on:mouseup="_onMouseUp" 
                        v-on:mouseenter="_onMouseEnter" 
                        v-on:mouseout="_onMouseOut"
                        :style="iCanvasStyle"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {
        compose,
        defaultTo,
        find,
        head,
        pathOr,
        propEq,
        propOr,
        map
    } from 'ramda'

    import {
        mapActions,
        mapGetters,
        mapState
    } from 'vuex'

    import ViewerActiveTool from '@/mixins/viewer-active-tool'
    import Request from '@/mixins/request'

    export default {
        name: 'TimeseriesScrubber',

        mixins: [
            Request,
            ViewerActiveTool
        ],

        props: {
            ts_start: Number,
            ts_end: Number,
            cWidth: Number,
            constants: Object,
            start: Number,
            duration: Number,
            cursorLoc:Number,
            labelWidth:Number
        },
        
        computed: {
            ...mapState([
                'config',
                'userToken'
            ]),
            ...mapState('viewer', [
                'activeViewer',
                'viewerChannels',
                'viewerAnnotations'
            ]),
            ts_start_str: function() {
                return this.getUTCTimeString(this.ts_start)
            },
            ts_end_str: function() {
                return this.getUTCTimeString(this.ts_end)
            },
            fullDateStr: function(){
                if (this.hoverTxt !== '') {
                    return this.hoverTxt;
                } else if(this.start > 0) {
                    const d = new Date(this.start/1000);
                    return ( d.toDateString() );
                }
            },
            canvasStyle: function() {
                return {
                    width: this.labelWidth + this.cWidth  +'px',
                    height: '28px'
                }
            },
            iCanvasStyle: function() {
                return {
                    width: this.labelWidth + this.cWidth  +'px',
                    height: '30px'
                }
            },
            scrubberCWidth: function() {
                return this.cWidth + this.labelWidth
            },
            period: function() {
                return Math.floor((this.ts_end - this.ts_start) / this.cWidth)
            }

        },
        watch: {
            start: function() {
                this.renderViewPort()
            },
            duration: function() {
                this.renderViewPort()
            },
            cWidth: function() {
                this.renderViewPort()
            }
        },

        data: function () {
            return {
                pixelRatio: 1,
                scrubberHeight: 28,
                viewportHeight: 30,
                mouseDown: false,
                hoverTxt:'',
                pointerMode: 'point',
                patternCnvs: null,
                annotations: [],
                segmentSpans: [],
                segments:[]
            }
        },
        mounted: function () {
            this.segments = new Array(5000);
            this.segments = this.segments.fill(0, 0, 4999);

            this.pixelRatio = this.getScreenPixelRatio()
            this.patternCnvs = this.createPinstripeCanvas()
            this.renderViewPort()
        },
        methods: {
            
            _cpCanvasScaler: function(sz, pixelRatio, offset) {
                return pixelRatio * (sz + offset);
            },
            getScreenPixelRatio: function() {
                let ctx = this.$refs.iCanvas.getContext('2d');
                let dpr = window.devicePixelRatio || 1
                let bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

                return dpr / bsr;
            },
            getUTCTimeString: function(d) {
                if(d > 0) {
                    d = d / 1000;
                    d = new Date(d);
                    return ( ('0' + d.getUTCHours()).slice(-2) + ':' +
                        ('0' + d.getUTCMinutes()).slice(-2) + ':' + ('0' + d.getUTCSeconds()).slice(-2) );
                }
            },
            getUTCDateString: function(d, s, c) {
                if (s !== '') {
                    return s;
                } else if(d > 0) {
                    d = new Date(d/1000);
                    return ( d.toDateString() );
                }
            },
            // ------- Mouse Interactions -------
            _onTap: function(e) {
                const cCoord = this.$refs.iCanvas.getBoundingClientRect();
                const cClickOffset = e.detail.x - cCoord.left;
                const realStart = ( cClickOffset/this.scrubberCWidth ) * (this.ts_end - this.ts_start );
                this.$emit('setStart', realStart + this.ts_start)
            },
            _onMouseMove: function(e) {

                if (!this.mouseDown) {
                    const cCoord = this.$refs.iCanvas.getBoundingClientRect();
                    const cHoverOffset = e.clientX - cCoord.left;
                    const cEnd = this.cStart + this.cDuration;
                    const oldMode = this.pointerMode;
                    const inResizeArea = cHoverOffset > this.cStart - 10 && cHoverOffset < cEnd + 10;

                    if (inResizeArea) {
                        this.pointerMode = 'drag';
                        this.$refs.iCanvas.setAttribute('dragme', true);
                        this.$refs.iCanvas.removeAttribute('resizeme');
                    } else {
                        this.pointerMode = 'point';
                        this.$refs.iCanvas.removeAttribute('dragme');
                        this.$refs.iCanvas.removeAttribute('resizeme');
                    }

                    //update hoverTxt
                    const realStart = ( (cHoverOffset)/this.cWidth ) * (this.ts_end - this.ts_start ) + this.ts_start;
                    const d = new Date(realStart/1000);
                    this.hoverTxt = d.toUTCString();

                    if (oldMode !== this.pointerMode) {
                        this.render();
                    }

                } else {
                    // is Dragging 
                    const _dx = e.clientX - this.clickX
                    const realStart = ( (_dx)/this.cWidth ) * (this.ts_end - this.ts_start );
                    const setStart = this.startDragTime + realStart;
                    this.$emit('setStart', setStart)
                    const d = new Date((realStart+ this.ts_start)/1000);
                    this.hoverTxt = d.toUTCString();
                }
            },
            _onMouseUp: function() {
                this.mouseDown = false;
            },
            _onMouseDown: function(e) {
                this.mouseDown = true;
                const cCoord = this.$refs.iCanvas.getBoundingClientRect();
                const cClickOffset = e.detail.x - cCoord.left;
                this.clickX = e.clientX
                this.startDragTime = this.start;
            },
            _onMouseEnter: function() {
                this.mouseDown = false;
            },
            _onMouseOut: function() {
                this.hoverTxt = '';
            },
            
            // -------
            // ------- Annotation Functions -------
            initSegmentSpans: function() {
                // GET SEGMENTS AND GAPS
                let fetchSpan = Math.min(this.constants['SEGMENTSPAN'], (this.ts_end - this.ts_start));
                const vChans = this.viewerChannels
                for (let i=0; i<this.viewerChannels.length; i++) {
                    this._requestSegmentSpan(this.viewerChannels[i].id,
                    i, this.ts_start, (this.ts_start + fetchSpan), 0)
                }
            },
            _requestSegmentSpan: function(channel, channelIdx, start, end, ix) {
                const max_recursion = this.constants['MAXRECURSION']

                const url = `${this.config.timeSeriesApi}/ts/retrieve/segments?session=${this.userToken}&channel=${channel}&start=${start}&end=${end}`;
                this.sendXhr(url)
                    .then(resp => {
                        // Parse response into vector
                        // let resp = data;
                        let vector = new Array(resp.length*2)
                        let i = 0;
                        for (let j = 0; j < resp.length; j++) {
                            vector[i] = resp[j][0];
                            vector[i+1] = resp[j][1];
                            i = i+2;

                            // append to global
                            const pxStart = Math.floor(((resp[j][0]-this.ts_start)/ (this.ts_end - this.ts_start))*5000);
                            const pxEnd = Math.ceil(((resp[j][1]-this.ts_start) / (this.ts_end - this.ts_start))*5000);
                            // console.log('st: ' + pxStart + '  nd: ' + pxEnd)
                            this.segments.fill(1, pxStart, pxEnd);
                        }

                        // Find Global spans
                        let ii = 0;
                        let inSegment = false;
                        let startSegment = 0;
                        this.segmentSpans = [];
                        while (ii < (this.segments.length-1)) {
                            if (!this.segments[ii] && !inSegment) {
                                ii++;
                                continue
                            } else if (!this.segments[ii]) {
                                // create segment
                                this.segmentSpans = this.segmentSpans.concat([startSegment, ii]);
                                inSegment = false;
                            } else if (!inSegment) {
                                startSegment = ii;
                                inSegment = true;
                            }
                            ii++;
                        }
                        
                        if (inSegment) {
                            this.segmentSpans = this.segmentSpans.concat([startSegment, ii]);
                        }
                        this.segmentSpans = this.segmentSpans.concat([5000]);

                        // remove first value if there is overlap with previous request
                        let firstValue = vector[0];
                        let chCongig = this.viewerChannels[channelIdx];
                        if (firstValue < chCongig.dataSegments[chCongig.dataSegments.length-1]) {
                            vector.shift();
                            vector.shift();
                        }


                        chCongig.dataSegments = chCongig.dataSegments.concat(vector.sort(function(a, b) {return a - b}));

                        this.$store.dispatch('viewer/updateChannel', chCongig)

                        // If we did not request all segment-spans yet, get next segment or bail when recursion limit.
                        let span = end - start;
                        if ((start + span) < this.ts_end && ix < max_recursion) {
                            this._requestSegmentSpan(channel, channelIdx, end, (end+span), ix + 1);
                        } else {
                            this.renderSegments();
                        }
                    })
                    .catch(err => {
                        this.handleXhrError(err)
                    })
            },
            getAnnotations: function() {
                const layerIds = map(obj => obj.id, this.viewerAnnotations);
                const endTime = this.ts_end;
                const params = {
                    api_key: this.userToken,
                    aggregation: 'count',
                    start: this.ts_start,
                    end: endTime,
                    period: this.period || 1,
                    mergePeriods: true,
                    layerIds
                }
                const baseUrl = `${this.config.apiUrl}/timeseries/${this.activeViewer.content.id}/annotations/window`;
                var url = baseUrl + `?api_key=${this.userToken}&aggregation=count&start=${this.ts_start}&end=${this.ts_end}&period=${this.period}&mergePeriods=true`
                for (let i in layerIds) {
                    url = url + `&layerIds=${layerIds[i]}`
                }
                this.sendXhr(url)
                .then(resp => {
                    console.log(resp)
                    this.annotations = resp;
                    this.render();
                }) 
              
            },
            // -------
            // ------- Render Functions -------
            render: function() {
                this.renderViewPort();
                this.renderTimelimeLine();
                this.renderSegments();
            },
            renderViewPort: function() {
                this.$nextTick(() => {
                    const ctx = this.$refs.iCanvas.getContext('2d');
                    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
                    ctx.clearRect(0, 0, this.cWidth, this.viewportHeight);

                    this.cStart = ( (((this.start - this.ts_start)/(this.ts_end-this.ts_start)) * this.cWidth ) + 0.5) |0;
                    this.cDuration = ((((this.duration)/(this.ts_end-this.ts_start)) * this.cWidth) +0.5) |0;

                    // Viewport
                    ctx.fillStyle = 'rgb(80,80,80)';
                    ctx.strokeStyle= 'rgb(80,80,80)';
                    ctx.strokeRect(this.cStart +0.5, 0.5, this.cDuration, this.viewportHeight-1);

                    ctx.fillRect(this.cStart - 2, (this.viewportHeight/2 - 5) | 0, 2, 10);
                    ctx.fillRect(this.cStart + this.cDuration + 1, (this.viewportHeight/2 - 5) | 0, 2, 10);

                    // // Cursor
                    const cursorCLoc = this.cStart + (this.cursorLoc*this.cDuration);
                    if( cursorCLoc > (this.cStart +0.5) ) {
                        ctx.strokeStyle = 'red';
                        ctx.beginPath();
                        ctx.moveTo(cursorCLoc, 0);
                        ctx.lineTo(cursorCLoc, this.viewportHeight-1)
                        ctx.stroke();
                    }
                })
            },
            renderSegments: function() {
                const ctx = this.$refs.segmentsCanvas.getContext('2d');
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
                ctx.fillStyle = ctx.createPattern(this.patternCnvs, 'repeat');
                ctx.clearRect(0, 0, this.cWidth, this.viewportHeight);

                for (let i=1; i<this.segmentSpans.length; i+=2) {
                    const xStart = (this.cWidth*this.segmentSpans[i]) / 5000;
                    const xEnd = (this.cWidth*this.segmentSpans[i+1]) / 5000;
                    ctx.fillRect(xStart, 2, xEnd-xStart, this.viewportHeight-6 )
                }

            },
            renderTimelimeLine: function() {
                const ctx = this.$refs.annotationCanvas.getContext('2d');
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

                ctx.clearRect(0, 0, this.cWidth, this.scrubberHeight);
                const xStart = this.ts_start;
                const xEnd = this.ts_end;

                const annotationLayers = this.annotations;
                let annotationIndex = 0;

                const layerSpacing = 0;
                const layerHeight = Math.floor(((this.scrubberHeight-2) / Object.keys(annotationLayers).length - layerSpacing));
                const annPanelLayers = this.viewerAnnotations;

                let color = 'rgb(0,0,0)';
                for ( const annotation in annotationLayers ) {
                    if (annotationLayers.hasOwnProperty(annotation)) {
                    // find color
                    for (let i=0; i<annPanelLayers.length; i++) {
                        if (annPanelLayers[i].id === parseInt(annotation)) {
                        annotationIndex = i;
                        color = annPanelLayers[i].color;
                        break;
                        }
                    }

                    this.plotAnnotations(ctx, xStart, xEnd, layerSpacing, layerHeight, annotationLayers[annotation], annotationIndex, color);
                    }
                }
            },
            plotAnnotations: function(ctx, xStart, xEnd, layerSpacing, layerHeight, annotations, rank, color) {
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
                ctx.fillStyle = color;
                for (let i = 0; i < annotations.length; i++) {
                    if(annotations[i].value > 0) {
                    const xPosStart = ((annotations[i].start - xStart) /(xEnd - xStart)) * this.cWidth;
                    const xPosEnd = ((annotations[i].end - xStart) /(xEnd - xStart)) * this.cWidth;
                    let cw = xPosEnd - xPosStart;
                    if (cw < 1) {
                        cw = 1;
                    }
                    const yPos = 1 + rank * ((layerHeight-1) + layerSpacing) + rank;
                    ctx.fillRect(xPosStart, yPos, cw, layerHeight);
                    }
                }
            },
            /** Creates a canvas filled with a 45-degree pinstripe.
            * @returns the filled HTMLCanvasElement. */
            createPinstripeCanvas: function() {
                const patternCanvas = document.createElement('canvas');
                const pctx = patternCanvas.getContext('2d', { antialias: true });
                const colour = 'rgb(220,220,220)';

                const CANVAS_SIDE_LENGTH = 5;
                const WIDTH = CANVAS_SIDE_LENGTH;
                const HEIGHT = CANVAS_SIDE_LENGTH;
                const DIVISIONS = 10;

                patternCanvas.width = WIDTH;
                patternCanvas.height = HEIGHT;
                pctx.fillStyle = colour;

                // Top line
                pctx.beginPath();
                pctx.moveTo(0, HEIGHT * (1 / DIVISIONS));
                pctx.lineTo(WIDTH * (1 / DIVISIONS), 0);
                pctx.lineTo(0, 0);
                pctx.lineTo(0, HEIGHT * (1 / DIVISIONS));
                pctx.fill();

                // Middle line
                pctx.beginPath();
                pctx.moveTo(WIDTH, HEIGHT * (1 / DIVISIONS));
                pctx.lineTo(WIDTH * (1 / DIVISIONS), HEIGHT);
                pctx.lineTo(0, HEIGHT);
                pctx.lineTo(0, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
                pctx.lineTo(WIDTH * ((DIVISIONS - 1) / DIVISIONS), 0);
                pctx.lineTo(WIDTH, 0);
                pctx.lineTo(WIDTH, HEIGHT * (1 / DIVISIONS));
                pctx.fill();

                // Bottom line
                pctx.beginPath();
                pctx.moveTo(WIDTH, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
                pctx.lineTo(WIDTH * ((DIVISIONS - 1) / DIVISIONS), HEIGHT);
                pctx.lineTo(WIDTH, HEIGHT);
                pctx.lineTo(WIDTH, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
                pctx.fill();

                return patternCanvas;
            },
        }
    }

</script>

<style lang="scss" scoped>
    @import '../../../assets/_variables.scss';

    .timeseries-scrubber {
        background: $white;
        padding: 0px 8px 8px 8px;
    }
    .dateWrap {
        padding: 8px 0;
        font-size: 12px;
        text-transform: uppercase;
        color: #71747C;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    #scrubber {
        background: $white;
        box-shadow: 0 0 0px 1px #c5c5c5 inset;
        box-sizing: border-box;
        position: relative;
        display: flex;
    }
    #canvasWrap {
        height: 30px;
        position: relative;
    }
    .noselect {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none;   /* Chrome/Safari/Opera */
        -khtml-user-select: none;    /* Konqueror */
        -moz-user-select: none;      /* Firefox */
        -ms-user-select: none;       /* Internet Explorer/Edge */
        user-select: none;           /* Non-prefixed version, currently not supported by any browser */
    }

    .canvas {
        position: absolute;
        top: 0;
        left: 0;
        cursor: pointer;
    }
    .canvas[dragme] {
        cursor: move;
    }
    .canvas[resizeme] {
        cursor: ew-resize;
    }
    #annotationCanvas {
        margin-top: 1px;
    }
    #iCanvas {
        margin-left: 0px
    }


</style>



