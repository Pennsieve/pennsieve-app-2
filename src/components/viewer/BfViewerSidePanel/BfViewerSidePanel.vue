<template>
  <div
    v-show="sidePanelOpen"
    class="bf-viewer-side-panel"
  >
    <palette-info
      v-show="sidePanelView === viewerSidePanelTypes.INFO_PANEL"
    />

    <palette-discussions
      v-show="sidePanelView === viewerSidePanelTypes.DISCUSSION "
      :ref="viewerSidePanelTypes.DISCUSSION"
    />

<!--    <bf-file-browser-->
<!--      v-show="sidePanelView === viewerSidePanelTypes.FILE_BROWSER"-->
<!--      :id="viewerSidePanelTypes.FILE_BROWSER"-->
<!--    />-->

    <palette-annotations
      v-show="sidePanelView === viewerSidePanelTypes.ANNOTATIONS"
      :ref="viewerSidePanelTypes.ANNOTATIONS"
      :window-height="window_height"
    />

    <palette-channels
      v-if="sidePanelView === viewerSidePanelTypes.CHANNELS"
      :ref="viewerSidePanelTypes.CHANNELS"
      :window-height="window_height"
    />

    <palette-navigator v-show="sidePanelView === 'navigator'" />
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import { mapActions } from 'vuex'

import ImportHref from '../../../mixins/import-href'
import PaletteAnnotations from '../palettes/PaletteAnnotations/PaletteAnnotations.vue'
import PaletteNavigator from '../palettes/PaletteNavigator/PaletteNavigator.vue'
import PaletteChannels from '../palettes/PaletteChannels/PaletteChannels.vue'
import PaletteDiscussions from '../palettes/PaletteDiscussions/PaletteDiscussions.vue'
import PaletteInfo from '../palettes/PaletteInfo/PaletteInfo.vue'

import { viewerSidePanelTypes } from '@/utils/constants'
import EventBus from '../../../utils/event-bus'

export default {
  name: 'BfViewerSidePanel',

  components: {
    PaletteAnnotations,
    PaletteNavigator,
    PaletteChannels,
    PaletteDiscussions,
    PaletteInfo
  },

  mixins: [
    ImportHref
  ],
  props: {
    sidePanelOpen: {
      type: Boolean,
      default: false
    },
    sidePanelView: {
      type: String,
      default: ''
    }
  },

  data: function(){
    return {
      window_height: 0,
      expanded: false,
      viewerSidePanelTypes
    }
  },

  /**
   * Vue lifecycle method
   * Import required Polymer components
   */
  mounted: function() {
    window.addEventListener('resize', this.onResize)
    EventBus.$on('view-annotation', this.onViewAnnotation.bind(this))
    this.window_height = window.innerHeight - 85;
  },

  beforeDestroy: function() {
    window.removeEventListener('resize', this.onResize)
    EventBus.$off('view-annotation', this.onViewAnnotation.bind(this))
  },

  methods: {
    ...mapActions('viewer', ['setSidePanel']),

    onResize: function() {
      this.window_height = window.innerHeight - 85;
    },
    /**
     * Callback for going to a discussion from another palette
     * @param {Object} evt
     */
    goToDiscussion: function(evt) {
      const id = pathOr(0, ['detail', 'annotationId'], evt)

      const sidePanel = {
        open: this.sidePanelOpen,
        view: viewerSidePanelTypes.DISCUSSION
      }
      this.setSidePanel(sidePanel).then(() => {
        if (evt.type === 'start-discussion') {
          this.$refs.discussion.startDiscussion(id)
        } else {
          this.$refs.discussion.viewDiscussion(id)
        }
      })
    },

    /**
     * Callback for viewing annotations from another palette
     * @param {Number} id
     */
    onViewAnnotation: function(id) {
      const sidePanel = {
        open: true,
        view: viewerSidePanelTypes.ANNOTATIONS
      }
      this.setSidePanel(sidePanel).then(() => {
        this.$nextTick(() => {
          this.$refs.annotations.viewAnnotation(id)
        })
      })
    }

  }
}

</script>

<style scoped lang="scss">
@import '../../../assets/_variables.scss';

.bf-viewer-side-panel{
  background: #f7f7f7;
  border-left: 1px solid $gray_2;
  height: 100%;
  flex-direction: column;
  width: 100%;
  max-width: 354px;
  display: flex;
}

</style>
