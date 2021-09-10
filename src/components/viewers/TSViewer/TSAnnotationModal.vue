<template>
  <bf-dialog
    class="timeseries-annotation-modal"
    ref="annotation-modal"
    :title="dialogTitle"
    :open="visible"
    @close="close"
    @closed="onClosed">

    <div slot="body">
      <div class="select-wrapper">
        <div class="range-type-selector">
          <div class="select-label">
            Range?
          </div>
          <el-switch
            v-model="hasRangeValue"
            active-color="#5039F7"
            inactive-color="#CAC5BF">
          </el-switch>
        </div>

        <el-date-picker
          v-model="selectedRange"
          class = "date-time-picker"
          :type="datePickerType"
          format="yyyy-MM-DD hh:mm:ss"
          format-value="timestamp"
          range-separator="To"
          start-placeholder="Start date/time"
          end-placeholder="End date/time">
        </el-date-picker>
      </div>
      <div class="select-wrapper">
        <div>
          <div class="select-label">
            Annotation Layer
          </div>
          <el-select
            v-model="activeAnnotation.layer_id"
            placeholder="Select" >
            <el-option
              v-for="item in viewerAnnotations"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div>
          <div class="select-label">
            Annotation Type
          </div>
          <el-select
            v-model="activeAnnotation.label"
            placeholder="Select" >
            <el-option
              v-for="item in defaultLabels"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>

      <div class="description-wrapper">
        <div class="select-label">
          Description
        </div>
        <el-input
          ref="input"
          v-model="activeAnnotation.description"
          placeholder="Please provide additional information..."
          type="textarea"
          :rows="5"
        />

      </div>
    </div>

    <div slot="footer">
      <div class="button-wrapper">
        <div class="channels-selected">

          <svg-icon
            class="inline-icon"
            name="icon-selection"
            height="16"
            width="16"/>

          {{ channelSelectionStr }}

        </div>
        <div class="buttons">
          <bf-button
            @click="submitForm"
          > {{ actionButtonText }}
          </bf-button>
        </div>
      </div>

    </div>
  </bf-dialog>
</template>

<script>
import {
  propOr
} from 'ramda'

import {mapState} from "vuex";

