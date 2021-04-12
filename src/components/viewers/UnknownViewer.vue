<template>
  <div class="unknown-viewer">
    <div class="viewer">
      <img
        src="/static/images/illustrations/spot-blackfynn-view-package.svg"
        alt="Data Types"
        height="auto"
        width="200"
        class="illustration"
      >

      <h2>No viewer available</h2>

      <p
        v-if="!failed"
        class="copy"
      >
        This package has failed to process.
      </p>
      <p
        v-else
        class="copy"
      >
        This package type is not supported.
      </p>

      <bf-button
        class="primary"
        @click="downloadFile"
      >
        Download File
      </bf-button>
    </div>
  </div>
</template>

<script>
import { pathEq } from 'ramda'

import BfButton from '../shared/bf-button/BfButton.vue'
import EventBus from '../../utils/event-bus'

export default  {
  name: 'UnknownViewer',

  components: {
    BfButton
  },

  props: {
    pkg: Object,
    idx: Number
  },

  computed: {
    /**
     * Confirms if package is in ERROR state
     * @returns {Boolean}
     */
    failed: function() {
      return pathEq(['content', 'state'], 'ERROR', this.pkg)
    },
  },

  methods: {
    /**
     * Fires an event to download original files
     */
    downloadFile: function() {
      EventBus.$emit('trigger-download', [this.pkg])
    },
  }
}
</script>

<style lang='scss' scoped>
@import '../../assets/variables.scss';

  .unknown-viewer {
    box-sizing: border-box;
    overflow: auto;
    width: 100%;
    height: 100%;
  }

  .viewer {
    padding: 15px;
    text-align: center;
  }

  .copy {
    color: $gray_4;
    margin: 0 0 20px 0;
  }

  .illustration {
    margin-top: 85px;
  }

  h2 {
    line-height: 20px;
    margin: 20px 0;
  }
</style>
