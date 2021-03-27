<template>
  <div class="video-viewer">
    <video
      class="video-viewer"
      :src="getFileUrl"
      autoplay
      controls
    />
  </div>
</template>

<script>
import { pathEq, pathOr, reject } from 'ramda'

import StaticViewer from '../../mixins/static-viewer'

export default {
  name: 'VideoViewer',

  mixins: [
    StaticViewer
  ],

  props: {
    pkg: Object,
    idx: Number
  },

  methods: {
    /**
     * Handle get viewer data xhr response
     * NOTE: this function is defined in the static-viewer mixin and
     * we're overriding to handle unique case
     * @param {Object} response
     */
    handleGetViewerData: function(response) {
      const pkg = reject(pathEq(['content', 'fileType'], 'PNG'), response)
      this.viewerDataId = pathOr('', [0, 'content', 'id'])(pkg)
    }
  }
}
</script>

<style lang="scss" scoped>
  .video-viewer {
    border: none;
    height: 100%;
    width: 100%;
  }
</style>
