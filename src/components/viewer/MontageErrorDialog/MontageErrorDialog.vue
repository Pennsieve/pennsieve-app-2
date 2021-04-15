<template>
  <div class="montage-error-dialog">
    <el-dialog
      class="simple"
      :visible="isOpen"
      :show-close="false"
      @close="onClose"
    >
      <bf-dialog-header slot="title" />

      <dialog-body>
        <h2 slot="heading">
          <svg-icon
            name="icon-warning-circle"
            width="32"
            height="32"
          />
          Something went wrong
        </h2>

        <p>
          We were unable to apply that montage.  Make sure your channel names match standard schemes.
          <a
            href="https://help.blackfynn.com/blackfynn-web-application/interactive-data-viewers/time-series-viewer"
            target="_blank"
          >
            Learn More
          </a>
        </p>
        <p v-if="channelNames.length">
          {{ channelNames }}
        </p>

        <div class="dialog-simple-buttons">
          <bf-button @click="onClose">
            OK
          </bf-button>
        </div>
      </dialog-body>
    </el-dialog>
  </div>
</template>

<script>
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import { propOr } from 'ramda'

export default {
  name: 'MontageErrorDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  mixins: [],

  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    viewerErrors: {
      type: Object,
      default: () => {}
    },
  },

  computed: {
    /**
     * Returns array of missing channel names expected to apply a montage
     * @returns {Array}
     */
    channelNames: function() {
      const channels = propOr([], 'channelNames', this.viewerErrors)
      return channels.length ? channels.join(', ') : ''
    },
  },

  methods: {
    onClose: function() {
      this.$emit('close')
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.montage-error-dialog {
  .svg-icon {
    color: $red_1;
    display: block;
    margin: 0 auto 8px;
  }
}
</style>