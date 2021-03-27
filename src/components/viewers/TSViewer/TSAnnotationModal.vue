<template>
    <bf-dialog 
        class="timeseries-annotation-modal" 
        ref="annotation-modal"
        title="Annotations"
        :open="annotationWindowOpen"
        @close='close'>

        <div slot="body">
            <div class="select-wrapper">
                <el-select 
                    v-model="selectedFilter" 
                    placeholder="Select" >
                    <el-option
                        v-for="item in filterOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>

                <div v-if="computeVisible0">
                    {{computePlaceholder1}}
                    <el-input-number 
                        class="filterInput"
                        v-model="input0" 
                        controls-position="right" 
                        :precision="2"
                        @change="handleChange" 
                        ></el-input-number>
                </div>
                
                <div v-if="computeVisible1">
                    {{computePlaceholder2}}
                    <el-input-number 
                        class="filterInput"
                        v-model="input1" 
                        controls-position="right" 
                        :precision="2"
                        @change="handleChange" 
                        ></el-input-number>
                </div>
               
                <el-select 
                    v-model="selectedNotch" 
                    v-if="computeVisible2"
                    placeholder="Select" >
                    <el-option
                        v-for="item in notchOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>

            </div>
        </div>

        <div slot="footer">
            <div class="button-wrapper">
                <div class="channelsSelected">
                  
                    <svg-icon
                        name="icon-selection"
                        height="16"
                        width="16"/>

                    <div v-if="onSingleChannel">
                        Adding to single channel
                    </div>    
                    <div v-else>
                        Adding to {{selectedChannels}} Selected Channels
                    </div>
                    
                </div>
                <div class="buttons">
                    <bf-button
                        @click="submitForm"
                    >Set Filter
                    </bf-button>
                </div>
            </div> 

        </div>

    </bf-dialog>

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

    import EventBus from '../../../utils/event-bus'

    export default {
        name: 'AnnotationModal',

        components:{
            'bf-dialog': () => import('@/components/shared/bf-dialog/bf-dialog.vue'),
            'bf-button': () => import('@/components/shared/bf-button/BfButton.vue')
        },

        mixins: [
        ],
        watch: {

        },
        computed: {
            ...mapState([
                'config',
                'userToken'
            ]),
             ...mapState('viewer', [
                'activeViewer',
            ]),
            computeVisible0: function() {
                switch (this.selectedFilter) {
                    case 'lowpass':
                        return true
                    case 'highpass':
                        return true
                    case 'bandpass':
                        return true
                    default:
                        return false
                }
            },
            onSingleChannel: function() {
                return (this.onChannels.length == 1)
            },
            selectedChannels: function() {
                return this.onChannels.length
            },
            computeVisible1: function() {
                switch (this.selectedFilter) {
                    case 'lowpass':
                        return false
                    case 'highpass':
                        return false
                    case 'bandpass':
                        return true
                    default:
                        return false
                }
            },
            computeVisible2: function() {
                switch (this.selectedFilter) {
                    case 'bandstop':
                        return true
                    default:
                        return false
                }
            },
            computePlaceholder1: function(option) {
                switch (this.selectedFilter) {
                    case 'lowpass':
                        return 'Low Pass Cutoff Frequency (Hz)'
                    case 'highpass':
                        return 'High Pass Cutoff Frequency (Hz)'
                    case 'bandpass':
                        return 'Low Pass Cutoff Frequency (Hz)'
                    default:
                        return ''
                }
            },
            computePlaceholder2: function(option) {
                switch (this.selectedFilter) {
                    case 'bandpass':
                        return 'High Pass Cutoff Frequency (Hz)'
                    default:
                        return ''
                }
            },

        },
        props: {
            annotationWindowOpen: Boolean
        },
        data: function () {
            return {
                selectedFilter: null,
                filterOptions: [
                    {
                        label: 'No Filter',
                        value: 'clear'
                    },
                    {
                        label: 'Low Pass',
                        value: 'lowpass'
                    },
                    {
                        label: 'High Pass',
                        value: 'highpass'
                    },
                    {
                        label: 'Band Pass',
                        value: 'bandpass'
                    },
                    {
                        label: 'Notch',
                        value: 'bandstop'
                    }
                ],
                selectedNotch: null,
                notchOptions: [
                    {
                        label: '50Hz',
                        value: 50
                    },
                    {
                        label: '60Hz',
                        value: 60
                    }
                ],
                input0: null,
                input1: null,
                onChannels:[]
                
            }
                
        },

        methods: {
            close: function() {
                this.$emit('closeWindow')
            },
            handleChange: function() {
                // console.log('hello')
            },
            onButtonClick: function () {
                console.log('clicked')
            },
            submitForm: function(e) {
                // this.set('processing', true);
                EventBus.$emit('active-viewer-action', {
                    method: 'setTimeseriesFilters',
                    payload: {
                        selChannels: this.onChannels,
                        filterType: this.selectedFilter,
                        input0: this.input0,
                        input1: this.input1,
                        notch: this.selectedNotch}
                })

            },            
        }
    }

</script>

<style lang="scss" scoped>
    @import '../../../assets/_variables.scss';

    .timeseries-annotation-modal {
        display: block;
        box-sizing: border-box;
    }
    .filterInput {
        width:100%
    }
    .select-wrapper {
        display: flex;
        flex-direction: column;
        border-left: 5px solid var(--dopamine)
    }
    #layerSelect {
        margin: 0 0 10px;
        width: auto;
    }
    .channels-icon {
        border: 1px solid var(--light-gray);
        border-radius: 2px;
        color: var(--light-gray);
        margin-right: 5px;
    }
    .button-wrapper {
        display: flex;
        flex-direction: row;
    }
    .channelsSelected {
        display: flex;
        flex-direction:row;
        margin-right: 20px;
    }
    h2 {
        margin: 20px 30px 30px 30px;
    }

</style>