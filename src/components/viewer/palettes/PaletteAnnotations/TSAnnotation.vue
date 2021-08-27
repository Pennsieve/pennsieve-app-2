<template>
  <div
    :id="annotation.id"
    class="ts-annotation"
    @click="onAnnotationSelect"
  >
    <div class="annotation-info">
      <div>{{ annotation.label }}</div>
      <div> {{startTime}}</div>
    </div>
    <div class="annotation-controls">
      <el-tooltip
        placement="top"
        content="Edit"
        :open-delay="300"
      >
        <button
          class="mr-8"
          @click="onEditChannel"
        >
          <svg-icon
            name="icon-pencil"
            height="16"
            width="16"
          />
        </button>
      </el-tooltip>
      <el-tooltip
        placement="top"
        content="Delete"
        :open-delay="300"
      >
        <button
          class="mr-8"
          @click="openFilterMenu"
        >
          <svg-icon
            name="icon-filter-filled"
            height="16"
            width="16"
          />
        </button>
      </el-tooltip>
      <el-tooltip
        placement="top"
        content="Hide"
        :open-delay="300"
      >
        <button @click="toggleChannel">
          <svg-icon
            name="icon-eyeball"
            height="16"
            width="16"
          />
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { propOr, merge, pathOr } from 'ramda'
import { mapState, mapActions } from 'vuex'
import EventBus from '../../../../utils/event-bus'
import Request from '../../../../mixins/request'

import {
  isEmpty
} from 'ramda'

