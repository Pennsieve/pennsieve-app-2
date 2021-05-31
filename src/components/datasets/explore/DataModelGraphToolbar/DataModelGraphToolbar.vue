<template>
  <div class="graph-toolbar">
    <el-tooltip
      placement="top"
      content="Center and Fit to Screen"
      :popper-options="popperOptions"
      :open-delay="300"
    >
      <button
        @click="$emit('center')"
      >
        <svg-icon
          class="icon-center"
          icon="icon-center"
          height="20"
          width="20"
        />
      </button>
    </el-tooltip>
    <el-tooltip
      placement="top"
      content="Zoom Out"
      :popper-options="popperOptions"
      :open-delay="300"
    >
      <button
        @click="$emit('zoom-out')"
      >
        <svg-icon
          icon="icon-zoom-out"
          height="24"
          width="24"
        />
      </button>
    </el-tooltip>
    <el-tooltip
      placement="top"
      content="Zoom In"
      :popper-options="popperOptions"
      :open-delay="300"
    >
      <button
        @click="$emit('zoom-in')"
      >
        <svg-icon
          icon="icon-zoom-in"
          height="24"
          width="24"
        />
      </button>
    </el-tooltip>
    <el-tooltip
      placement="top"
      content="Fullscreen"
      :popper-options="popperOptions"
      :open-delay="300"
    >
      <button
        v-if="!isFullscreen"
        @click="$emit('fullscreen')"
      >
        <svg-icon
          icon="icon-fullscreen"
          height="24"
          width="24"
        />
      </button>
    </el-tooltip>
    <button
      v-if="isFullscreen"
      @click="$emit('exit-fullscreen')"
    >
      <svg-icon
        icon="icon-minimize"
        height="24"
        width="24"
      />
    </button>
  </div>
</template>

<script>
  export default {
    name: 'DataModelGraphToolbar',

    data() {
      return {
        isFullscreen: false,
        popperOptions: {
          boundariesElement: 'body'
        }
      }
    },

    mounted: function() {
      document.addEventListener('fullscreenchange', this.onFullscreenchange.bind(this))
    },

    beforeDestroy: function() {
      document.removeEventListener('fullscreenchange', this.onFullscreenchange.bind(this))
    },

    methods: {
      /**
       * List for fullscreen event and set fullscreen data
       */
      onFullscreenchange: function(evt) {
        this.isFullscreen = document.fullscreenElement
      }
    }
  }
</script>

<style scoped lang="scss">
  @import './src/assets/_variables.scss';

  .graph-toolbar {
    background: #fff;
    border: 1px solid $gray_2;
    border-radius: 1px;
    box-shadow: 3px 1px 11px 0 rgba(0,0,0,0.21);
    display: flex;
    left: 32px;
    position: absolute;
    top: 20px;
    z-index: 3;
    button {
      border-left: 1px solid $gray_2;
      color: $gray_6;
      padding: 4px;
      width: 33px;
      &:first-child {
        border: none;
      }
      &:hover {
        background: $gray_2
      }
      &:active {
        color: $app-primary-color;
      }
    }
  }
</style>
