<template>
  <div
    v-if="datasetLocked"
    class="locked-banner"
  >
    {{ datasetLockedMessage }}
    &nbsp;
    <a
      v-if="dataset.publication.type === PublicationType.EMBARGO"
      href="#"
      @click.prevent="toggleVisible(true)"
    >
      Tell Me More
    </a>
    <a
      v-else
      href="#"
      target="_blank"
      @click.prevent="showIntercom"
    >
      Get Help
    </a>
    <locked-dialog
      :visible.sync="visible"
      @toggle-visible="toggleVisible(false)"
    />
  </div>
</template>

<script>
  import LockedDialog from '../LockedDialog/LockedDialog.vue'
  import { PublicationType } from '@/utils/constants'
  import { DatasetLockedMessaging } from '@/utils/constants'
  import { mapGetters } from 'vuex';

  export default {
    components: {
      LockedDialog
    },

    data() {
      return {
        visible: false
      }
    },

    computed: {
      ...mapGetters(['datasetLocked', 'dataset']),

      /**
       * Publication Type constant
       * @returns {String}
       */
      PublicationType: function() {
        return PublicationType
      },


      /**
       * Dataset locked message based on dataset publication type
       * @returns {String}
       */
      datasetLockedMessage: function() {
        return this.dataset.publication.type === PublicationType.EMBARGO ? DatasetLockedMessaging.EMBARGO_LOCKED_MESSAGE :
        DatasetLockedMessaging.DEFAULT_LOCKED_MESSAGE
      }
    },

    methods: {
      toggleVisible: function(val) {
        this.visible = val
      },

      /**
      * Show intercom window
      */
      showIntercom: function() {
        window.Intercom('show')
      },
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../assets/_variables';

  .locked-banner {
    background-color: $app-primary-color;
    padding: 18px 0 21px 0;
    color: white;
    display: flex;
    justify-content: center;
    font-weight: bold;
    a {
      color: white;
      text-decoration: underline;
    }
  }

  .locked-dialog {
    /deep/ .el-dialog__header {
      border-bottom: none;
    }
    text-align: center;
    p {
      font-weight: normal;
      color: $gray_6;
      padding: 8px 0;
    }
  }
</style>
