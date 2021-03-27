<template>
  <div class="timeseries-viewer-toolbar">

    <div id="left-controls">
      <el-tooltip
        placement="top-end"
        content="Toggle Time Zoom Controls">
        <button
          class="btn-icon"
          @click="toggleTimeZoom()">
          <svg-icon
            name="blackfynn-timescale"
            height="20"
            width="20"/>
        </button>
      </el-tooltip>  

      <el-input-number 
        v-model="durationInSeconds" 
        v-if="showTimeZoom"
        :precision="1"
        :step="5" 
        :max="this.constants['MAXDURATION']"
        size="mini"
        controls-position="right">
      </el-input-number>

      <el-tooltip
        placement="top-end"
        content="Toggle Vertical Zoom Controls">
        <button
          class="btn-icon"
          @click="toggleVerticalZoom()">
          <svg-icon
            name="blackfynn-amplitude-zoom"
            height="20"
            width="20"/>
        </button>
      </el-tooltip>  

      <el-button-group v-if="showVertZoom">
        <el-button icon="el-icon-plus" size="mini" @click="incrementZoom"></el-button>
        <el-button icon="el-icon-minus" size="mini" @click="decrementZoom"></el-button>
      </el-button-group>
    </div>

    <div id="center-controls">
      <el-tooltip
        placement="top-end"
        content="Page Back">
        <button
          class="btn-icon"
          @click="pageBack()">
          <svg-icon
            name="icon-previous-page"
            height="12"
            width="12"/>
        </button>
      </el-tooltip>  
      <el-tooltip
        placement="top-end"
        content="Previous Annotation">
        <button
          class="btn-icon"
          @click="previousAnnotation()">
          <svg-icon
            name="next-annotation-left-facing"
            height="12"
            width="18"/>
        </button>
      </el-tooltip>  
      <el-tooltip
        placement="top-end"
        content="Automatic Forward">
        <button
          class="btn-icon"
          @click="togglePlayback()">
          <svg-icon
            :name="iconPlay"
            height="12"
            width="18"/>
        </button>
      </el-tooltip>  
      <el-tooltip
        placement="top-end"
        content="Next Annotation">
        <button
          class="btn-icon"
          @click="nextAnnotation()">
          <svg-icon
            name="next-annotation-right-facing"
            height="12"
            width="18"/>
        </button>
      </el-tooltip>  
      <el-tooltip
        placement="top-end"
        content="Next Page">
        <button
          class="btn-icon"
          @click="pageForward()">
          <svg-icon
            name="icon-next-page"
            height="12"
            width="18"/>
        </button>
      </el-tooltip>  
    </div>
    <div id="right-controls">
      <el-tooltip
        placement="top-end"
        content="Montaging Controls">
        <el-select v-model="selectedMontage" placeholder="Select" size="mini" @change="updateMontageScheme">
          <el-option
            v-for="item in montageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-tooltip>

      <el-tooltip
        placement="top-end"
        content="Toggle Play Back Speed Controls">
        <button
          class="btn-icon"
          @click="togglePlaybackSpeed()">
          <svg-icon
            name="icon-stopwatch"
            height="20"
            width="22"/>
        </button>
      </el-tooltip>  

      <el-select 
        v-model="selectedPlaySpeed" 
        v-if="showPlaybackSpeed"
        placeholder="Select" 
        size="mini" 
        class="playSelect">
        <el-option
          v-for="item in playSpeedOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>

    </div>

  </div>
</template>

