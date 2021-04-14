<template>
  <div>
    <el-dialog
      class="simple"
      :visible="visible"
      :append-to-body="true"
      :show-close="false"
    >
      <bf-dialog-header slot="title" />
      <dialog-body>
        <img
          src="/static/images/orcid.png"
          alt="Logo of ORCID"
          class="mb-8"
        >
        <h2>Link your ORCID</h2>
        <p>
          Connect your Pennsieve Profile to your ORCID. <a href="http://help.blackfynn.com/blackfynn-web-application/blackfynn-discover/linking-orcid-to-blackfynn">
            Learn More
          </a>
        </p>
        <div class="dialog-simple-buttons">
          <bf-button
            class="primary"
            @click="openORCID"
          >
            Relink ORCID
          </bf-button>
        </div>
      </dialog-body>
    </el-dialog>
  </div>
</template>

<script>
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'

import OrcidMixin from '@/mixins/orcid'

export default {
  name: 'LinkOrcidDialog',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    OrcidMixin
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
img {
  height: 32px;
  width: 32px;
}
</style>
