<template>
  <el-dialog
    :visible.sync="visible"
    data-cy="bfDeleteDialog"
    class="bf-delete-dialog simple"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />

    <dialog-body>
      <svg-icon
        class="mb-8"
        name="icon-trash"
        height="32"
        width="32"
        color="#e94b4b"
      />
      <h2>Delete {{ totalFiles }} {{ headline }}</h2>
      <p>Deleting {{ copy }} cannot be undone.</p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          data-cy="closeDeleteDialog"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          data-cy="deleteFiles"
          @click="deleteFiles"
        >
          Delete
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
  import BfFileLabel from '../bf-file/BfFileLabel.vue'
  import Request from '../../../../mixins/request/index'

  import { mapGetters } from 'vuex'

  export default {
    name: 'BfDeleteDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton,
      BfFileLabel
    },

    mixins: [
      Request
    ],

    props: {
      selectedFiles: {
        type: Array
      }
    },

    data: function() {
      return {
        visible: false
      }
    },

    computed: {
      ...mapGetters([
        'userToken',
        'config'
      ]),

      /**
       * Computes form URL based on type of action user is taking (rename vs creating)
       * @returns {String}
       */
      deleteUrl: function() {
        if (this.config.apiUrl && this.userToken) {
          return `${this.config.apiUrl}/data/delete?api_key=${this.userToken}`
        }
      },

      /**
       * Compute total files
       * @return {Number}
       */
      totalFiles: function() {
        return this.selectedFiles.length
      },

      /**
       * Compute headline based on total files
       * @return {String}
       */
      headline: function() {
        return this.totalFiles > 1 ? 'items' : 'item'
      },

      /**
       * Compute copy based on total files
       * @return {String}
       */
      copy: function() {
        return this.totalFiles > 1 ? 'these items' : 'this item'
      }
    },

    watch: {
      /**
       * Watch file
       */
      file: function(file) {
        if (Object.keys(file).length) {
          this.packageForm.name = file.content.name
        }
      }
    },

    methods: {
      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.visible = false
      },

      deleteFiles: function() {
        const fileIds = this.selectedFiles.map(item => item.content.id)

        this.sendXhr(this.deleteUrl, {
          method: 'POST',
          body: { things: fileIds }
        })
        .then(response => {
          this.$emit('file-delete', response)
          this.closeDialog()
        })
        .catch(response => {
          this.handleXhrError(response)
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../../assets/_variables.scss';

  .svg-icon {
    color: $app-primary-color;
  }
  .dialog-body {
    text-align: center
  }
</style>
