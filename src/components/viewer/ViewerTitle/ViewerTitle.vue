<template>
  <div
    class="viewer-title"
    :class="{ 'is-active': isActive }"
  >
    <div class="title">
      {{ title }}
    </div>
    <button @click.capture.stop="closeViewer">
      <svg-icon
        name="icon-remove"
        width="11"
        height="11"
      />
    </button>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import EventBus from '../../../utils/event-bus'

  export default {
    name: 'ViewerTitle',

    props: {
      title: {
        type: String
      },
      idx: {
        type: Number
      }
    },

    data: function() {
      return {
        cmpViewer: '',
        showPolymerViewer: false
      }
    },

    computed: {
      ...mapState([
        'viewerActiveIndex'
      ]),

      /**
       * Compute if current viewer is active
       * @returns {Boolean}
       */
      isActive: function() {
        return this.idx === this.viewerActiveIndex
      },
    },

    methods: {
      /**
       * Close viewer
       */
      closeViewer: function() {
        EventBus.$emit('close-viewer', this.idx)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .viewer-title {
    align-items: center;
    box-sizing: border-box;
    background-color: $glial;
    color: #fff;
    display: flex;
    padding: 6px 11px 4px;
    position: relative;
    width: 100%;
    z-index: 10;
    &.is-active {
      background-color: $serotonin;
    }
  }

  .title {
    flex: 1;
    font-size: 12px;
  }

  .svg-icon {
    color: #fff;
  }
</style>