<script>
    export default {
        name: 'TimeseriesViewerToolbar',

        computed: {
          iconPlay: function() {
            if(this.isPlaying === true) {
              return 'icon-controller-pause';
            } else {
              return 'icon-controller-play';
            }
          },
          durationInSeconds: {
            // getter
            get: function () {
              return this.duration / 1e6
            },
            // setter
            set: function (newValue) {
              console.log('calling setter with: ' + newValue)
              this.$emit('updateDuration', newValue)
            }
          }
        },
        props: {
           constants: Object,
           duration: Number,
           start: Number
        },
        data: function () {
            return {
              showVertZoom: true,
              showTimeZoom: true,
              showPlaybackSpeed: true,
              selectedTimeRange: 0,
              isPlaying: false,
              montageOptions: [{
                value: 'NOT_MONTAGED',
                label: 'Continuous (Default)'
              }, {
                value: 'REFERENTIAL_VS_CZ',
                label: 'Referential Montage'
              }, {
                value: 'BIPOLAR_ANT_POS',
                label: 'Ant/Post Montage'
              }, {
                value: 'BIPOLAR_TRANSVERSE',
                label: 'Transverse Montage'
              }],
              selectedMontage: '',
              playSpeedOptions: [{
                value: 0.5,
                label: '0.5x'
              }, {
                value: 1,
                label: '1x'
              }, {
                value: 2,
                label: '2x'
              }, {
                value: 5,
                label: '5x'
              },
              {
                value: 10,
                label: '10x'
              }],
              selectedPlaySpeed: null,
              intervalTimer: null,
              intervalPeriod: 150,
              intervalPage: 1000000
            }
        },
        mounted: function () {
          this.selectedMontage = 'NOT_MONTAGED'
          this.selectedPlaySpeed = 1
        },
        methods: {
          updateMontageScheme: function (value) {
            console.log('Updating Montage Scheme:' + value)
            this.$store.dispatch('viewer/setViewerMontageScheme', value)
          },
          updatePlaybackSpeed: function (value) {
            console.log('Updating Playback Speed:' + value)
          },
          toggleTimeZoom: function () {
            this.showTimeZoom = !this.showTimeZoom
          },
          toggleVerticalZoom: function () {
            this.showVertZoom = !this.showVertZoom
          },
          togglePlaybackSpeed: function () {
            this.showPlaybackSpeed = !this.showPlaybackSpeed
          },
          togglePlayback: function () {
            if(this.isPlaying === false) {
              this.startPlay();
            } else {
              this.stopPlay();
            }
          },
          pageBack: function() {
            this.$emit('pageBack')
          },
          pageForward: function() {
            this.$emit('pageForward')
          },
          incrementZoom: function() {
            this.$emit('incrementZoom')
          },
          decrementZoom: function() {
            this.$emit('decrementZoom')
          },
          updateDuration: function() {
            this.$emit('updateDuration',this.selectedTimeRange)
          },
          nextAnnotation: function () {
            this.$emit('nextAnnotation')
          },
          previousAnnotation: function () {
            this.$emit('previousAnnotation')
          },
          startPlay: function() {
            this.isPlaying = true
            let that = this;
            this.intervalTimerFnc = function() {
              that.$emit('setStart', that.start + (that.intervalPage * that.selectedPlaySpeed))
              that.intervalTimer = setTimeout( that.intervalTimerFnc, that.intervalPeriod);
            }

            this.intervalTimer = setTimeout(this.intervalTimerFnc, this.intervalPeriod);

          },
          stopPlay: function() {
            this.isPlaying = false
            this.intervalPeriod = 150;
            clearInterval(this.intervalTimer);
          }
        }
    }

</script>

<style lang="scss" scoped>
    @import '../../../assets/_variables.scss';

    .timeseries-viewer-toolbar {
        border-top: 1px solid #DADADA;
        background: #F7F7F7;
        display: flex;
        padding: 8px 0;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    }

    .btn-icon {
      color: $glial;
      margin-left: 8px;
      margin-right: 2px;
      &:last-child {
        margin-right:8px;
      }
      &.selected, &:hover, &[focused] {
        color: $app-primary-color;
      }
      &[disabled] {
        color: $light-gray;
      }
    }
    .playSelect {
      width: 70px;
      margin-right: 8px;
    }
    
</style>



