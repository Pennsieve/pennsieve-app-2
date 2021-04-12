<template>
  <div class="bf-upload-file">
    <div class="file-name">
      {{ displayName }}
    </div>
    <div
      v-if="submitted"
      class="file-status"
    >
      <bf-progress-bar
        v-if="uploading"
        :loaded="item.totalUploaded"
        :total="item.size"
      />

      <iron-icon
        v-if="complete"
        class="icon icon-complete"
        icon="blackfynn:done-circle"
      />

      <bf-waiting-icon
        v-if="waiting"
        class="icon-waiting"
      />
    </div>
  </div>
</template>

<script>
  import BfProgressBar from '../../shared/bf-progress-bar/bf-progress-bar.vue';
  import BfWaitingIcon from '../../shared/bf-waiting-icon/bf-waiting-icon.vue';

  export default {
    name: 'BfUploadFile',

    components: {
      BfProgressBar,
      BfWaitingIcon
    },

    props: {
      item: {
        type: Object,
        default: () => {
          return {}
        }
      },
      submitted: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      uploading: function () {
        return Boolean(this.item.uploading);
      },
      complete: function () {
        return Boolean(this.item.complete);
      },
      waiting: function () {
        return !this.uploading && !this.complete;
      },

      /**
       * Compute the display name which will decode
       * the response from the API
       * @returns {String}
       */
      displayName: function() {
        return decodeURIComponent(this.item.fileName)
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../assets/_variables.scss';

  .bf-upload-file {
    align-items: center;
    border-top: 1px solid $gray_2;
    display: flex;
    flex-direction: row;
    padding: 10px 10px 10px 18px;
    position: relative;
    &:first-child {
      border-top: none;
    }
    &:before {
      background: $gray_4;
      content: '';
      display: block;
      height: calc(100% + 1px);
      left: 0px;
      position: absolute;
      top: 0;
      width: 8px;
      z-index: 1;
    }
  }
  .file-name {
    flex: 1;
  }
  .icon {
    height: 18px;
    width: 18px;
  }
  .file-status {
    align-items: center;
    display: flex;
    flex-direction: row;
  }
  .icon-complete {
    color: $green_1;
  }
  .icon-waiting {
    color: $app-primary-color;
    height: 18px;
    padding: 0;
    width: 18px;
  }
  .file-upload-progress {
    background: #EFF1F3;
    border-radius: 3px;
    height: 8px;
    overflow: hidden;
    width: 70px;
    .bar {
      background: $green_1;
      display: block;
      height: 100%;
      width: 20%;
    }
  }

</style>
