<template>
  <div class="palette-channels">
    <div
      class="channels-heading"
      :class="{ 'all-visible': allVisible }"
    >
      <el-tooltip
        placement="top"
        content="Filter all channels"
        :popper-options="{ boundariesElement: 'window' }"
        :open-delay="300"
      >
        <button
          class="mr-8"
          @click.stop="openFilterMenu"
        >
          <svg-icon
            name="icon-filter-filled"
            height="20"
            width="20"
          />
        </button>
      </el-tooltip>
      <el-tooltip
        placement="top"
        content="Hide all channels"
        :popper-options="{ boundariesElement: 'window' }"
        :open-delay="300"
      >
        <button @click="toggleAllVisibility">
          <svg-icon
            name="icon-eyeball"
            height="20"
            width="20"
          />
        </button>
      </el-tooltip>
    </div>

    <div class="channel-wrap">
      <accordion
        v-for="channelType in channelTypes"
        :key="channelType"
        :ref="`accordion-${channelType}`"
        icon="blackfynn:chevron-down-small"
        :border-color="channelColorMap[channelType]"
        :title="channelType"
      >
        <el-tooltip
          placement="top"
          content="Edit channel-labels"
          :popper-options="{ boundariesElement: 'window' }"
          :open-delay="300"
        >
          <button
            slot="title"
            class="btn-toggle-channel"
            :class="{ visible: !computeIsHidden(channelType) }"
            @click="toggleBulkEdit(channelType)"
          >
            <svg-icon
              name="icon-pencil"
              height="20"
              width="20"
            />
          </button>
        </el-tooltip>
        <el-tooltip
          placement="top"
          content="Hide channels"
          :popper-options="{ boundariesElement: 'window' }"
          :open-delay="300"
        >
          <button
            slot="title"
            class="btn-toggle-channel"
            :class="{ visible: !computeIsHidden(channelType) }"
            @click="toggleGroupVisibility(channelType)"
          >
            <svg-icon
              name="icon-eyeball"
              height="20"
              width="20"
            />
          </button>
        </el-tooltip>

        <div slot="items">
          <bf-channel
            v-for="channel in getChannelsByType(channelType)"
            :key="channel.id"
            :channel="channel"
            @update-channel-label="updateChannelLabel"
          />
        </div>
      </accordion>
    </div>
    <div
      v-if="bulkEditingChannels"
      class="save-changes-wrapper"
    >
      <bf-button
        class="secondary compact cancel-bulk-editing"
        @click="onCancel"
      >
        Cancel
      </bf-button>
      <bf-button
        class="primary compact save-changes"
        @click="onSaveChanges"
      >
        Save All Changes
      </bf-button>
    </div>
  </div>
</template>

