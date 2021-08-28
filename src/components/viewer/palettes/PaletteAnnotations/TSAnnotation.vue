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
          @click="deleteAnnotation"
        >
          <svg-icon
            name="icon-delete"
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
    ]),
    startTime: function() {
        return this.getUTCDateString(this.annotation.start) + ' ' + this.getUTCTimeString(this.annotation.start);
    }
  },

  methods: {
    ...mapActions('viewer', ['updateChannel']),

    onEditChannel: function() {
      console.log('clicked on annotation edit')
    },

    deleteAnnotation: function() {
      EventBus.$emit('active-viewer-action', {
        method: 'confirmDeleteAnnotation',
        payload: {
          annotation: this.annotation,
          withDiscussions: true,
        }
      })
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.ts-annotation {
  background: $gray_0;
  border-bottom: 1px solid $gray_2;
  box-sizing: border-box;
  display: flex;
  padding: 3px 8px 3px 16px;
  &:hover {
    background: white;
  }
  &:not(.visible) {
    .channel-info {
      opacity: .4
    }
    .svg-icon {
      color: $gray_4;
    }
  }
}

.annotation-info {
  color: $gray_4;
  flex: 1;
}
.annotation-controls {
  align-items: center;
  display: none;
  .ts-annotation:hover & {
    display: flex;
  }
  .ts-annotation.editing & {
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
  color: $purple_1
}
button {
  &:hover, &:focus {
    color: $app-primary-color;
  }
}
</style>