export default {
  name: 'TsAnnotationDialog',

  components: {
    'bf-dialog': () => import('@/components/shared/bf-dialog/bf-dialog.vue'),
    'bf-button': () => import('@/components/shared/bf-button/BfButton.vue')
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data: function () {
    return {
      isProcessing: false,
      selectedRange: {},
      initialTimeRage: {
        start: 0,
        end: 0
      },
      hasRangeValue: true,
      defaultEventTime: '',
      defaultEventDate: '',
      defaultLabels: [{
        value: 'Event',
        label: 'Event'
      }, {
        value: 'Artifact',
        label: 'Artifact'
      }, {
        value: 'Seizure',
        label: 'Seizure'
      }, {
        value: 'Mark',
        label: 'Mark'
      }, {
        value: 'Stim On',
        label: 'Stim On'
      }, {
        value: 'Stim Off',
        label: 'Stim Off'
      }, {
        value: 'Start',
        label: 'Start'
      }, {
        value: 'Stop',
        label: 'Stop'
      }],
    }
  },
  mounted() {
  },
  computed: {
    ...mapState('viewer', [
      'activeAnnotation',
      'activeViewer',
      'viewerChannels',
      'viewerActiveTool',
      'viewerAnnotations'
    ]),
    dialogTitle: function() {
      if (this.activeAnnotation.id) {
        return "Edit Annotation"
      } else {
        return "Create Annotation"
      }
    },
    actionButtonText: function() {
      if (this.activeAnnotation.id) {
        return "Update"
      } else {
        return "Create"
      }
    },
    datePickerType: function() {
      return this.hasRangeValue ? 'datetimerange' : 'datetime'
    },
    channelSelectionStr: function() {
      let str = ""
      if (this.activeAnnotation.allChannels) {
        str = "Adding to all channels"
      } else if (propOr(true,'channelIds',this.activeAnnotation).length == 1) {
        str = "Adding to single channel"
      } else {
        str = `Adding to ${propOr(1,'channelIds',this.activeAnnotation).length} channels`
      }
      return str
    }

  },
  watch: {
    visible: function() {
      // Offset dates with local timezone such that datepicker
      // matches GMT

      this.tzOffset = new Date(this.activeAnnotation.start/1000).getTimezoneOffset() * 60000000

      const startWithOffset = this.activeAnnotation.start + this.tzOffset
      const endWithOffset = this.activeAnnotation.end + this.tzOffset

      this.selectedLayer = this.activeAnnotation.layer_id
      this.selectedType = this.activeAnnotation.label
      this.initialTimeRage = {
        start: this.activeAnnotation.start,
        end: this.activeAnnotation.end
      }
      this.defaultEventTime = startWithOffset / 1000
      this.defaultEventDate = endWithOffset / 1000

      if (this.activeAnnotation.duration == 0) {
        this.hasRangeValue = false
        this.selectedRange = startWithOffset / 1000
      } else {
        this.hasRangeValue = true
        this.selectedRange = [
          startWithOffset / 1000,
          endWithOffset / 1000
        ]
      }

    },
    hasRangeValue: function(value) {

      this.tzOffsett = new Date(this.activeAnnotation.start/1000).getTimezoneOffset() * 60000000

      const startWithOffset = this.activeAnnotation.start + this.tzOffset
      const endWithOffset = this.activeAnnotation.end + this.tzOffset

      if (value) {
        this.selectedRange = [
          startWithOffset / 1000,
          endWithOffset / 1000
        ]
      } else {
        this.activeAnnotation.duration = 0;
        this.selectedRange = startWithOffset / 1000
      }

    }
  },

  methods: {
    submitForm: function() {
      // update active annotation object
      this.activeAnnotation.label = this.activeAnnotation.label
      if (this.hasRangeValue) {
        this.activeAnnotation.start = this.selectedRange[0] * 1000 - this.tzOffset
        this.activeAnnotation.end = this.selectedRange[1] * 1000 - this.tzOffset
        this.activeAnnotation.duration =  this.activeAnnotation.end - this.activeAnnotation.start
      } else {
        this.activeAnnotation.start = this.selectedRange * 1000 - this.tzOffset
        this.activeAnnotation.end = this.selectedRange * 1000 - this.tzOffset
        this.activeAnnotation.duration = 0
      }
      this.$store.dispatch('viewer/setActiveAnnotation', this.activeAnnotation)

      this.$emit('createUpdateAnnotation', this.activeAnnotation)
    },
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('closeWindow')
    },

    /**
     * Callback after the dialog has closed
     * Reset dialog
     */
    onClosed: function() {
      this.isProcessing = false
    },
    getUTCDateString: function(d) {
      if(d > 0) {
        d = new Date(d/1000);
        return ( d.toDateString() );
      } else {
        return 'unknown';
      }
    },
    getUTCTimeString: function(d) {
      if(d > 0) {
        d = d / 1000;
        d = new Date(d);
        return ( ('0' + d.getUTCHours()).slice(-2) + ':' +
          ('0' + d.getUTCMinutes()).slice(-2) + ':' + ('0' + d.getUTCSeconds()).slice(-2) );
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.timeseries-annotation-modal {
  display: block;
  box-sizing: border-box;
}

.select-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: center;

}

.description-wrapper {
}

.button-wrapper {
  min-width: 500px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.channels-selected {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.date-time-picker {
  width:100%
}

.select-label {
  font-weight: 500;
  margin-bottom: 5px;
}

.inline-icon {
  margin-right: 8px;
}

.range-type-selector {
  margin-right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;

}

.mb-16 {
  color: $red_1
}

h2 {
  color: #000;
  font-size: 14px;
  list-style: 16px;
  margin: 0 0 8px;
}

.layerSelect {

}
</style>
