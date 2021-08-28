<template>
  <div class="controls-icons">
    <el-tooltip
      placement="top"
      content="Hide"
      :open-delay="300"
    >
      <button @click="onToggleVisibility">
        <svg-icon
          name="icon-eyeball"
          height="16"
          width="16"
        />
      </button>
    </el-tooltip>
  </div>
      <!-- inline editing -->
      <!-- <div
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
      </div> -->
      <!-- bulk editing -->
      <!-- <div
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
    </div> -->
<!-- </div> -->
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
    name: 'AnnotationGroup',

    mixins: [
      Request
    ],

    props: {
      layer: {
        type: Object,
        default: function() {
        return {}
        }
      },
      hide_title: {
        type: Boolean,
        default: true
      },
      orig_label: {
        type: String,
        default: ""
      },
      can_crud_annotation: {
        type: Boolean,
        default: false
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

    },
    methods: {
      onToggleVisibility: function(event) {
        event.preventDefault()
        event.stopPropagation()
        console.log('Toggle visibility')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';

  .controls-icons {
    padding-right: 8px;

  }

  .bf-channel {
    background: #F7F7F7;
    border-bottom: 1px solid $gray_6;
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
    color: $gray_3;
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
      color: $purple_2
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
