<template>
  <div class="zoom-tool-container">
    <div class="zoom-tool">
      <bf-select-input
        :icon-name="name"
        :options="zoomValues"
        :selected-value="zoom"
        :dropdown="'zoomOptions'"
      />
      <bf-button @click="fitOnScreen">
        <svg-icon
          class="fitToScreenIcon"
          name="icon-size-to-fit"
        />
      </bf-button>
      <bf-button @click="zoomInOut('out')">
        <svg-icon name="icon-zoom-out" />
      </bf-button>
      <el-slider
        v-model="localZoom"
        :min="min"
        :max="max"
        :show-tooltip="false"
        @change="changeZoomValue(localZoom)"
      />
      <bf-button @click="zoomInOut('in')">
        <svg-icon name="icon-zoom-in" />
      </bf-button>
    </div>
    <div
      v-if="digitalZoom"
      class="digitalZoomBlock"
    >
      <span id="digitalZoomMsg">
        Using <em>digital zoom</em>. View at 100% or below for optimal resolution.
      </span>
    </div>
  </div>
</template>

<script>
  import BfSelectInput from '../../shared/bf-select-input/BfSelectInput.vue';
  import BfButton from '../../shared/bf-button/BfButton.vue';
  import EventBus from '../../../utils/event-bus'
  export default {
    name: 'BfZoomTool',
    components: {
      BfSelectInput,
      BfButton
    },
    props: {
      zoom: {
        type: Number,
        default: 0
      },
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 200
      }
    },
    data() {
      return {
        zoomValues: [
              {
                label: '25%',
                value: 25
              },
              {
                label: '50%',
                value: 50
              },
              {
                label: '75%',
                value: 75
              },
              {
                label: '100%',
                value: 100
              },
              {
                label: '150%',
                value: 150
              },
              {
                label: '200%',
                value: 200
              }
            ],
        localZoom: 0,
        name: "icon-magnifying-glass"
      }
    },

    computed: {
      /**
       * Checks if prop zoom value is greater than 100 to return true or false for digitalZoom
       * and display info message
       */
      digitalZoom: function() {
        return this.zoom > 100
      }
    },
    watch: {
      /**
       * Listens for changes in zoom value and updates localZoom value with zoom prop value
       */
      zoom: {
        handler: function(val){
          this.localZoom = val
        },
        immediate: true
      },
    },
    methods: {
      /**
       * Listen for zoom value change when 'Fit on Screen' button is clicked
       */
      fitOnScreen: function() {
         EventBus.$emit('zoom-fit-on-screen')
      },

      /**
       * Listen for zoom value change when 'Zoom Out' or 'Zoom In' button is clicked
       */
      zoomInOut: function(val) {
        EventBus.$emit('change-zoom-scale', val)
      },

      /**
       * Listen for zoom value change when zoom slider is dragged from left or right
       */
      changeZoomValue: function(val){
        EventBus.$emit('change-slider-zoom', val)
      }
    },
  }
</script>

<style scoped lang="scss">
@import '../../../assets/_variables';

  #digitalZoomMsg {
    font-size: 11px;
    margin: 0;
  }

  .zoom-tool-container {
    border-bottom: 1px solid #BDBDBD;
    .zoom-tool {
      padding-bottom: 10px;
      padding-top: 10px;
      align-items: center;
      display: flex;
      flex-direction: row;
      width: 100%;

      .bf-button {
        background-color: transparent;
        min-width: 0;
        color: black;
        padding: 0;
        &:hover, &:focus {
          background: transparent;
          box-shadow: none;
        }
        .svg-icon {
          width: 71px;
          height: 26px;
          margin-left: 7px;
          color: $gray_6;
        }
        .fitToScreenIcon{
          margin-left: 45px;
          margin-top: 4px;
        }
      }
    }

    .digitalZoomBlock {
      padding-bottom: 5px;
      padding-left: 6px;
      em {
        color: #2760FF;
        font-style: normal;
      }
    }
  }


</style>
<style lang="scss">
  .zoom-tool {
    .el-slider {
      width: 148px;
      margin-left: 10px;
    }
    .el-slider__runway {
      width: 100%;
    }
    .bf-select-input {
      display: inherit;
      .svg-icon {
        width: 26px;
        margin-left: 5px;
        margin-top: -3px;
      }
      .inputWrap {
        margin-left: -18px;
        width: 74px;
        margin-top: -3px;
        .svg-icon {
          width: 10px;
          margin-left: -14px;
        }

      }
    }
  }
</style>