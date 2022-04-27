<template>
    <div class="timeseries-plot-canvas">
        <canvas id="blurArea" class="canvas" ref="blurArea"
            :width="_cpCanvasScaler(cWidth, pixelRatio, 0)"
            :height="_cpCanvasScaler(pHeight, pixelRatio, 0)"
            :style="canvasStyle"></canvas>
        <slot name="axisCanvas">
        </slot>
        <slot name="annCanvas">
        </slot>
        <canvas id="plotArea" class="canvas" ref="plotArea"
            :width="_cpCanvasScaler(cWidth, pixelRatio, 0)"
            :height="_cpCanvasScaler(pHeight, pixelRatio, 0)"
            :style="canvasStyle">
        </canvas>
    </div>
</template>
<script>
    import {
        mapState
    } from 'vuex'

    import {
        compose,
        head,
        propEq,
        propOr,
        path,
        findIndex,
        sum,
        map,
        take,
        sortBy,
        prop
    } from 'ramda'

    import protobuf from 'protobufjs'

    export default {
        name: 'TimeseriesPlotCanvas',

        props: {
            cHeight: Number,
            cWidth: Number,
            start: Number,
            duration: Number,
            constants: Object,
            rsPeriod: Number,
            ts_start: Number,
            ts_end: Number,
            globalZoomMult: Number,
        },
        watch: {
            rsPeriod: function() {
                this.invalidate();
                this.requestedPages.clear();
            },
            viewerMontageScheme: function () {
                this.sendMontageMessage(this.viewerMontageScheme)
            }

        },
        computed: {
            ...mapState('viewer', [
                'activeViewer',
                'viewerChannels',
                'viewerMontageScheme'
            ]),
            canvasStyle: function() {
                return {
                    width: this.cWidth  + 'px',
                    height: this.pHeight + 'px'
                }
            },
            pHeight: function () {
                return this.cHeight - 20
            },
            timeSeriesUrl: function() {
                const url = this.$store.state.config.timeSeriesUrl
                const token = this.$store.state.userToken
                return url + '?session=' + token + '&package=' + this.activeViewer.content.id
            },
        },
        data: function () {
            return {
                proto: {
                    'nested': {
                        'Event': {
                        'fields': {
                            'source': {
                            'type': 'string',
                            'id': 1
                            },
                            'pageStart': {
                            'type': 'uint64',
                            'id': 2
                            },
                            'pageEnd': {
                            'type': 'uint64',
                            'id': 3
                            },
                            'samplePeriod': {
                            'type': 'double',
                            'id': 4
                            },
                            'pointsPerEvent': {
                            'type': 'uint64',
                            'id': 5
                            },
                            'isResampled': {
                            'type': 'bool',
                            'id': 6
                            },
                            'data': {
                            'rule': 'repeated',
                            'type': 'double',
                            'id': 7
                            },
                            'times': {
                            'rule': 'repeated',
                            'type': 'uint64',
                            'id': 8
                            },
                            'spikeGroup': {
                            'rule': 'repeated',
                            'type': 'uint32',
                            'id': 9
                            }
                        }
                        },
                        'Instruction': {
                        'fields': {
                            'command': {
                            'type': 'string',
                            'id': 1
                            },
                            'argument': {
                            'type': 'string',
                            'id': 2
                            }
                        }
                        },
                        'Segment': {
                        'fields': {
                            'startTs': {
                            'type': 'uint64',
                            'id': 1
                            },
                            'source': {
                            'type': 'string',
                            'id': 2
                            },
                            'lastUsed': {
                            'type': 'uint64',
                            'id': 3
                            },
                            'unit': {
                            'type': 'string',
                            'id': 4
                            },
                            'samplePeriod': {
                            'type': 'double',
                            'id': 5
                            },
                            'requestedSamplePeriod': {
                            'type': 'double',
                            'id': 6
                            },
                            'pageStart': {
                            'type': 'uint64',
                            'id': 7
                            },
                            'isMinMax': {
                            'type': 'bool',
                            'id': 8
                            },
                            'unitM': {
                            'type': 'uint64',
                            'id': 9
                            },
                            'segmentType': {
                            'type': 'string',
                            'id': 10
                            },
                            'nrPoints': {
                            'type': 'uint64',
                            'id': 11
                            },
                            'data': {
                            'rule': 'repeated',
                            'type': 'double',
                            'id': 12
                            },
                            'pageEnd': {
                            'type': 'uint64',
                            'id': 13
                            },
                            'channelName': {
                            'type': 'string',
                            'id': 14
                            }
                        }
                        },
                        'IngestSegment': {
                        'fields': {
                            'channelId': {
                            'type': 'string',
                            'id': 1
                            },
                            'startTime': {
                            'type': 'uint64',
                            'id': 2
                            },
                            'samplePeriod': {
                            'type': 'double',
                            'id': 3
                            },
                            'data': {
                            'rule': 'repeated',
                            'type': 'double',
                            'id': 4
                            }
                        }
                        },
                        'TimeSeriesMessage': {
                            'fields': {
                                'segment': {
                                'type': 'Segment',
                                'id': 3
                                },
                                'event': {
                                'rule': 'repeated',
                                'type': 'Event',
                                'id': 4
                                },
                                'instruction': {
                                'type': 'Instruction',
                                'id': 5
                                },
                                'ingestSegment': {
                                'type': 'IngestSegment',
                                'id': 6
                                },
                                'totalResponses': {
                                'type': 'uint64',
                                'id': 7
                                },
                                'responseSequenceId': {
                                'type': 'uint64',
                                'id': 8
                                }
                            }
                        }
                    }
                },
                pixelRatio: 1,
                requestedPages: Object,
                chData: [],
                aSyncrequests: [],
                aSyncPreRequests: [],
                pageSize: 15000000,
                viewData: {
                    start: 0,
                    duration: 0,
                    channels: []
                },
                renderCounter: 0,
                lastDataRender: null,
                lastViewPageRequest: null,
                prefetchTimer: Object,
                prefetchDelay: 100,
                autoScale:0,
                channelsReady:false,
                prevStart:0,
                prevDuration:0,
                websocket: Object,
                initWebsocket: true,
                segment: null,
                timeSeriesMessage:null,
                timeSeriesError:null,
                channelsList:null,
                catchUpRequestPages:null,
            }
        },

        mounted: function () {

            this.requestedPages = new Map();
            this.chData = [];
            this.aSyncrequests = [];
            this.throttledGetRenderData = this.throttle(this.renderDataOnMessage, 250, {leading:false});
            this.throttledDataRender = this.throttle(this._renderData, 50);

            // Timer loop to prefetch pages --> initiated in requestData()
            const that = this;
            this.preFetchRequestFnc = function() {
                const nrPending = that.aSyncPreRequests.length;
                if (nrPending > 0) {
                    if (that.requestedPages.size < 3) {
                        that.requestDataFromServer([that.aSyncPreRequests[0]]);
                        that.aSyncPreRequests.splice(0, 1);
                    }
                } else {
                    clearInterval(that.prefetchTimer);
                    that.isPrefetching = false;
                }
            }

            const protobufInstance = protobuf.Root.fromJSON(this.proto)
            this.segment = protobufInstance.Segment;
            this.timeSeriesMessage = protobufInstance.TimeSeriesMessage
            this.timeSeriesError = protobufInstance.TimeSeriesError
            this.channelsList = protobufInstance.ChannelsList

            this.requestedPages = new Map();
            this.openWebsocket()

        },

        methods: {

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
            viewSegmComparator: function(a, b) {
                if (a.startTs< b.startTs) return -1;
                if (a.startTs > b.startTs) return 1;
                return 0;
            },
            _cpCanvasScaler: function(sz, pixelRatio, offset) {
                return pixelRatio * (sz + offset);
            },
            getScreenPixelRatio: function() {
                let ctx = this.$refs.plotArea.getContext('2d');
                let dpr = window.devicePixelRatio || 1
                let bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

                return dpr / bsr;
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
            initChannels: function(channels) {

                if (!channels) {
                    channels = this.activeViewer.channels
                }
                const chObjects = [];
                if (channels.length > 0) {

                    const channelConfig = []

                    for (let ic=0; ic<channels.length; ic++) {
                        const curC = channels[ic].content;
                        const curId = this.getChannelId(curC)
                        const curChannel = {
                            id: curId,
                            label: curC.name,
                            type: curC.channelType,
                            segments: [],
                            start: curC.start,
                            end: curC.end,
                            sampleFreq: curC.rate,
                            unit: curC.unit,
                            gaps: [], //channels[ic].gaps
                            virtualId: curC.virtualId
                        };

                        const label = curChannel.label.split(/[ _-]/, 3)
                        const label_prefix = label[0];
                        let label_value = ( (label.length > 1) ? parseFloat(label[1]) : 0);
                        label_value = ( (isNaN(label_value) ? label[1] : label_value));

                        channelConfig.push({
                            id: curChannel.id,                          // id of channel
                            type: curChannel.type,                      // Type of channel (CONTINUOUS, UNIT)
                            label: curChannel.label,                    // Label of channel
                            label_split: label,                         // array of label segments
                            label_prefix: label_prefix,                 // prefix for label
                            label_value: label_value,                   // value for label
                            dataSegments: [],                           // vector of segments rnages (start end ...)
                            rank: ic,                                   // rank for determining display order
                            visible: true,                              // channel visible in viewer?
                            plotAgainst: null,                          // for montaging
                            rowBaseline: null,                          // offset for centering
                            rowScale: 1,                                // for individual zoom
                            rowAdjust: 0,                               // offset for centering
                            selected: false,                            // Item is selected
                            hover: false,                               // User is hovering over channel
                            unit: curC.unit,                            // unit of data
                            sf: curC.rate,                              // sampling rate
                            filter: {},                                 // filter object (type, var0, var1, notch)
                            hideFilter: true,
                            isEditing: false,
                            virtualId: curChannel.virtualId
                        });

                        chObjects.push(curChannel);
                    }

                    channelConfig.sort(function(a, b) {

                        // If split into more than 2 segments, just sort on entire string
                        if (a.label_split.length > 2 || b.label_split.length > 2) {
                            return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);
                        }

                        // If prefix is similar, sort on value
                        if (a.label_prefix === b.label_prefix) {
                            return (a.label_value > b.label_value) ? 1 : ((b.label_value > a.label_value) ? -1 : 0);
                        }

                        // Sort on prefix
                        return (a.label_prefix > b.label_prefix) ? 1 : ((b.label_prefix > a.label_prefix) ? -1 : 0);
                    } );

                    // Update rank on sorted channels
                    for (let i = 0; i < channelConfig.length; i++) {
                        channelConfig[i].rank = i;
                    }

                    this.$store.dispatch('viewer/setChannels', channelConfig)
                    this.$emit('channelsInitialized')

                }

                this.computeSummary(chObjects)
                this.chData = chObjects;
                this.autoScale = channels.length;
                this.channelsReady = true;

                return Promise.resolve()

            },
            computeSummary: function(channels) {

                if (channels.length === 0) {
                    this.globalGaps = null
                    return
                }

                this.globalGaps = path(['gaps', 0], channels);

            },
            // Find segment that contains timepoint val --> search over startPage property
            segmIndexOf: function(segmArray, val, first, startAtIndex) {

                if (!startAtIndex) {
                    startAtIndex = 0;
                }
                let index;
                index = this._indexOfStart(segmArray, val, startAtIndex, segmArray.length - 1, first);

                if (index === -1) {
                    index = 0;
                } else if (index < 0) {
                    index = -index - 2;
                }
                return index;
            },

            // Find segment offset in segment array
            _indexOfStart: function(segmArray, val, min, max, firstIndex) {

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
                    const predVal = segmArray[pred].pageStart;
                    while (pred >= 0 && segmArray[pred].pageStart === predVal) {
                        pred--;
                    }
                    pred++;
                    return -pred - 2;
                }

                const mid = parseInt((min + max) / 2);

                if (segmArray[mid].pageStart > val) {
                    return this._indexOfStart(segmArray, val, min, mid - 1, firstIndex);
                } else if (segmArray[mid].pageStart < val) {
                    return this._indexOfStart(segmArray, val, mid + 1, max, firstIndex);
                } else {
                    let index = mid;
                    if (firstIndex) {
                        while (index >= 0 && segmArray[index].pageStart === val) {
                            index--;
                        }
                        index++;
                    } else {
                        while (index < segmArray.length && segmArray[index].pageStart === val) {
                            index++;
                        }
                        index--;
                    }
                    return index;
                }
            },
            // Initiate render of data --> check visible channels and create viewData object.
            generatePoints: function() {

                // If not initialized --> return
                if (!this.viewerChannels) {
                    return
                }

                this.viewData.start = this.start;
                this.viewData.duration = this.duration;

                // Get hidden channels and view-ids
                const hiddenChannels = [];
                const showChannels = [];
                const curChanViewIds = [];

                // Get IDS from channelConfig
                for (let i = 0; i < this.viewerChannels.length; i++) {
                    const curConfig = this.viewerChannels[i];
                    const id = this.getChannelId(curConfig.id)
                    if (!curConfig.visible) {
                        hiddenChannels.push(id);
                    }
                    curChanViewIds.push(id);
                }

                // Get IDS from viewData channels
                const viewDataChIds = [];
                for (let i = 0; i< this.viewData.channels.length; i++) {
                const channel = this.viewData.channels[i]
                const channelId = this.getChannelId(channel)
                    viewDataChIds.push(channelId);
                }

                // Iterate over all channels and populate channelConfig
                const remViewChannels = [];
                for (let iChan = 0; iChan < this.chData.length; iChan++) {
                    const curChan = this.chData[iChan];
                    const curChanId = this.getChannelId(curChan)
                    // Only return visible channels
                    if (hiddenChannels.indexOf(curChanId) >= 0) {
                        remViewChannels.push(curChanId);
                    } else {
                        showChannels.push(curChan);
                    }
                }

                // removing channels from viewData when not shown.
                // Iterate backwards to prevent issues of indexing
                remViewChannels.sort();
                for (let i=(remViewChannels.length-1); i>=0; i--) {
                    this.splice('viewData.channels', remViewChannels[i], 1);
                    viewDataChIds.splice(remViewChannels[i], 1);
                }

                // Get viewDataChannels
                for (let i=0; i< showChannels.length; i++) {
                    const curShowChannel = showChannels[i]
                    const showChannelId = this.getChannelId(curShowChannel);
                    const idx = viewDataChIds.indexOf(showChannelId);
                    if (idx < 0 ) {
                        this.viewData.channels.push({
                            id: showChannelId,
                            mean: null,
                            firstRenderedIndex: 0,
                            lastRenderedIndex: 0,
                            blocks: []
                        });

                    }
                }

                // Request data on visible channels
                // Only request when pageForward key is released
                // if (!this.spacePressed && this.selectedTab === 'timeseries') {
                this.requestData(showChannels, this.start, this.duration);
                // }
            },
            // Getting data from cache and queue new reqeusts from server
            requestData: function(showChannels, start, duration ) {

                // If number of requestedpages is getting to big, reset websocket connection

                // TODO: BRING BACK
                // if (this.requestedPages.size > 20 ) {
                //     clearTimeout(this.preFetchTime);
                //     this.aSyncPreRequests = [];
                //     this.reRequestPages();
                //     this.openWebsocket();
                //     return;
                // }


                // Init asnch requests for viewport pages
                this.aSyncRequests = [];

                // If we rerender the same viewport (as data comes in) --> don't change prefetch
                let updatePrefetchPages = false
                if (this.prevStart !== start || this.prevDuration !== duration) {
                    this.aSyncPreRequests= []
                    updatePrefetchPages = true
                }

                this.prevStart = start;
                this.prevDuration = duration;

                // Timestamp of first value in viewport
                const viewDataChIds = [];
                for (let i=0; i<this.viewData.channels.length; i++) {
                    const cChannel = this.viewData.channels[i]
                    const cChannelId = this.getChannelId(cChannel)
                    viewDataChIds.push(cChannel);
                }

                // Iterate over channels and populate aSyncRequests and/or chanViewData
                for (let iChan = 0; iChan < showChannels.length; iChan++) {
                    let continuationSegment = false;
                    const curChan = showChannels[iChan];
                    const chDataSegments = curChan.segments;
                    const curChanId = this.getChannelId(curChan)
                    // Get dataView
                    const idx = findIndex(propEq('id', curChanId), viewDataChIds)
                    const chanViewData = this.viewData.channels[idx];
                    chanViewData.blocks = [];

                    // Populate chanViewData until all data in scope is added, or requested from server.
                    // Independent of actual request, populate viewData by pageSegments.
                    let curTime = Math.floor(start/ this.pageSize) * this.pageSize;
                    if (curTime < 0) {
                        curTime = 0;
                    }

                    let firstSegment = 0;
                    let segmOffset = 0;
                    if (chDataSegments.length > 0) {
                        firstSegment = this.segmIndexOf(chDataSegments, curTime, true, 0);
                    }

                    // Iterate over blocks in viewport and add to chanView, or asyncRequests
                    let endRequestTime = start + duration + this.constants['PREFETCHPAGES']*this.pageSize;
                    if (endRequestTime > this.ts_end) {
                        endRequestTime = this.ts_end;
                    }

                    let curSegm;
                    if (chDataSegments.length > 0) {
                        curSegm = chDataSegments[firstSegment];
                    }
                    while ((curTime < endRequestTime) || continuationSegment) {
                        continuationSegment = false;

                        // If current time == start of current page in cache then page is correct.
                        let inRange = false;
                        if (curSegm) {
                            inRange = curTime >= curSegm.pageStart && curTime <= curSegm.pageEnd;
                        }
                        if (inRange) {
                            /*
                            Data is already cached
                            */
                            let isViewPage = curSegm.startTs < start + duration;

                            segmOffset += 1;
                            //curTime = curSegm.startTs + curSegm.nrPoints*curSegm.samplePeriod;
                            curTime = curSegm.pageEnd;

                            // Only add to viewData if segment is not a prefetch page
                            if (isViewPage) {
                                chanViewData.blocks.push(curSegm);
                            }

                            const prevPageTime = curSegm.pageStart;
                            curSegm = chDataSegments[firstSegment + segmOffset];
                            if (!this.isStreaming && curSegm && prevPageTime === curSegm.pageStart) {
                                continuationSegment = true;
                            }

                        } else {
                            /*
                            Data is not present on client and needs to be requested from server
                            */

                            // Check if segment is already being requested
                            if (this.requestedPages.get(curTime)) {
                                curTime += this.pageSize;
                                if (curSegm && curTime >= curSegm.pageEnd) {
                                    while (curSegm.pageEnd < curTime) {
                                        segmOffset += 1;
                                        curSegm = chDataSegments[firstSegment + segmOffset];
                                        if (!curSegm) {
                                            break;
                                        }
                                    }
                                }
                                continue;
                            }

                            let isViewPage = curTime < start + duration;


                            // Check if requested range is already requested by other channel --> update
                            let isAdded = false;
                            if (isViewPage) {

                                //remove from pre-request
                                for (let iA in this.aSyncPreRequests) {
                                    if (this.aSyncPreRequests[iA].start === curTime) {
                                        this.aSyncPreRequests.splice(iA, 1);
                                        break;
                                    }
                                }


                                for (let iA in this.aSyncRequests) {
                                    if (this.aSyncRequests[iA].start === curTime) {
                                        this.aSyncRequests[iA].channels.push(curChan);
                                        isAdded = true;
                                    }
                                }
                                if (!isAdded) {
                                    this.aSyncRequests.push({
                                        channels: [curChan],
                                        start: curTime,
                                        duration: this.pageSize,
                                        isInViewport: true,
                                        pixelWidth: Math.ceil(this.rsPeriod)});
                                }


                            } else {
                                if (updatePrefetchPages) {
                                    for (let iA in this.aSyncPreRequests) {
                                        if (this.aSyncPreRequests[iA].start === curTime) {
                                            this.aSyncPreRequests[iA].channels.push(curChan);
                                            isAdded = true;
                                        }
                                    }
                                    if(!isAdded) {
                                        this.aSyncPreRequests.push({
                                            channels: [curChan],
                                            start: curTime,
                                            duration: this.pageSize,
                                            isInViewport: false,
                                            pixelWidth: Math.ceil(this.rsPeriod)});
                                    }
                                }
                            }
                            curTime += this.pageSize;
                            if (curSegm && curTime >= curSegm.pageEnd) {
                                while (curSegm.pageEnd < curTime) {
                                    segmOffset += 1;
                                    curSegm = chDataSegments[firstSegment + segmOffset];
                                    if (!curSegm) {
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    // Sort the ChannelView pages
                    chanViewData.blocks.sort(this.viewSegmComparator);
                }

                // Directly request all pages that are in the viewport
                if (this.aSyncRequests.length > 0) {

                    // order requests to make sure request with start in viewport is first.
                    let firstRequest = 0;
                    for (let i=0; i<this.aSyncRequests.length; i++) {
                        if (this.aSyncRequests[i].start >= this.start && this.aSyncRequests[i].start < (this.start +this.duration)) {
                            firstRequest = i;
                        }
                    }

                    this.requestDataFromServer(this.aSyncRequests, firstRequest);
                    this.lastViewPageRequest = Date.now();
                }

                // Requests Pre-fetch pages throttled, after viewport pages are available
                if (this.aSyncPreRequests.length > 0 ) {
                    if (!this.isPrefetching) {
                        this.prefetchTimer = setInterval(this.preFetchRequestFnc, 150);
                        this.isPrefetching = true;
                    }
                }
            },
            // Request pages from the Server
            requestDataFromServer: function(requests, firstRequest = 0) {
                // Do the actual Websocket requests.
                if (requests.length > 0) {

                    const datasetEndTime = this.ts_end;
                        // check for last block
                    for(let i = 0; i < requests.length; i++) {
                        let curRequest;
                        if (i === 0 ) {
                            curRequest = requests[firstRequest];
                        } else if (i === firstRequest) {
                            curRequest = requests[0];
                        } else {
                            curRequest = requests[i];
                        }

                        // check for last block
                        let requestEndTime = curRequest.start + curRequest.duration;
                        if (requestEndTime > datasetEndTime) {
                            requestEndTime = datasetEndTime;
                        }

                        const ws = this._websocket;
                        if (ws && ws.readyState === 1) {

                            const virtualChannels = curRequest.channels.map(channel => {
                                return { id: channel.id, name: channel.label, }
                            })

                            const req = {
                                session: this.$store.state.userToken,
                                minMax: true,
                                startTime: curRequest.start,
                                endTime: requestEndTime,
                                packageId: this.activeViewer.content.id,
                                pixelWidth: curRequest.pixelWidth,
                                virtualChannels
                            };
                            const reqJson = JSON.stringify(req);
                            ws.send(reqJson);

                            // ChannelCounter will capture number of expected packages for each channel
                            // This number is set when first package arrives.
                            const nrChannels = curRequest.channels.length;
                            const channelCounter = new Map();
                            for (let j=0; j < nrChannels; j++) {
                                channelCounter.set(curRequest.channels[j], NaN);
                            }

                            this.requestedPages.set(curRequest.start,
                                { count: nrChannels,
                                    counter: channelCounter,
                                    subPageCount: NaN,
                                    ts: (Date.now() + 550),
                                    inViewport: curRequest.isInViewport} );

                        } else {
                            console.log('Websocket Closed')
                            return false;
                        }
                    }
                    this.aSyncrequests = [];
                }
                return true;
            },

            invalidate: function() {
                console.log('Invalidating')

                clearTimeout(this.preFetchTime);
                this.aSyncPreRequests = [];
                this.globalGaps = [];
                this.requestedPages.clear()
                for (let i=0; i<this.chData.length; i++) {
                    this.chData[i].segments = [];
                }
                for (let i=0; i<this.viewData.channels.length; i++) {
                    this.viewData.channels[i].blocks = [];
                }
                this.renderAll()
            },
            // _________________
            // RENDER METHODS

            renderAll: function() {
                this.generatePoints();
                this._renderData();
            },
            // computes the channelConfig properties based on current settings of viewer.
            _computeChannelViews: function() {

                // find channel order based on rank
                const mapped = this.viewerChannels.map(function(el, i) { return { index: i, value: el.rank }; })
                mapped.sort(function(a, b) {return +(a.value > b.value) || +(a.value === b.value) - 1;});
                const rankedIds = mapped.map(function(el) {return el.index;});
                const interChannelDist = this.pHeight / this.nrVisibleChannels;

                // update properties
                let curIdx = 0;
                for (let i = 0; i < rankedIds.length; i++) {
                    const curRow = this.viewerChannels[rankedIds[i]];
                    if (curRow.visible) {
                        curRow.rowBaseline = (0.5*interChannelDist) + curIdx * interChannelDist;
                        curIdx++;
                    } else {
                        curRow.rowBaseline = null;
                    }
                }
            },
            // Compute canvas coordinates from datarray
            getPointCoords: function(channelInfo, channelData, isRedraw) {
                // Iterate over channelData on single channel ---> channelData are continuous in time
                let segmLength = channelData.blocks.length;

                // find mean of rendered data
                switch (channelInfo.type) {
                    case 'UNIT':
                        if (!isRedraw) {
                            for (let iSegm = 0; iSegm < segmLength; iSegm++) {

                                const curSeg = channelData.blocks[iSegm];

                                // Iterate over points in segment and set cx, cy, and cy2
                                const curCData = curSeg.cData;
                                const curData = curSeg.parsedData;
                                const xOffset = this.constants['XOFFSET'];

                                // create local variable for speed
                                const length = curSeg.parsedData[0].length;
                                const cXArray = curCData[0];
                                const cYArray = curCData[1];
                                const cY2Array = curCData[2];
                                const XArray = curData[0];

                                // RowBaseline is offset of channel in viewPort
                                const rowBaseLine = channelInfo.rowBaseline | 0;

                                // satrtTime
                                const startT = this.start;

                                // Pixel Period
                                const rsP = this.rsPeriod;

                                const spikeHeigth = (this.cHeight / (2 * (this.nrVisibleChannels + 1))) |0;


                                for(let iPoint = 0; iPoint < length; iPoint++) {

                                    cXArray[iPoint] = (((xOffset + (XArray[iPoint] - startT ) / (rsP))));
                                    cYArray[iPoint] = rowBaseLine - spikeHeigth;
                                    cY2Array[iPoint] = rowBaseLine + spikeHeigth;
                                }
                            }
                        }
                        break;

                    case 'CONTINUOUS':
                        let totalPointsInMean = 0;

                        if (!isRedraw) {
                            channelData.mean = 0;
                            channelData.median = 0;
                            for (let iSegm = 0; iSegm < segmLength; iSegm++) {
                                const curBlock = channelData.blocks[iSegm];
                                if (curBlock.nrValidPoints > 0) {
                                    channelData.mean = ( curBlock.sumElem +
                                        (totalPointsInMean * channelData.mean)) / (totalPointsInMean + curBlock.nrValidPoints);
                                    channelData.median = ( curBlock.median +
                                        (totalPointsInMean * channelData.median)) / (totalPointsInMean + curBlock.nrValidPoints);
                                    totalPointsInMean += curBlock.nrValidPoints;
                                }
                            }
                        }

                        for (let iSegm = 0; iSegm < segmLength; iSegm++) {

                            const curSeg = channelData.blocks[iSegm];

                            // Find startIndex viewPort
                            let startIndex = Math.floor((this.start - curSeg.startTs ) / curSeg.samplePeriod);
                            curSeg.renderStartIndex = ((startIndex > 0) ? startIndex : 0)

                            let endIndex = Math.floor( ((this.start + this.duration) - (curSeg.startTs + curSeg.nrPoints*curSeg.samplePeriod))/curSeg.samplePeriod );
                            curSeg.renderEndIndex = endIndex >= 0 ? (curSeg.nrPoints-1) : (curSeg.nrPoints + endIndex);

                            // Iterate over points in segment and set cx, cy, and cy2
                            const curCData = curSeg.cData;
                            const curData = curSeg.parsedData;
                            const curScale = this.globalZoomMult * channelInfo.rowScale;
                            const xOffset = this.constants['XOFFSET'];

                            // create local variable for speed
                            const length = curSeg.parsedData[0].length;
                            const cXArray = curCData[0];
                            const cYArray = curCData[1];
                            const cY2Array = curCData[2];
                            const XArray = curData[0];
                            const YArray = curData[1];
                            const Y2Array = curData[2];

                            // RowBaseline is offset of channel in viewPort
                            const rowBaseLine = channelInfo.rowBaseline;

                            // chDatMean is mean value of channel in viewport
                            let chDatCenterer = 0;
                            if (this.constants['USEMEDIAN']) {
                                chDatCenterer = channelData.median;
                            } else {
                                chDatCenterer = channelData.mean;
                            }

                            const rsp = this.rsPeriod;
                            const startT = this.start;
                            for(let iPoint = 0; iPoint < length; iPoint++) {

                                cXArray[iPoint] = (((xOffset + (XArray[iPoint] - startT ) / rsp)));
                                cYArray[iPoint] = (((rowBaseLine + (YArray[iPoint] - chDatCenterer) * curScale)));

                                if (curSeg.isMinMax) {

                                    // If min and max are the same --> force 1 pixel line.
                                    if (YArray[iPoint] === Y2Array[iPoint]) {
                                        cY2Array[iPoint] = cYArray[iPoint] + 1;
                                    }else {
                                        cY2Array[iPoint] = (((rowBaseLine + (Y2Array[iPoint] - chDatCenterer) * curScale)));
                                    }
                                }
                            }
                        }
                        break;
                }
            },
            _renderData: function(isRedraw=false) {
                const ba = this.$refs.blurArea;
                const ctxb = ba.getContext('2d');
                ctxb.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
                ctxb.fillStyle = 'rgb(220,220,220)'


                const pa = this.$refs.plotArea;
                const ctx = pa.getContext('2d');
                ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

                // clear canvas
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctxb.clearRect(0, 0, this.cWidth, this.cHeight);

                // update number of visible channels
                const nrVisCh = this.viewerChannels.reduce((accumulator, currentValue) => {
                  if(currentValue.visible) {
                    return accumulator + 1
                  }
                  return accumulator
                }, 0)

                this.nrVisibleChannels = nrVisCh;

                // Update label Div
                // this.$.labelTemplate.render();

                // Compute the channel views for returned data
                this._computeChannelViews();

                ctx.save();
                // let allTimes = 0;
                for (let ch in this.viewData.channels ) {
                    if (this.viewData.channels.hasOwnProperty(ch)) {
                        // const chTimeStart = new Date().getTime();

                        const curChannelData = this.viewData.channels[ch];

                        // Get channelview for current channel
                        let curChannelView = null;
                        curChannelView = this.viewerChannels.find((elem) => {
                            return elem.id === curChannelData.id
                        })

                        if(!curChannelView || !curChannelView.visible) {
                            continue;
                        }

                        // Render segment placeholders
                        const startT = this.start;
                        const rsP = this.rsPeriod;
                        const xOffset = this.constants['XOFFSET'];
                        const blurHeight = Math.min( Math.round((this.cHeight/this.viewData.channels.length)- 2), 10);
                        for (let i = 0; i < curChannelView.dataSegments.length; i+=2) {
                            if (curChannelView.dataSegments[i + 1] < startT) {
                                continue
                            }
                            if (curChannelView.dataSegments[i] > (startT + this.duration)) {
                                break;
                            }
                            let xPos1 = Math.floor((((xOffset + (curChannelView.dataSegments[i] - startT ) / (rsP)))));
                            let xPos2 = Math.floor((((xOffset + (curChannelView.dataSegments[i + 1] - startT ) / (rsP)))));
                            let yPos = Math.floor(curChannelView.rowBaseline - blurHeight/2);
                            ctxb.fillRect(xPos1, yPos, xPos2-xPos1, blurHeight);
                        }

                        // Get canvas points for current channel
                        this.getPointCoords(curChannelView, curChannelData, isRedraw);

                        // check Channel-Type
                        const nrBlocks = curChannelData.blocks.length;
                        let channelType = 'Continuous';
                        if (nrBlocks) {
                            channelType = curChannelData.blocks[0].type;
                        }

                        // draw channel segments.
                        if(curChannelView.hover) {
                            if (curChannelView.selected) {
                                ctx.strokeStyle = 'rgba(39,96,255,0.70)';
                                ctx.fillStyle = 'rgba(39,96,255,0.70)';
                            } else {
                                ctx.strokeStyle = 'rgba(39,96,255,0.60)';
                                ctx.fillStyle = 'rgba(39,96,255,0.60)';
                            }

                        } else if(curChannelView.selected) {
                            ctx.strokeStyle = 'rgb(39,96,255)';
                            ctx.fillStyle = 'rgb(39,96,255)';
                        } else if (channelType === 'Neural') {
                            ctx.strokeStyle = 'rgb(120,120,120)';
                        } else {
                            ctx.strokeStyle = 'black';
                            ctx.fillStyle = 'black';
                        }

                        let lastBlockEnd = null;
                        let doPolFill = true;
                        let realSamplePeriod = 1000000 * (1/curChannelView.sf);

                        for (let block = 0; block < nrBlocks; block++) {

                            const curBlock = curChannelData.blocks[block];

                            if (curBlock.nrPoints === 0) {
                                continue;
                            }

                            const curData = curBlock.cData;
                            const curDataLength = curBlock.nrPoints;
                            const xVec = curData[0];
                            const yVec = curData[1];
                            const y2Vec = curData[2];

                            let startIndex = curBlock.renderStartIndex;
                            let endIndex = curBlock.renderEndIndex

                            ctxb.clearRect(Math.floor(xVec[startIndex]), Math.floor(curChannelView.rowBaseline - blurHeight/2), Math.ceil(xVec[endIndex]-xVec[startIndex] + 2), blurHeight+1);

                            // Check if minMax and render data
                            switch (curBlock.type) {
                                case 'Continuous':
                                case 'realtime':

                                if (curBlock.isMinMax) {
                                    /*
                                    Data is served as min/max per timespan. Based on render settings
                                    we render polygon through points, or render vertical lines.
                                    Default is rendering polygon for accuracy.
                                    */

                                    if ((curBlock.samplePeriod / realSamplePeriod) < 3) {
                                        doPolFill = false;
                                    }

                                    if (doPolFill) {

                                        ctx.beginPath();

                                        // set cursor to starting point of polygon
                                        if (block > 0 ) {//&& !this.isStreaming){
                                            if(xVec[startIndex] < (lastBlockEnd.x + 3)) {
                                                ctx.moveTo(lastBlockEnd.x, lastBlockEnd.y);
                                            } else {
                                                ctx.moveTo(xVec[startIndex], yVec[startIndex]);
                                            }

                                        } else{
                                            ctx.moveTo(xVec[startIndex], yVec[startIndex]);
                                        }

                                        // Draw lines in segment
                                        for (let i = startIndex; i < (endIndex+1); i++) {
                                            ctx.lineTo(xVec[i], yVec[i]);
                                        }
                                        for (let i2 = (endIndex-1); i2 >= startIndex; i2--) {
                                            ctx.lineTo(xVec[i2], y2Vec[i2]);
                                        }

                                        // Draw line to end of last segment
                                        if (block > 0 ) {//&& !this.isStreaming){
                                            if(xVec[startIndex] < (lastBlockEnd.x + 3)) {
                                                ctx.lineTo(lastBlockEnd.x, lastBlockEnd.y2);
                                            }
                                        }

                                        ctx.closePath();
                                        ctx.fill();
                                    } else {

                                        ctx.beginPath();
                                        for (let i = startIndex; i < (endIndex+1); i++) {

                                            ctx.lineTo(xVec[i], yVec[i]);
                                            ctx.lineTo(xVec[i], y2Vec[i]);
                                            ctx.moveTo(xVec[i], yVec[i]);
                                        }
                                        ctx.stroke();
                                    }

                                } else {
                                    if(block===0) {
                                        ctx.beginPath();
                                        ctx.moveTo(xVec[startIndex], yVec[startIndex]);
                                    } else if(xVec[startIndex] > (lastBlockEnd.x + 2)) {
                                        ctx.moveTo(xVec[startIndex], yVec[startIndex]);
                                    }
                                    for (let i = startIndex; i < (endIndex+1); i++) {
                                        ctx.lineTo(xVec[i], yVec[i]);
                                    }
                                    if (block===(nrBlocks-1)) {
                                        ctx.stroke();
                                    }

                                }
                                break;
                                case 'Neural':

                                    /* is neural event data
                                        render timestamps as vertical lines. We are currently assuming
                                        single cluster of event --> single color. V2 should include
                                        coloring based on cluster number.
                                    */

                                    // Assume that the data is sorted by cluster
                                    ctx.beginPath();
                                    for (let i = 0; i < curDataLength; i++) {
                                        ctx.moveTo(xVec[i], yVec[i] );
                                        ctx.lineTo(xVec[i], y2Vec[i] );
                                    }
                                    ctx.stroke();


                            }

                            lastBlockEnd = {
                                x: xVec[curDataLength -1],
                                y: yVec[curDataLength -1],
                                y2: y2Vec[curDataLength -1]
                            }

                        }

                        // const chTimeEnd = new Date().getTime();
                        // allTimes = allTimes +(chTimeEnd-chTimeStart);
                    }
                }
                ctx.restore();
               // console.log('render time: ' + allTimes)
            },

            // Function that is called with the throttledDataRenderer
            renderDataOnMessage: function() {
                this.generatePoints();
                if (this.autoScale === 0) {
                    this.autoScale--;          // Set to -1 (no autoscale)
                    this.autoScaleViewData();
                } else {
                    this._renderData();
                }

            },
            // Method sets the global zoom multiplier based on the viewport data buffer.
            // This is called once when first page is available
            autoScaleViewData: function() {
                console.log('autoscale')
                let sumMedian = 0;
                let nrSeg = 0;
                let allChannels = this.viewData.channels;
                const allSums = []
                for (let i=0; i<allChannels.length; i++) {


                    let curBlocks = allChannels[i].blocks;
                    for (let j=0; j<curBlocks.length; j++) {
                        if(curBlocks[j].type !== 'Continuous') {
                            continue;
                        }

                        sumMedian += this.standardDeviation(curBlocks[j].parsedData[1]);
                        nrSeg++;
                        allSums.push({channel: i, sumMedian})
                    }
                }
                const percentage = allSums.length * .80;
                const median = this.calcSumMedian(percentage, allSums);
                const avgStd = median / nrSeg;
                if (!isNaN(avgStd)) {
                    this.$emit('setGlobalZoom', (this.cHeight / allSums.length) / (2 * avgStd))
                }
            },
            /**
             * Calculate median sum for list of channels
             * @param {Number} percentage
             * @param {Array} list
             * @returns {Number}
             */
            calcSumMedian: (percentage, list) => compose(
              sum,
              map(prop('sumMedian')),
              take(percentage),
              sortBy(prop('sumMedian'))
            )(list),

            // Helper function for autoscale
            standardDeviation: function(values) {
                const avg = this.average(values);

                const squareDiffs = values.map(function(value) {
                    const diff = value - avg;
                    const sqrDiff = diff * diff;
                    return sqrDiff;
                });

                const avgSquareDiff = this.average(squareDiffs);

                const stdDev = Math.sqrt(avgSquareDiff);
                return stdDev;
            },
            // Helper function for autoscale
            average: function(data) {
                const sum = data.reduce(function(sum, value) {
                    return sum + value;
                }, 0);

                const avg = sum / data.length;
                return avg;
            },
            // Get all pages that are partially returned and re-request
            reRequestPages: function() {

                const requestPages = [];
                this.requestedPages.forEach(function(value, key) {
                // Only rerequest pages where we already have partial return
                    if (!isNaN(value.subPageCount)) {

                        // only include channels with partial return
                        const channels = [];
                        value.counter.forEach(function(count, chId) {
                            if (!isNaN(count) && count > 0) {
                                channels.push(chId)
                            }
                        })

                        if (channels.length > 0) {
                            requestPages.push({
                                channels: channels,
                                start: key,
                                duration: this.pageSize,
                                isInViewport: true,
                                pixelWidth: this.rsPeriod
                            });
                        }
                    }
                }, this);

                // clear requestedPages
                this.requestedPages.clear();

                this.catchUpRequestPages = requestPages;
            },


            // _________________
            // WEBSOCKET METHODS
            openWebsocket: function() {

                //if the websocket is opening or already open, don't open a new one
                if (this._websocket && (this._websocket.readyState === 0 || this._websocket.readyState === 1) ) {
                    return;
                }

                let url = this.timeSeriesUrl
                this._websocket = new WebSocket(url);
                this._websocket.onopen = this._onWebsocketOpen.bind(this);
                this._websocket.onclose = this._onWebsocketClose.bind(this);
                this._websocket.onmessage = this._onWebsocketMessage.bind(this);

            },
            sendMontageMessage: function (value) {
                if (this._websocket && this._websocket.readyState === 1) {
                    const payload = { montage: value, packageId: this.activeViewer.content.id }
                    this._websocket.send(JSON.stringify(payload))
                } else {
                    this.async(() => {this.sendMontageMessage(value)}, 500)
                }
            },
            _onWebsocketClose: function(e) {
                console.log('Websocket closed function')
                clearTimeout(this.preFetchTime);
                this.aSyncPreRequests = [];
                this.openWebsocket();
            },
            _onWebsocketFinalClose: function(e) {
                console.log('Websocket closed forever');
            },
            _onWebsocketOpen: function(e) {
                console.log('Websocket is opened')
                if (this.initWebsocket) {
                    let chIds = [];
                    for (let i=0; i<this.viewerChannels.length; i++) {
                        chIds.push(this.viewerChannels[i].id)
                    }
                    let message = {'channelFiltersToClear':chIds};
                    // clear filters
                    this.sendFilterMessage(message);
                    // clear montage
                    const payload = { montage: 'NOT_MONTAGED', packageId: this.activeViewer.content.id }
                    this._websocket.send(JSON.stringify(payload))
                    this.initWebsocket = false;
                }

                if (this.catchUpRequestPages && this.catchUpRequestPages.length > 0) {
                    this.requestDataFromServer(this.catchUpRequestPages);
                }
                this.catchUpRequestPages = [];

                if(this.isStreaming) {
                    this.initStream();
                }

                this.generatePoints();
            },
            _onWebsocketMessage: function(msg) {
              // process json messages
              if (typeof msg.data === 'string') {
                let data = {}

                try {
                  data = JSON.parse(msg.data)
                } catch (e) {
                  this.$store.dispatch('viewer/setViewerErrors', { error: 'JSON Parse Error' })
                }

                if (data.channelDetails) {
                  const baseChannels = this.activeViewer.channels
                  const virtualChannels = data.channelDetails.map(({ id, name }) => {
                    const baseChannel = baseChannels.find(ch => (ch.content.id === id))
                    const content = {
                      id,
                      name,
                      channelType: baseChannel.content.channelType,
                      label: name,
                      unit: baseChannel.content.unit,
                      rate: baseChannel.content.rate,
                      start: baseChannel.content.start,
                      end: baseChannel.content.end,
                      virtualId: `${id}_${name}`
                    }
                    // ensure that channel ids are unique for montages
                    if (this.viewerMontageScheme !== 'NOT_MONTAGED') {
                      content.id = `${id}_${name}`
                    }
                    return { content, properties: [] }
                  })

                  this.initChannels(virtualChannels)
                    .then(() => {
                        this.invalidate()
                        this.renderAll()
                    })
                } else if (data.error) {
                  this.$store.dispatch('viewer/setViewerErrors', data)
                }

                // short circuit
                return
              }

              // process protobuf messages
              const myReader = new FileReader();
              myReader.parent = this;
              myReader.addEventListener('loadend', function(e) {
                  const buffer = e.srcElement ? e.srcElement.result : e.target.result; //arraybuffer object
                  const barray = new Uint8Array(buffer)

                  const timeSeriesMessage = this.parent.timeSeriesMessage.decode(barray);
                  const segment = timeSeriesMessage.segment;

                  // Handle Neural Data
                  if (timeSeriesMessage.event && timeSeriesMessage.event.length>0 && timeSeriesMessage.event[0].pageStart) {

                      const tsEvent = timeSeriesMessage.event[0];
                      const dataPoints = [[], []];
                      const nrVal = tsEvent.times.length/2;

                      let curI = 0;
                      for (let i = 0; i < nrVal; i++) {
                          dataPoints[0].push( tsEvent.times[curI]);
                          dataPoints[1].push( tsEvent.times[curI + 1]);
                          curI += 2;
                      }

                      let cData = new Array(3);
                      let k=0;
                      while (k < 3) {
                          cData[k] = new Float32Array(dataPoints[0].length);
                          k++;
                      }

                      const segm = {
                          chId: tsEvent.source,
                          lastUsed: 0,
                          unit: 'uV',
                          samplePeriod: tsEvent.samplePeriod,
                          pageStart: tsEvent.pageStart,
                          pageEnd: tsEvent.pageEnd,
                          startTs: tsEvent.pageStart,
                          isMinMax: tsEvent.isResampled,
                          unitM: 1,
                          type: 'Neural',
                          nrPoints: nrVal,
                          parsedData: dataPoints,
                          cData: cData
                      };

                      this.parent.dataCallback({
                          pageStart: tsEvent.pageStart,
                          data: segm,
                          type: 'Neural',
                          nrResponses: timeSeriesMessage.totalResponses
                      });
                  }

                  // Handle Regular Timeseries data package.
                  if (segment !== null) {
                      // Check if viewer is still interested in the arriving data
                      if (segment.requestedSamplePeriod !== Math.ceil(this.parent.rsPeriod)) {
                          return
                      }

                      // create array from points of data.
                      let nrVal = null;
                      if (segment.isMinMax) {
                          // Create min/max vectors
                          nrVal = segment.data.length/2;
                      } else {
                          //its just one big list of values
                          nrVal = segment.data.length;
                      }

                      const parsedData = new Array(3);
                      const startTs = segment.startTs

                      let sumElem = 0;
                      let nrValidPoints = 0;
                      let i = 0;
                      while (i < 3) {
                          parsedData[i] = new Float64Array(nrVal);
                          i++;
                      }

                      if (segment.isMinMax) {
                        // Create min/max vectors
                        let curI = 0;
                        for (let i = 0; i < nrVal; i++) {
                          let curY = -segment.data[curI];
                          let curY2 = -segment.data[curI + 1];
                          parsedData[0][i] = startTs + (i * segment.samplePeriod);
                          parsedData[1][i] = curY;
                          parsedData[2][i] = curY2;
                          if (!isNaN(curY)) {
                              nrValidPoints++;
                              sumElem += curY + (curY2 - curY)/2;
                          }
                          curI += 2;

                        }

                      } else {
                        //its just one big list of values
                          for (let i = 0; i < nrVal; i++) {
                              let curY = -segment.data[i];
                              parsedData[0][i] = startTs + (i * segment.samplePeriod);
                              parsedData[1][i] = curY;
                              if (!isNaN(curY)) {
                                  nrValidPoints++;
                                  sumElem += curY;
                              }
                          }
                      }

                      let elemMedian = 0;
                      if (this.parent.constants['USEMEDIAN']) {
                          const sortedYvals = Array.prototype.slice.call(parsedData[1]).sort();
                          if (segment.isMinMax) {
                              elemMedian = sortedYvals[Math.round(sortedYvals.length/2)];
                          } else {
                              elemMedian = sortedYvals[Math.round(sortedYvals.length)];
                          }
                      }

                      let cData = new Array(3);
                      let k=0;
                      while (k < 3) {
                          cData[k] = new Float32Array(parsedData[0].length);
                          k++;
                      }

                      const segm = {
                          chId: segment.source,
                          lastUsed: segment.lastUsed,
                          unit:segment.unit,
                          samplePeriod: segment.samplePeriod,
                          pageStart: segment.pageStart,
                          pageEnd: segment.pageEnd,
                          startTs: startTs,
                          isMinMax: segment.isMinMax,
                          unitM: segment.unitM,
                          type: segment.segmentType,
                          nrPoints: nrVal,
                          cData: cData,
                          parsedData: parsedData,
                          median: elemMedian,
                          sumElem: sumElem,
                          nrValidPoints: nrValidPoints,
                          name: segment.channelName,
                          label: segment.channelName,
                          virtualId: `${segment.source}_${segment.channelName}`
                      };

                      if(segm.nrPoints>0) {

                          this.parent.dataCallback({
                              pageStart: segment.pageStart,
                              data: segm,
                              type: segment.segmentType,
                              nrResponses: timeSeriesMessage.totalResponses
                          });
                      } else {
                          // Check if already in Gap Array
                          this.parent.dataCallback({
                              pageStart: segment.pageStart,
                              data: segm,
                              nrResponses: timeSeriesMessage.totalResponses,
                              type: 'gap'
                          });

                      }
                  }
              });

              myReader.readAsArrayBuffer(msg.data);
            },
            sendFilterMessage: function(msg) {
              if (this._websocket && this._websocket.readyState === 1) {
                const parms = msg.filterParameters || [];
                parms.forEach( p => {
                    if (!this.isTruthy(p)) {
                        return;
                    }
                });
                this._websocket.send(JSON.stringify(msg));
              } else {
                this.async(() => {this.sendFilterMessage(msg)}, 200);
              }
            },
            isTruthy: val => val && val !== '' && !val.isNaN,
            calcFilterType: function(low, high, notch) {
              switch(true) {
                case !this.isTruthy(low) && !this.isTruthy(high) && !notch:
                  return 'clear';
                case this.isTruthy(low) && this.isTruthy(high):
                  return 'bandpass';
                case this.isTruthy(low):
                  return 'highpass';
                case this.isTruthy(high):
                  return 'lowpass';
                default:
                  return 'bandstop';
              }
            },
            // Callback method for async data fetch from server
            dataCallback: function(obj) {

                // Autoscale counter is set to number > 0 for first request, and autoscale is triggered when
                // counter reaches 0.
                if (this.autoScale > 0) {
                    this.autoScale--;
                }

                // Find channel for object in chData
                let curChData = null;
                for (let ch = 0; ch < this.chData.length; ch++) {
                    if (this.chData[ch].label === obj.data.label) {
                        curChData = this.chData[ch];
                        break;
                    }
                }

                // Based on Obj type, handle placement in cache differently
                switch(obj.type) {

                    case 'gap':
                    case 'Neural':  //neural and continuous data get put in the cache the same way
                    case 'Continuous':

                    // Check if data already exists in chData (happens when zoom out, and back in before data is there)
                    let addData = false;
                    let curSegments = curChData && curChData.segments;
                    if (curSegments && obj.type !== 'gap') {
                        addData = true;
                        if (curSegments.length > 0) {
                            let fIndex = this.segmIndexOf(curSegments, obj.data.startTs, true, 0);

                            // Iterate over all segments in CHData with same pageStart to see if page is already present
                            while( curSegments[fIndex] && curSegments[fIndex].pageStart === obj.data.pageStart) {
                                if (curSegments[fIndex].startTs === obj.data.startTs) {
                                    addData = false;
                                    break;
                                }
                                fIndex++;
                            }
                        }
                    }

                    // Remove returned page from the list of requested Pages.
                    let requestedPage = this.requestedPages.get(obj.data.pageStart);
                    // array or page IDs (timestamp, based on viewport)
                        // array of channel IDs
                    if (requestedPage) {

                        // Update time
                        requestedPage.ts = Date.now();

                        let countForChannel = requestedPage.counter.get(obj.data.chId);
                        if (isNaN(countForChannel)) {
                            countForChannel = obj.nrResponses -1;
                            requestedPage.counter.set(obj.data.chId, countForChannel);
                            requestedPage.subPageCount = countForChannel;
                        } else {
                            countForChannel = countForChannel - 1;
                            requestedPage.counter.set(obj.data.chId, countForChannel);
                        }

                        if (countForChannel === 0) {
                            let isComplete = true;
                            for (let value2 of requestedPage.counter.values()) {
                                if (value2 > 0 || isNaN(value2)) {
                                    isComplete = false;
                                    break;
                                }
                            }
                            if (isComplete) {
                                this.requestedPages.delete(obj.data.pageStart);
                                // console.log('isComplete')
                            }

                        }

                    }

                    // Add data to local cache
                    if (addData) {
                        curSegments.push(obj.data);

                        // Resort segments in each channel afer adding data
                        curSegments.sort(function Comparator(a, b) {
                            if (a.startTs < b.startTs) return -1;
                            if (a.startTs > b.startTs) return 1;
                            return 0;
                        });

                        // Check if returned page falls in viewport
                        if (obj.pageStart < (this.start + this.duration)) {
                            this.throttledGetRenderData();
                        }
                    }

                    break;

                case 'realtime':
                    console.log('No Longer Supporting RealTime Data')
                    break;
                }

            }

        }
    }

</script>

<style lang="scss" scoped>
    @import '../../../assets/_variables.scss';

    .canvas {
        position: absolute;
        top: 0;
        left: 0;
        margin-left: 5px;
        cursor: ew-resize;
        outline: none;
    }
</style>