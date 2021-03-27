<template>
  <div
    :id="channel.id"
    class="bf-channel"
    :class="{ visible: isChannelVisible, editing: channel.isEditing}"
    @click="toggleChannelSelect"
  >
    <div class="channel-info">
      <!-- default view -->
      <div class="label-group">
        <h2
          v-if="!channel.isEditing"
          :class="{selected: channel.selected}"
        >
          {{ channelLabel }}
        </h2>
        <svg-icon
          class="filter-present"
          v-if="hasFilter"
          name="icon-filter-filled"
          height="12"
          width="12"
        />
      </div>
      <!-- inline editing -->
      <div
        v-if="channel.isEditing && !bulkEditingChannels"
        class="channel-input-wrapper"
      >
        <el-input v-model="newLabel" />
        <el-tooltip
          placement="top"
          content="Save"
          :open-delay="300"
        >
          <button @click="saveChanges">
            <svg-icon
              name="icon-check"
              height="16"
              width="16"
            />
          </button>
        </el-tooltip>
        <el-tooltip
          placement="top"
          content="Cancel"
          :open-delay="300"
        >
          <button @click="cancelChanges">
            <svg-icon
              name="icon-remove"
              height="8"
              width="8"
            />
          </button>
        </el-tooltip>
      </div>
      <!-- bulk editing -->
      <div
        v-if="channel.isEditing && bulkEditingChannels"
        class="channel-input-wrapper"
      >
        <el-input v-model="newLabel" />
        <a
          v-if="hasLabelChanged"
          href="#"
          class="revert"
          @click.prevent="onRevert"
        >
          Revert
        </a>
      </div>
      <div>{{ sampleFrequency }}</div>
    </div>
    <div class="channel-controls">
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
        content="Filter"
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
  import { propOr, merge, pathOr, find, propEq } from 'ramda'
  import { mapState, mapActions } from 'vuex'
  import EventBus from '../../../../utils/event-bus'
  import Request from '../../../../mixins/request'

  import {
    isEmpty
  } from 'ramda'

  export default {
    name: 'BfChannel',

    mixins: [
      Request
    ],

    props: {
      channel: {
        type: Object,
        default: function() {
          return {}
        }
      }
    },

    data: function() {
      return {
        newLabel: ''
      }
    },

    computed: {
      ...mapState('viewer', ['activeViewer']),
      ...mapState([
        'config',
        'userToken',
        'bulkEditingChannels'
      ]),
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
       * Compute sample frequency and format it to a string
       * @returns {String}
       */
      sampleFrequency: function() {
        const frequency = propOr(0, 'sf', this.channel)
        return `${frequency} Hz`
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

      /**
       * Open filter menu for this channel
       */
      openFilterMenu: function() {
        EventBus.$emit('active-viewer-action', {
          method: 'openFilterWindow',
          payload: {
            channels: [this.channel.id],
            filter: this.channel.filter
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

  .bf-channel {
    background: #F7F7F7;
    border-bottom: 1px solid $cortex;
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

  .channel-info {
    color: $glial;
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