export default {
  name: 'TsAnnotation',

  mixins: [
    Request
  ],

  props: {
    annotation: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },

  data: function() {
    return {
    }
  },

  computed: {
    ...mapState('viewer', ['activeViewer']),
    ...mapState([
      'config',
      'userToken',
      'bulkEditingChannels'
    ]),
    startTime: function() {
        return this.getUTCDateString(this.annotation.start) + ' ' + this.getUTCTimeString(this.annotation.start);
    },
    hasFilter: function() {
      return !isEmpty(this.channel.filter)
    },

    /**
     * Compute channel label
     * @returns {String}
     */
    channelLabel: function() {
      return propOr('', 'label', this.channel)
    },

    /**
     * Compute if the channel is visible
     * @returns {Boolean}
     */
    isChannelVisible: function() {
      return propOr(true, 'visible', this.channel)
    },

    /**
     * Compute channel endpoint
     * @returns {String}
     */
    channelUrl: function() {
      const timeseriesId = pathOr('', ['content', 'id'], this.activeViewer)
      const channelId = propOr('', 'id', this.channel)

      if (!timeseriesId || !channelId) {
        return ''
      }

      return `${this.config.apiUrl}/timeseries/${timeseriesId}/channels/${channelId}`
    },

    /**
     * Compute if label value has changed
     * @returns {Boolean}
     */
    hasLabelChanged: function() {
      return this.newLabel !== this.channelLabel
    }
  },

  watch: {
    channelLabel: {
      handler: function(val) {
        this.newLabel = val
      },
      immediate: true
    },
    hasLabelChanged: {
      handler: function(val) {
        this.$emit('update-channel-label', {label: this.newLabel, id: this.channel.id})
        EventBus.$emit('data-changed', { changed: val, id: this.channel.id })
      }
    },
    channel: {
      handler: function(val) {
        if (!val.isEditing) {
          this.newLabel = this.channelLabel
        }
      },
      deep: true
    }
  },

  methods: {
    ...mapActions('viewer', ['updateChannel']),

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
    },
    /**
     * When click on Annotation,
     * Jump to annotation in viewer
     */
    onAnnotationSelect: function() {
      EventBus.$emit('active-viewer-action', {
        method: 'selectAnnotation',
        payload: {
          annotation: this.annotation
        }
      })
    },
    /**
     * Toggle channel visibility
     */
    toggleChannel: function() {
      const visible = !this.channel.visible

      const channel = merge(this.channel, { visible })
      this.updateChannel(channel).then(() => {
        // TODO move this into vuex
        EventBus.$emit('active-viewer-action', {
          method: 'renderAll'
        })
      })
    },

    /**
     * Toggle channel select, allows for multiple selection
     * @param {Object} evt
     */
    toggleChannelSelect: function(evt) {
      const append = evt.metaKey
      EventBus.$emit('active-viewer-action', {
        method: 'selectChannel',
        payload: {
          channelId: this.channel.id,
          append
        }
      })
    },

    /**
     * Save changes
     */
    saveChanges: function() {
      const channel = this.activeViewer.channels.find(item => (item.content.id === this.channel.id))
      const properties = pathOr([], [0, 'properties'], channel.properties)
      const payload = merge(channel.content, { name: this.newLabel, properties })
      const url = `${this.channelUrl}?api_key=${this.userToken}`

      this.sendXhr(url, {
        method: 'PUT',
        body: payload
      })
        .then(response => {
          EventBus.$emit('toast', {
            detail: {
              type: 'success',
              msg: 'Your changes have been saved.'
            }
          })

          this.updateViewerChannels()
        })
        .catch(err => {
          this.handleXhrError(err)

          EventBus.$emit('toast', {
            detail: {
              type: 'error',
              msg: 'There was an error saving changes.'
            }
          })
        })
    },

    /**
     * Update viewer channels state in Vuex
     */
    updateViewerChannels: function() {
      const label = this.newLabel.split(/[ _-]/, 3)
      const label_prefix = label[0];
      let label_value = ( (label.length > 1) ? parseFloat(label[1]) : 0);
      label_value = ( (isNaN(label_value) ? label[1] : label_value));

      const changes = {
        label: this.newLabel,
        label_split: label,
        label_prefix: label_prefix,
        label_value: this.newLabel,
        isEditing: false
      }

      const channel = merge(this.channel, changes)

      this.updateChannel(channel)
        .then(() => {
          EventBus.$emit('active-viewer-action', {
            method: 'updateChannels'
          })
        })
    },

    /**
     * Cancel changes
     */
    cancelChanges: function() {
      this.newLabel = this.channelLabel

      const channel = merge(this.channel, { isEditing: false })

      this.updateChannel(channel)
        .then(() => {
          EventBus.$emit('active-viewer-action', {
            method: 'renderAll'
          })
        })
    },

    /**
     * Handle edit channel click event
     */
    onEditChannel: function() {
      const channel = merge(this.channel, { isEditing: true })

      this.updateChannel(channel)
        .then(() => {
          EventBus.$emit('active-viewer-action', {
            method: 'renderAll'
          })
        })
    },

    /**
     * Handle revert changes click event
     */
    onRevert: function() {
      this.newLabel = this.channelLabel
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.ts-annotation {
  background: #F7F7F7;
  border-bottom: 1px solid $gray_2;
  box-sizing: border-box;
  display: flex;
  padding: 3px 8px 3px 16px;
  &:hover {
    background: #fff;
  }
  &:not(.visible) {
    .channel-info {
      opacity: .4
    }
    .svg-icon {
      color: #9b9b9b;
    }
  }
}

.annotation-info {
  color: $gray_4;
  flex: 1;
}
.channel-controls {
  align-items: center;
  display: none;
  .bf-channel:hover & {
    display: flex;
  }
  .bf-channel.editing & {
    display: none;
  }

  button {
    color: #000;
  }
}

h2 {
  font-size: 13px;
  margin-bottom: 2px;
}
.selected {
  color: #295eff
}
button {
  &:hover, &:focus {
    color: $app-primary-color;
  }
}
</style>

<style lang="scss">
.bf-channel {
  .channel-input-wrapper {
    width: 164px;
  }
  .el-input__inner {
    height: 18px !important;
    font-size: 12px;
    padding: 0 4px;
  }
  .revert {
    margin-left: 8px;
  }
  .label-group {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .filter-present {
    margin-left: 5px;
  }
}
</style>
