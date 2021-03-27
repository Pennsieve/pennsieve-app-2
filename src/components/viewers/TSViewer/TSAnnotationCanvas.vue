<template>
    <canvas id="annLabelArea" class="timeseries-annotation-canvas"  ref="annLabelArea" 
        :width="_cpCanvasScaler(cWidth, pixelRatio, 0)" 
        :height="_cpCanvasScaler(pHeight, pixelRatio,0)"
        :style="canvasStyle"></canvas>
</template>

<script>

    import ViewerActiveTool from '@/mixins/viewer-active-tool'
    import Request from '@/mixins/request'
    import EventBus from '@/utils/event-bus'

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
    
    export default {
        name: 'TimeseriesAnnotationCanvas',
        
        mixins: [
            Request,
            ViewerActiveTool
        ],
        props: {
            cWidth: {
              type: Number,
              default: 0
            },
              
            cHeight: Number,
            start: Number,
            duration: Number,
            ts_end: Number,
            rsPeriod: Number,
            pixelRatio: Number,
            constants: Object,
            pointerMode: String,
            annotationsCanvas: HTMLCanvasElement
        },
        data: function () {
            return {
                defaultColors: [
                    '#18BA62',
                    '#FFBC27',
                    '#E94B4B',
                    '#0D4EFF',
                    '#FF4FFF',
                    '#50FFFF',
                    '#FFFF4E',
                    '#512BAF',
                    '#8A6ECF',
                    '#389BAD',
                    '#187D46',
                    '#B12800',
                    '#0C2475',
                    '#FF5321',
                    '#FF99CC',
                    '#DCC180',
                    '#FF6C21',
                    '#000000',
                    '#9B9B9B',
                    '#00FF00',
                    '#FA8072',
                    '#808000',
                    '#A0522D',
                    '#2760FF'],
                annLayerInfo: [],
                hoverOffsets: [],
                cachedAnnRange: [],
                a11yList:['#FFFF4E'],
                focusedAnn:null
            }
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
                'viewerAnnotations',
                'viewerMontageScheme'
            ]),
            pHeight: function() {
                return this.cHeight -20;
            },
            canvasStyle: function() {
                return {
                    width: this.cWidth  + 'px',
                    height: this.pHeight + 'px'
                }
            },
        },
        mounted: function () {
            const url = `${this.config.apiUrl}/timeseries/${this.activeViewer.content.id}/layers?api_key=${this.userToken}`;
            this.sendXhr(url)
                .then(resp => {
                    this._getLayerResponse(resp)
                .then(() => {
                    this.checkAnnotationRange(this.start, this.start + this.duration);    
                })
                })
    },

        methods: {
            _cpCanvasScaler: function(sz, pixelRatio, offset) {
                return pixelRatio * (sz + offset);
            },
            _getLayerResponse(resp) {
                // reset layers list
                const annLayers = []

                // If there is no layer present, create a default layer.
                if (resp.results.length === 0) {
                    const payload = {
                        name: 'Default',
                        color: '#18BA62',
                        description: 'Default Annotation Layer'
                    };
                    // TODO SOMETHING ABOUT CREATING DEFAULT LAYER
                    // this.viewer.domHost.fire('create-layer', { layer: payload, firstLayer: true })
                } else {
                    // get the layers from the response
                    for (let i = 0; i< resp.results.length; i++) {
                        let layerColor = resp.results[i].color
                        if (!layerColor) {
                            layerColor = this.defaultColors[i%this.defaultColors.length];
                        }
                        const layer = {
                            id: resp.results[i].id,
                            name: resp.results[i].name,
                            description: resp.results[i].description,
                            visible: true,
                            selected: false,
                            annotations: [],
                            color: this.hexToRgbA(layerColor, 0.7),
                            hexColor: layerColor,
                            bkColor: this.hexToRgbA(layerColor, 0.15),
                            selColor: this.hexToRgbA(layerColor, 0.9)
                        }

                        annLayers.push(layer)
                    }

                    if (annLayers) {
                        annLayers[0].selected = true
                    }
                    this.$store.dispatch('viewer/setAnnotations', annLayers).then(() => {
                        this.$emit('annLayersInitialized')
                        // this.setActiveLayer(this.annLayers[0]);
                    })
                }


                this.annLayerInfo = resp.results;

                return Promise.resolve()
            },
            hexToRgbA: function(hex, opacity) {
                let c;
                if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                    c = hex.substring(1).split('');
                    if (c.length === 3) {
                        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                    }
                    c = '0x' + c.join('');
                    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity +')';
                }
                throw new Error('Bad Hex');
            },
            sortAnns: function(annArray) {
                annArray.sort(function Comparator(a, b) {
                    if (a.start < b.start) return -1;
                    if (a.start > b.start) return 1;
                    return 0;
                });
            },
            _computeRenderOptions: function(anns) {

                const annotationHeight = this.constants['ANNOTATIONLABELHEIGHT'];
                const halfAnnotationHeight = (annotationHeight/2) |0;

                const xOffset = this.constants['XOFFSET'];

                const remIdx = [];

                for (let annIdx=0; annIdx< anns.length; annIdx++) {
                    const curAnn = anns[annIdx];

                    // Invert if duration is negative
                    let viewStart = curAnn.start;
                    let viewDuration = curAnn.duration;
                    if (curAnn.duration < 0) {
                        viewStart = (curAnn.start + curAnn.duration);
                        viewDuration = -curAnn.duration;
                    }

                    const curAnnStart = xOffset + (viewStart - this.start ) / this.rsPeriod;
                    curAnn.cStart = curAnnStart | 0;


                    if (curAnn.duration !== 0) {
                        const curAnnEnd = xOffset + (viewStart + viewDuration - this.start ) / this.rsPeriod;
                        curAnn.cEnd = curAnnEnd | 0;          // round to integer
                    } else {
                        curAnn.cEnd = (curAnn.cStart + this.cWidth/40) | 0;   // round to integer
                    }


                    if (!curAnn.allChannels) {
                        curAnn.allOffsets = [];
                        curAnn.minOffset = this.cHeight | 0;
                        curAnn.maxOffset = 0;

                        const channelConfig = this.viewerChannels;
                        for (let ch1 in curAnn.channelIds) {
                        if (curAnn.channelIds.hasOwnProperty(ch1)) {
                            // find channel
                            let channelOffset = null;
                            for (let ch2 in channelConfig) {
                            if (channelConfig.hasOwnProperty(ch2)) {
                                const curChannelView = channelConfig[ch2];
                                if(curChannelView.id === curAnn.channelIds[ch1] && curChannelView.visible) {
                                    channelOffset = curChannelView.rowBaseline | 0;
                                    if (channelOffset < curAnn.minOffset) { curAnn.minOffset = channelOffset; }
                                    if (channelOffset > curAnn.maxOffset) { curAnn.maxOffset = channelOffset; }
                                    curAnn.allOffsets.push(channelOffset);
                                    break;
                                }
                            }
                            }
                        }
                        }

                        // Add to hoverOffsets
                        if (this.hoverOffsets.indexOf(curAnn.minOffset) < 0) {
                            this.hoverOffsets.push(curAnn.minOffset)
                            // this.push('hoverOffsets', curAnn.minOffset );
                        }
                        curAnn.cY = curAnn.minOffset;  // set renderOffset

                    } else {
                        curAnn.allOffsets = [halfAnnotationHeight];
                        curAnn.cY = halfAnnotationHeight;  // set renderOffset
                    }


                }

                for (let j = (remIdx.length-1); j>=0; j--) {
                    anns.splice(remIdx[j], 1);
                }
            },
            getChannelId: function(channel) {
                const isViewingMontage = this.viewerMontageScheme !== 'NOT_MONTAGED'
                let id = propOr('', 'id', channel)
                let list = []
                if (isViewingMontage) {
                    list = id.split('_')
                    id = list.length ? head(list) : id // remove channel name from id
                }
                return id
            },
            // ANNOTATIONS
            findNextAnnotation: function(curTime) {
                let annLayer = this.$store.getters['viewer/getViewerActiveLayer']();
                const index = this.annIndexOf(annLayer.annotations, curTime, false);

                if (index < annLayer.annotations.length) {
                    return annLayer.annotations[index + 1];
                } else {
                    return annLayer.annotations[index];
                }
            },
            findPreviousAnnotation: function(curTime) {
                let annLayer = this.$store.getters['viewer/getViewerActiveLayer']();
                const index = this.annIndexOf(annLayer.annotations, curTime, true);

                if(index > 0 ) {
                    return annLayer.annotations[index - 1];
                } else {
                    return annLayer.annotations[index];
                }
            },
            checkAnnotationRange: function(RStart, REnd) {

                // If part of the viewport is not cached, request up to limit.
                // Start with full width --> split on exisiting ranges
                const reqRange = [];
                reqRange.push({start: RStart, end: this.ts_end});
                
                // check if viewport is cached
                let firstIndex = 0;
                for (let i = 0; i < this.cachedAnnRange.length; i++) {
                    const curBlock = this.cachedAnnRange[i];
                    if( RStart >= curBlock.start && REnd <= curBlock.end ) {
                        // annotations in current viewport are cached
                        return
                    } else if (reqRange[0].start > REnd) {
                        break;
                    } else if (curBlock.start <= reqRange[0].start && curBlock.end >= RStart) {
                        // existing cached partly in viewport
                        firstIndex = i + 1;
                        reqRange[0].start = curBlock.end;
                    } else if (curBlock.start > reqRange[0].start ) {
                        // block start is beyond viewport
                        firstIndex = i;
                        break;
                    }
                }

                // check if layers have annotations
                const annotationsTotal = this.viewerAnnotations.reduce((acc, li) => acc = li.annotations.length)

                // If all in memory, return
                if(reqRange[0].start >= reqRange[0].end && annotationsTotal > 0) {
                    return;
                }
                // Now find ranges
                const curRequestIndex = 0;
                for (let i = firstIndex; i < this.cachedAnnRange.length; i++) {
                    if (this.cachedAnnRange[i].start >= reqRange[curRequestIndex].start) {
                        reqRange[curRequestIndex].end = this.cachedAnnRange[i].start;
                        // Only add new request if within viewport
                        if (this.cachedAnnRange[i].end < REnd) {
                            reqRange.push({start: this.cachedAnnRange[i].end, end: this.summary.span.end});
                        } else {
                            break;
                        }
                    }
                }
                // If all in viewport in memory, return
                if(reqRange[0].start >= reqRange[0].end && annotationsTotal > 0) {
                    return;
                }
                // Request annotations from server if any need to be requested.
                if ( (reqRange.length > 0) ) {
                    const channelIds = [];
                    for (let i=0; i< this.viewerChannels.length; i++) {
                        const channel = this.viewerChannels[i]
                        const id = this.getChannelId(channel)
                        channelIds.push(id);
                    }
                    // Request new range
                    for (let cur in reqRange) {
                    if (reqRange.hasOwnProperty(cur)) {
                        const curRange = reqRange[cur];
                        for (let lyr = 0; lyr < this.viewerAnnotations.length; lyr++) {
                            const curLayer = this.viewerAnnotations[lyr];
                            const endTime = Math.floor(curRange.end);
                            const params = {
                                id: this.activeViewer.content.id,
                                start: Math.floor(curRange.start),
                                end: endTime,
                                layerId: curLayer.id,
                                limit: this.constants['LIMITANNFETCH']
                            }
                            const apiUrl = this.config.apiUrl
                            const baseUrl = `${apiUrl}/timeseries/${this.activeViewer.content.id}/layers/${curLayer.id}/annotations?api_key=${this.userToken}`;
                            const urlParams = Object.keys(params).map(k => `&${k}=${params[k]}`).join('');
                            const url = `${baseUrl}${urlParams}`;

                            fetch(url, {
                                method: 'GET',
                                headers: {
                                    'Content-type': 'application/json'
                                }
                            })
                            .then(response => {
                                const {status} = response;
                                if (status >= 400) {
                                    throw new Error(status);
                                }
                            return response.json();
                            })
                            .then(this._getAnnResponse.bind(this))
                            .catch(err => {
                                this.handleXhrError(err)
                            })
                        }
                        this.cachedAnnRange.push({start: Math.floor(curRange.start), end: Math.floor(curRange.end)});
                    }
                    }
                    // Sort the returned annotations by end-time
                    this.cachedAnnRange.sort(function Comparator(a, b) {
                        if ( a.start < b.start) return -1;
                        if ( a.start > b.start ) return 1;
                        return 0;
                    });
                }
            },
            _getAnnResponse(e) {
                // const userMap = R.pathOr([], ['users'], e);
                const linkedPackages = propOr({}, 'linkedPackages', e)
                let resp = pathOr([], ['annotations', 'results'], e);

                // Set requested range to last annstart.
                if (resp.length >= this.constants['LIMITANNFETCH']) {
                    // find max start time
                    let maxStart = 0;
                    for (let j =0; j< resp.length; j++) {
                        if (resp[j].start > maxStart) {
                            maxStart = resp[j].start;
                        }
                    }
                    // find range
                    for (let i = 0; i < this.cachedAnnRange.length; i++) {
                        if (this.cachedAnnRange[i].end > maxStart && this.cachedAnnRange[i].start < maxStart) {
                            this.cachedAnnRange[i].end = maxStart;
                            break;
                        }
                    }
                }

                const isViewingMontage = this.viewerMontageScheme !== 'NOT_MONTAGED'

                if (resp.length > 0) {
                    const annotations = []
                    for (let i = 0; i < resp.length; i++) {
                        const curAnn = resp[i];
                        // if (this.annotations.indexOf(curAnn.id) >= 0) {
                        //     // annotation already exists
                        //     continue;
                        // }
                        const newAnn = {
                        name:'',
                        id: curAnn.id,
                        label: curAnn.label,
                        description: curAnn.description,
                        start: curAnn.start,
                        duration: curAnn.end - curAnn.start,
                        end: curAnn.end,
                        cStart: null,
                        cEnd: null,
                        selected: false,
                        channelIds: curAnn.channelIds,
                        allChannels: false,
                        layer_id: curAnn.layerId,
                        userId: curAnn.userId
                        };
                        if (curAnn.linkedPackage) {
                        const pkgId = curAnn.linkedPackage
                        newAnn.linkedPackage = R.pathOr('', ['content', 'id'], linkedPackages[pkgId])
                        newAnn.linkedPackageDTO = linkedPackages[pkgId]
                        }
                        // Check if all channels are selected
                        if (!isViewingMontage && newAnn.channelIds.length === this.viewerChannels.length) {
                            newAnn.allChannels = true;
                        } else if (isViewingMontage && newAnn.channelIds.length > this.viewerChannels.length) {
                            newAnn.allChannels = true
                        }
                        // Find layer
                        let curLIndex = null;
                        for (let j = 0; j < this.viewerAnnotations.length; j++) {
                            if (this.viewerAnnotations[j].id === curAnn.layerId) {
                                curLIndex = j;
                                break;
                            }
                        }
                        if (curLIndex === null) {
                            const newLayer = {
                            id: this.viewerAnnotations.length,
                            color: null,
                            visible: true,
                            selected: false,
                            annotations:[],
                            userId: curAnn.userId
                            }
                            this.$store.dispatch('viewer/createLayer', newLayer);
                            curLIndex = this.viewerAnnotations.length -1;
                        }
                        annotations.push(newAnn);
                    }
                    // get layers
                    this.viewerAnnotations.forEach(layer => {
                        // get annotations for layer
                        const layerAnns = layer.annotations;
                        const filteredAnns = annotations.filter(ann => layer.id === ann.layer_id);
                        layer.annotations = layerAnns.concat(filteredAnns);
                        // get all annotations per layer
                        this.$store.dispatch('viewer/updateLayer', layer);
                    });
                } else {
                    // if no annotations exist, force render layers in side panel
                    // just to be safe
                    this.fire('render-side-panel-layers')
                }
                this.$emit('annotationsReceived')
            },
            annIndexOf: function(annArray, val, first, startAtIndex, checkEnd) {

                if (!startAtIndex) {
                    startAtIndex = 0;
                }

                let index;
                if (checkEnd) {
                    index = this._indexOfEnd(annArray, val, startAtIndex, annArray.length - 1, first);
                } else {
                    index = this._indexOfStart(annArray, val, startAtIndex, annArray.length - 1, first);
                }

                if (index === -1) {
                    index = 0;
                } else if (index < 0) {
                    index = -index - 2;
                }
                return index;
            },
            _indexOfStart: function(annArray, val, min, max, firstIndex) {

                /*
                Return code status:
                Positive number:  first index of the value
                Negative 1 (-1):  belongs before the start of the dataset
                Other negative value:  belongs after (-value - 2)
                */
                if (max < min) {
                    let pred;
                    if (max >= 0) {
                        //return -max - 2;
                        pred = max;
                    } else {
                        //return max;
                        pred = -max - 2;
                    }
                    if (pred === -1) {
                        return pred;
                    }
                    const predVal = annArray[pred].start;
                    while (pred >= 0 && annArray[pred].start === predVal) {
                        pred--;
                    }
                    pred++;
                    return -pred - 2;
                }

                const mid = parseInt((min + max) / 2);

                if (annArray[mid].start > val) {
                    return this._indexOfStart(annArray, val, min, mid - 1, firstIndex);
                } else if (annArray[mid].start < val) {
                    return this._indexOfStart(annArray, val, mid + 1, max, firstIndex);
                } else {
                    let index = mid;
                    if (firstIndex) {
                        while (index >= 0 && annArray[index].start === val) {
                            index--;
                        }
                        index++;
                    } else {
                        while (index < annArray.length && annArray[index].start === val) {
                            index++;
                        }
                        index--;
                    }
                    return index;
                }
            },
            _indexOfEnd: function(annArray, val, min, max, firstIndex) {

                /*
                Return code status:
                Positive number:  first index of the value
                Negative 1 (-1):  belongs before the start of the dataset
                Other negative value:  belongs after (-value - 2)
                */

                if (max < min) {
                    let pred;
                    if (max >= 0) {
                        //return -max - 2;
                        pred = max;
                    } else {
                        //return max;
                        pred = -max - 2;
                    }
                    if (pred === -1) {
                        return pred;
                    }
                    const predVal = annArray[pred].start + annArray[pred].duration;
                    while (pred >= 0 && (annArray[pred].start + annArray[pred].duration) === predVal) {
                        pred--;
                    }
                    pred++;
                    return -pred - 2;
                }

                const mid = parseInt((min + max) / 2);

                if ( (annArray[mid].start + annArray[mid].duration) > val) {
                    return this._indexOfEnd(annArray, val, min, mid - 1, firstIndex);
                } else if ((annArray[mid].start + annArray[mid].duration) < val) {
                    return this._indexOfEnd(annArray, val, mid + 1, max, firstIndex);
                } else {
                    let index = mid;
                    if (firstIndex) {
                        while (index >= 0 && (annArray[index].start + annArray[index].duration) === val) {
                            index--;
                        }
                        index++;
                    } else {
                        while (index < annArray.length && (annArray[index].start + annArray[index].duration) === val) {
                            index++;
                        }
                        index--;
                    }

                    return index;
                }
            },
            getLayer: function(annotation) {
                const layerId = propOr(0, 'layer_id', annotation)
                return defaultTo({}, find(propEq('id', layerId), this.viewerAnnotations))
            },
            createAnnotationLayer: function(newLayer) {

                // TODO: This needs to be set dynamically
                const firstLayer = false
                
                const url = `${this.config.apiUrl}/timeseries/${this.activeViewer.content.id}/layers?api_key=${this.userToken}`;
                this.sendXhr(url, {
                    method: "POST",
                    body: {
                        name: newLayer.name,
                        color: newLayer.color,
                        description: newLayer.name
                    }
                }).then(resp => {
                    var layer = resp
                    layer.annotations = []

                    const hexColor = layer.color
                    layer.hexColor = hexColor
                    layer.color = this.hexToRgbA(hexColor, 0.7),
                    layer.bkColor = this.hexToRgbA(hexColor, 0.15),
                    layer.selColor = this.hexToRgbA(hexColor, 0.9)
                    layer.visible = true

                    if (firstLayer) {
                        this.$store.dispatch('viewer/createLayer', layer).then(() => {
                        // this.setSelectedLayer(layer.id, [layer])
                        // this.annotationChange(layer.id)
                        })
                    } else {
                        const updatedLayers = [layer].concat(this.viewerAnnotations)
                        // this.setSelectedLayer(layer.id, updatedLayers)
                        // this.annotationChange(layer.id);

                        EventBus.$emit('toast', {
                            detail: {
                            msg: `'${layer.name}' Layer Created`
                            }
                        })

                        this.$emit('closeAnnotationLayerWindow')
                    }
                    
                })


            },
            // RENDER METHODS
            render: function() {
                if (this.annotationsCanvas === undefined) {
                    return
                }

                const ctxBk = this.annotationsCanvas.getContext('2d');
                const ctxLb = this.$refs.annLabelArea.getContext('2d');
                ctxBk.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
                ctxLb.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);


                // Init hover offsets --> used to track which channels contain individual annotations.
                // this.set('hoverOffsets', [this.constants['ANNOTATIONLABELHEIGHT']/2]);
                this.hoverOffsets = [this.constants['ANNOTATIONLABELHEIGHT']/2]

                // clear canvas
                ctxBk.clearRect(0, 0, this.cWidth, this.cHeight );
                ctxLb.clearRect(0, 0, this.cWidth, this.cHeight );

                // clear Render Annotations Array
                this.renderAnn = [];

                // Iterate over visible layers and populate render array
                for(let iL in this.viewerAnnotations) {
                    if (this.viewerAnnotations.hasOwnProperty(iL)) {
                        const curLayer = this.viewerAnnotations[iL];

                        if (curLayer.visible && curLayer.annotations && curLayer.annotations.length > 0) {

                            // Get last index in (start-sorted) array of annotations that start before end of window
                            const lastIndex = this.annIndexOf(curLayer.annotations, this.start + this.duration, false, 0, false);

                            const priorAnns = [];
                            for (let iAnn = 0; iAnn <= lastIndex; iAnn++) {
                                priorAnns.push(curLayer.annotations[iAnn]);
                            }

                            // Sort the returned annotations by end-time
                            priorAnns.sort(function Comparator(a, b) {
                                if ( (a.start + a.duration) < (b.start + b.duration)) return -1;
                                if ((a.start + a.duration) > (b.start + b.duration)) return 1;
                                return 0;
                            });

                            // Find the first index in (end-sorted) array of annotations that end after start of window
                            const first = this.annIndexOf(priorAnns, this.start, true, 0, true);

                            // Populate renderArray of annotations.
                            for (let iAnn = first; iAnn <= priorAnns.length-1; iAnn++) {
                                const curAnn = priorAnns[iAnn];

                                // Make sure that annotation points back to layer
                                // curAnn.layer = curLayer;
                                this.renderAnn.push(curAnn);
                            }
                        }
                    }
                }

                // Sort rendered annotations
                this.sortAnns(this.renderAnn);

                // Compute all render-variables
                this._computeRenderOptions(this.renderAnn);

                // Render all backGrounds
                this._renderAnnotationAreas(ctxBk, this.renderAnn);

                // Render focus backGround
                this._renderAnnotationLabels(ctxLb, this.renderAnn, true);

                // Render focus Label
                if(this.focusedAnn !== null) {
                    this._renderAnnotationLabels(ctxLb, [this.focusedAnn], false);
                }

            },
            _renderAnnotationAreas: function(ctx, anns) {
                const annotationHeight = this.constants['ANNOTATIONLABELHEIGHT'];
                const halfAnnotationHeight = (annotationHeight/2) |0;
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

                ctx.save();
                ctx.lineWidth = 1;
                ctx.setLineDash([8, 5]);
                ctx.strokeStyle = 'rgba(0,0,0, 0.6)';
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                for (const ann in anns) {
                if (anns.hasOwnProperty(ann)) {
                    const curAnn = anns[ann];
                    const curAnnLayer = this.getLayer(curAnn)
                    if (curAnn.selected) {
                        ctx.save();
                        ctx.strokeStyle = curAnnLayer.selColor;
                        ctx.fillStyle = curAnnLayer.bkColor;
                        ctx.lineWidth = 1;
                    }
                    // Switch render based on type: 1) global 2) Globalpoint 3) channel 4) channelPoint
                    let curAnnStartRounded = Math.round(curAnn.cStart) + 0.5;
                    let curAnnEndRounded = Math.round(curAnn.cEnd) + 0.5;
                    if (curAnn.allChannels) {

                        // On all channels
                        if (curAnn.duration === 0) {
                            // No duration
                            // Background area
                            ctx.beginPath();
                            ctx.moveTo(curAnnStartRounded +1, annotationHeight);
                            ctx.lineTo(curAnnStartRounded, this.pHeight);
                            ctx.stroke();
                        } else{
                            // With duration
                            // Background area
                            ctx.fillRect(curAnnStartRounded, annotationHeight, curAnnEndRounded - curAnnStartRounded, this.pHeight - annotationHeight);
                            ctx.beginPath();
                            ctx.moveTo(curAnnStartRounded, annotationHeight);
                            ctx.lineTo(curAnnStartRounded, this.pHeight);
                            ctx.moveTo(curAnnEndRounded, annotationHeight);
                            ctx.lineTo(curAnnEndRounded, this.pHeight);
                            ctx.stroke();
                        }
                    } else if(curAnn && curAnn.channelIds && curAnn.channelIds.length === 1) {
                        // Flagpole in case of single channel with no duration
                        if (curAnn.duration === 0) {
                            ctx.beginPath();
                            ctx.moveTo(curAnnStartRounded, curAnn.minOffset + halfAnnotationHeight);
                            ctx.lineTo(curAnnStartRounded, curAnn.minOffset + halfAnnotationHeight + 8);
                            ctx.stroke();
                        }
                    } else {
                        // On multiple channels
                        if (curAnn.duration === 0) {
                            // No duration
                            ctx.beginPath();
                            ctx.moveTo(curAnnStartRounded, curAnn.minOffset +halfAnnotationHeight);
                            ctx.lineTo(curAnnStartRounded, curAnn.maxOffset-halfAnnotationHeight );
                            ctx.stroke();
                        } else{
                            // With duration
                            ctx.fillRect(curAnnStartRounded-1, curAnn.minOffset+halfAnnotationHeight,
                                    curAnnEndRounded-curAnnStartRounded + 1, curAnn.maxOffset-curAnn.minOffset -annotationHeight);
                            ctx.beginPath();
                            ctx.moveTo(curAnnStartRounded, curAnn.minOffset + halfAnnotationHeight);
                            ctx.lineTo(curAnnStartRounded, curAnn.maxOffset - halfAnnotationHeight );
                            ctx.moveTo(curAnnEndRounded, curAnn.minOffset + halfAnnotationHeight);
                            ctx.lineTo(curAnnEndRounded, curAnn.maxOffset - halfAnnotationHeight);
                            ctx.stroke();
                        }
                    }
                    if (curAnn.selected) {
                        ctx.restore();
                    }
                }
                }
                ctx.restore();
            },
            _renderAnnotationLabels: function(ctx, anns, hideFocusedAnn) {
                const annotationHeight = this.constants['ANNOTATIONLABELHEIGHT'];
                const halfAnnotationHeight = (annotationHeight/2) |0;

                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

                ctx.save();
                ctx.lineWidth = 2;
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'left';

                for (let iAnn=0; iAnn<anns.length; iAnn++) {
                    const curAnn = anns[iAnn];
                    const curAnnLayer = this.getLayer(curAnn)

                    if (curAnn === this.focusedAnn && hideFocusedAnn) {
                        continue;
                    }
                    // Set options
                    console.log(curAnn)
                    if (curAnn.selected) {
                        ctx.fillStyle = curAnnLayer.selColor || 'rgba(51,204,102, 0.8)';
                        ctx.strokeStyle = 'white';
                    } else {
                        ctx.fillStyle = curAnnLayer.color || 'rgba(51,204,102,0.8)';
                        if (curAnn === this.focusedAnn) {
                            ctx.strokeStyle = 'white';
                        } else{
                            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                        }
                    }

                    let curAnnStartRounded = Math.round(curAnn.cStart) + 1;
                    let curAnnEndRounded = Math.round(curAnn.cEnd);

                    // Render label background
                    let minOffsetIdx = 0;
                    for (let i = 0; i < curAnn.allOffsets.length; i++) {
                        ctx.fillRect(curAnnStartRounded - 1, curAnn.allOffsets[i] -
                                halfAnnotationHeight, curAnnEndRounded - curAnnStartRounded + 2, annotationHeight);
                        if (curAnn.allOffsets[i] === curAnn.minOffset) {
                            minOffsetIdx = i;
                        }
                    }

                    // Render Inside lines (resize handles)
                    const firstOffset = curAnn.allOffsets[minOffsetIdx];
                    if (this.pointerMode === 'annotate') {
                        ctx.beginPath();

                        if (curAnn.duration !== 0) {
                            ctx.moveTo(curAnnEndRounded - 3, firstOffset - halfAnnotationHeight + 3);
                            ctx.lineTo(curAnnEndRounded - 3, firstOffset + halfAnnotationHeight - 3);
                        }
                        ctx.moveTo(curAnnStartRounded + 3, firstOffset - halfAnnotationHeight + 3);
                        ctx.lineTo(curAnnStartRounded + 3, firstOffset + halfAnnotationHeight - 3);
                        ctx.stroke();
                    }

                    // fill text
                    if ((curAnnEndRounded - curAnnStartRounded) > ( (curAnn.label.length * 8) + 10)) {
                        ctx.fillStyle = this.a11yList.indexOf(curAnnLayer.hexColor) >= 0 ? 'black' : 'white'
                        if (!curAnn.linkedPackage) {
                        ctx.fillText(curAnn.label, curAnnStartRounded + 10, firstOffset + halfAnnotationHeight - 6);
                        } else {
                        ctx.fillText(curAnn.label, curAnnStartRounded + 30, firstOffset + halfAnnotationHeight - (halfAnnotationHeight / 2));
                        }
                    }

                    const linkedPackageDTO = curAnn.linkedPackageDTO

                    if (linkedPackageDTO && (curAnnEndRounded - curAnnStartRounded) >= 30 ) {
                    const preview = R.pathOr({}, ['objects', 'view', 1, 'content'], linkedPackageDTO)
                    const fileType = R.propOr('', 'fileType', preview)

                    const img = new Image()

                    // if there's an image preview available
                    if (fileType === 'PNG') {
                        const { id, packageId } = preview
                        const apiUrl = this.config.apiUrl
                        img.src = `${apiUrl}/packages/${packageId}/files/${id}/presign/?api_key=${this.userToken}`
                        if (!img.complete) {
                            img.addEventListener('load', () => this.render(), { once: true })
                        }
                        ctx.drawImage(img, curAnnStartRounded, firstOffset - halfAnnotationHeight, 27, annotationHeight)
                    } else {
                        const iconPath = this._computeIcon(linkedPackageDTO)
                        img.src = iconPath
                        ctx.drawImage(img, curAnnStartRounded + 5, firstOffset - halfAnnotationHeight, 20, 20)
                    }
                    }
                }

                ctx.restore();
            },
        }
    }

</script>

<style lang="scss" scoped>
    @import '../../../assets/_variables.scss';

    .timeseries-annotation-canvas {
        position: absolute;
        top: 0;
        left: 0;
        margin-left: 5px;
        cursor: ew-resize;
        outline: none;
    }

</style>