<script>
  import { compose, uniq, pluck, pathEq, contains, without, propEq, pathOr, findIndex, propOr, merge } from 'ramda'
  import { mapState, mapActions } from 'vuex'

  import Accordion from '../../../shared/Accordion/Accordion.vue'
  import BfChannel from './BfChannel.vue'
  import BfButton from '../../../shared/bf-button/BfButton.vue'

  import EventBus from '../../../../utils/event-bus'
  import Sorter from '../../../../mixins/sorter'
  import Request from '../../../../mixins/request'

  export default {
    name: 'PaletteChannels',

    components: {
      Accordion,
      BfChannel,
      BfButton
    },

    mixins: [
      Sorter,
      Request
    ],

    data: function() {
      return {
         channelColorMap: {
          'CONTINUOUS': '#2760FF',
          'NEURAL': '#18BA62'
        },
        allVisible: true,
        hiddenGroups: [],
        isSavingChanges: false
      }
    },

    computed: {
      ...mapState('viewer', ['activeViewer', 'viewerSidePanelView', 'viewerChannels']),
      ...mapState([
        'bulkEditingChannels',
        'config',
        'userToken'
      ]),

      /**
       * Compute sorted channels by `rank`
       * @returns {Array}
       */
      sortedChannels: function() {
        const channels = this.viewerChannels
        return this.returnSort('rank', channels, 'asc')
      },

      /**
       * Compute channels
       * @returns {Array}
       */
      channelTypes: function() {
        return compose(
          uniq,
          pluck('type')
        )(this.viewerChannels)
      },

      /**
       * Compute channels url
       * @returns {String}
       */
      channelsUrl: function() {
        const timeseriesId = pathOr('', ['content', 'id'], this.activeViewer)

        if (!timeseriesId) {
          return ''
        }

        return `${this.config.apiUrl}/timeseries/${timeseriesId}/channels?api_key=${this.userToken}`
      }
    },

    beforeDestroy() {
      this.setBulkEditingChannels(false)
      this.reset()
    },

    methods: {
      ...mapActions('viewer', ['setChannels','updateChannel']),
      ...mapActions(['setBulkEditingChannels']),
      /**
       * Updates sortedChannels
       * @param {Object} channel
       */
      updateChannelLabel: function(channel) {
        const id = propOr(0, 'id', channel)
        // get channel by id
        const channelIdx = findIndex(propEq('id', id), this.sortedChannels)
        // update channel
        const newChannel = this.sortedChannels[channelIdx]
        newChannel.label = channel.label
        // update list
        //TODO this mutation should be handled in vuex to keep things consistent
        this.viewerChannels.splice(channelIdx, 1, newChannel)
      },
      /**
       * Toggles visibility of all groups
       */
       toggleAllVisibility: function() {
        this.allVisible = !this.allVisible
        let updatedChannels = this.viewerChannels
        for (let ch in updatedChannels) {
          updatedChannels[ch].visible = this.allVisible
          this.updateChannel(updatedChannels[ch], ch)
        }
      },

      computeIsHidden: function(channelType) {
        return contains(channelType, this.hiddenGroups)
      },

      /**
       * Toggle visibilty for a group
       * @params {String} channelType
       */
      toggleGroupVisibility: function(channelType) {
        const isHidden = contains(channelType, this.hiddenGroups)

        if (isHidden) {
          this.hiddenGroups = without(channelType, this.hiddenGroups)
        } else {
          this.hiddenGroups.push(channelType)
        }

        EventBus.$emit('active-viewer-action', {
          method: 'toggleGroupVisibility',
          payload: {
            channelType: channelType,
            visible: isHidden
          }
        })
      },

      /**
       * Gets channels by type
       * @param {String} type
       * @returns {Array}
       */
      getChannelsByType: function(type) {
        return this.sortedChannels.filter(channel => pathEq(['content', 'channelType'], type))
      },

      /**
       * Toggles filter window
       */
      openFilterMenu: function() {
        // Get selected channels
        const selectedChannels = this.viewerChannels.filter(channel => {
          return propEq('selected', true, channel)
        })

        // Send selected channels if there are any, if not send all channels
        let channelList = selectedChannels.length > 0 ?
          selectedChannels :
          this.viewerChannels

        EventBus.$emit('active-viewer-action', {
          method: 'openFilterWindow',
          payload: {
            channels: pluck('id', channelList),
            filter: {}
          }
        })
      },

      /**
       * Toggles bulk edit mode
       * @param {String} channelType
       */
      toggleBulkEdit: function(channelType) {
        const accordion = pathOr(null, [`accordion-${channelType}`, 0], this.$refs)

        if (!accordion) {
          return
        }

        if (!accordion.open) {
          accordion.toggle()
        }

        this.setBulkEditingChannels(!this.bulkEditingChannels)
          .then(() => {
            const channels = this.viewerChannels.map(channel => {
              // short ciruit if bulk editing and channel is in edit state
              if (this.bulkEditingChannels && channel.isEditing) {
                return channel
              }
              channel.isEditing = !channel.isEditing
              return channel
            })
            this.setChannels(channels)
          })
      },

      /**
       * Handle save changes event
       */
      onSaveChanges: function() {
        if (!this.channelsUrl) {
          return
        }

        const channels = this.sortedChannels.map(channel => {
          return {
            rate: propOr(0, 'sf', channel),
            name: channel.label,
            channelType: channel.type,
            id: channel.id,
            properties: pathOr([], [0, 'properties'], channel),
            end: pathOr(0, ['dataSegments', 1], channel),
            unit: channel.unit,
            lastAnnotation: propOr(0, 'lastAnnotation', channel),
            start: pathOr(0, ['dataSegments', 0], channel)
          }
        })

        this.sendXhr(this.channelsUrl, {
          method: 'PUT',
          body: channels
        })
        .then(() => {
          this.isSavingChanges = false

          // update channels in vuex
          const updatedChannels = this.sortedChannels.map(channel => {
            channel.isEditing = false
            return channel
          })

          this.setChannels(updatedChannels).then(() => {
            // re-render canvas
            // TODO move to vuex
            EventBus.$emit('active-viewer-action', {
              method: 'updateChannels'
            })

            // display success message
            EventBus.$emit('toast', {
              detail: {
                type: 'success',
                msg: 'Your changes have been saved.'
              }
            })
          })

          this.setBulkEditingChannels(false)
        })
        .catch(err => {
          this.isSavingChanges = false
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
       * Handle cancel changes event
       */
      onCancel: function() {
        this.toggleBulkEdit('CONTINUOUS')
      },

      /**
       * Reset state of all channels
       */
      reset: function() {
        const channels = this.viewerChannels.map(channel => {
          channel.isEditing = false
          return channel
        })
        this.setChannels(channels)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';

  .palette-channels {
    background: #fff;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }
  .channels-heading {
    align-items: center;
    background: #f7f7f7;
    border-bottom: solid 1px $gray_2;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;
    min-height: 33px;
    overflow: hidden;
    padding: 0 10px;
    width: 100%;
    &.all-visible {
      button {
        color: #000
      }
    }
    button {
      color: #9b9b9b;
      &:hover, &:focus {
        color: $app-primary-color;
      }
    }
  }
  button {
    &.visible {
      color: #000
    }
    &:hover, &:focus {
      color: $app-primary-color;
    }
  }
  .channel-wrap {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
  }
  .btn-toggle-channel {
    color: #9b9b9b;
    display: none;
    margin-right: 10px;
    .accordion:hover & {
      display: block;
    }
  }
  .save-changes-wrapper {
    border-top: solid 1px $gray_2;
    position: absolute;
    bottom: 0;
    background: white;
    padding: 16px;
    width: 100%;
    box-sizing: border-box;

    .cancel-bulk-editing {
      margin-right: 16px;
    }
    .save-changes {
      &:hover, &:focus {
        color: white;
      }
    }
  }
</style>
