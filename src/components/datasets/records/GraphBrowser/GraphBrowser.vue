<template>
  <div class="graph-browser">
    <data-model-graph
      ref="dataModelGraph"
      :show-title="false"
      :height="chartHeight"
      :show-overlay="false"
      :show-toolbar="true"
    />

    <div
      v-if="hasModels"
      class="models-list-wrap"
      :class="{ 'visible': modelsListVisible }"
    >
      <button
        class="btn-toggle-models-list"
        @click="toggleModelsList"
      >
        <svg-icon
          icon="icon-arrow-up"
          :dir="modelsListArrowDir"
          height="16"
          width="16"
        />
      </button>
      <div
        ref="modelsList"
        class="models-list-scroll"
      >
        <models-list
          :show-heading="false"
          :is-link="false"
          :should-reset.sync="resetModelsList"
          :scrolling-list="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import debounce from 'lodash/debounce'

  import DataModelGraph from '../../explore/DataModelGraph.vue'
  import ModelsList from '../ModelsList/ModelsList.vue'

  import EventBus from '../../../../utils/event-bus'

  import {
    mapState
  } from 'vuex'

  export default {
    name: 'GraphBrowser',

    components: {
      DataModelGraph,
      ModelsList
    },

    data() {
      return {
        chartHeight: 0,
        isFullscreen: false,
        modelsListVisible: true,
        resetModelsList: false
      }
    },

    computed: {
      ...mapState([
        'concepts'
      ]),

      /**
       * Compute direction for models list arrow based on if it is visible
       * @returns {String}
       */
      modelsListArrowDir: function() {
        return this.modelsListVisible ? 'right' : 'left'
      },

      /**
       * Compute if the dataset has models
       * @returns {Boolean}
       */
      hasModels: function() {
        return this.concepts.length > 0
      }
    },

    created: function () {
      window.addEventListener('resize', this.setChartHeight)
      this.setChartHeight()
    },

    mounted: function() {
      document.addEventListener('fullscreenchange', this.onFullscreenchange.bind(this))

      EventBus.$on('concepts-list-item-click', this.focusNode.bind(this))
    },

    beforeDestroy: function() {
      document.removeEventListener('fullscreenchange', this.onFullscreenchange.bind(this))
      window.removeEventListener('resize', this.setChartHeight)
      EventBus.$off('concepts-list-item-click', this.focusNode.bind(this))
    },

    methods: {
      /**
       * Set chart height based on the height of the window
       */
      setChartHeight: debounce(
        function() {
          const rafter = document.querySelector('.bf-rafter')
          const rafterHeight = this.isFullscreen ? 0 : rafter.offsetHeight
          this.chartHeight = window.innerHeight - rafterHeight
        },
        100
      ),

      /**
       * List for fullscreen event and set fullscreen data
       */
      onFullscreenchange: function(evt) {
        this.isFullscreen = document.fullscreenElement
        this.setChartHeight()
      },

      /**
       * Toggle models list visibility and scroll list to the top
       */
      toggleModelsList: function() {
        this.modelsListVisible = !this.modelsListVisible

        // Scroll list to the top
        if (this.modelsListVisible) {
          this.$refs.modelsList.scrollTop = 0
          this.resetModelsList = true
        }
      },

      /**
       * Focus node on the chart
       */
      focusNode: function(evt) {
        if (this.$refs.dataModelGraph) {
          this.$refs.dataModelGraph.focusNode(evt)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';

  .graph-browser {
    height: 100%;
    margin: -32px;
    height: calc(100vh - 130px);
    overflow: hidden;
    position: relative;
  }
  .models-list-wrap {
    background: #fff;
    box-shadow: -3px 1px 11px 0 rgba(0,0,0,0.21);
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    transform: translate3d(100%, 0, 0);
    transition: transform .3s ease-out;
    width: 300px;
    will-change: transform;
    z-index: 3;
    &.visible {
      transform: translate3d(0, 0, 0);
    }
  }
  .models-list-scroll {
    height: 100%;
    overflow: hidden;
  }
  .btn-toggle-models-list {
    align-items: center;
    background: #fff;
    box-shadow: -3px 1px 11px 0 rgba(0,0,0,0.21);
    display: flex;
    height: 32px;
    left: -33px;
    justify-content: center;
    position: absolute;
    top: 20px;
    width: 33px;
    &:after {
      background: white;
      content: '';
      height: 100%;
      pointer-events: none;
      position: absolute;
      top: 0;
      right: -5px;
      width: 5px;
    }
  }
</style>
