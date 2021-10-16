<template>
  <el-dialog
    class="simple"
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="onClosed"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <svg-icon
        class="mb-16"
        name="icon-warning-circle"
        height="32"
        width="32"
      />
      <h2>Delete annotation?</h2>
      <template v-if="deleteDiscussions">
        <p>
          {{ annotationDescription }} - {{ annotationDateTime}}
        </p>
        <hr />
        <p>
          Deleting this annotation will also remove any associated discussions and cannot be undone.
        </p>
        <p>
          Are you sure you would like to remove this annotation?
        </p>
      </template>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="close"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          :processing="isProcessing"
          @click="removeAnnotation"
        >
          {{ btnDeleteCopy }}
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import {
  pathOr, propOr
} from 'ramda'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

export default {
  name: 'TsAnnotationDeleteDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    deleteAnnotation: {
      type: Object,
      default: () => {
        return {
          annotation: {},
          withDiscussions: false
        }
      }
    }
  },

  data: function () {
    return {
      isProcessing: false
    }
  },

  computed: {
    /**
     * Compute the annotation's name
     * @returns {String}
     */
    annotationDescription: function() {
      return pathOr('', ['annotation', 'label'], this.deleteAnnotation)
    },
    annotationDateTime: function() {
        const deleteAnnStart = pathOr('', ['annotation', 'start'], this.deleteAnnotation)
        return this.getUTCDateString(deleteAnnStart) + ' ' + this.getUTCTimeString(deleteAnnStart);
    },
    deleteDiscussions: function() {
      return propOr(false, 'withDiscussions', this.deleteAnnotation)
    },
    /**
     * Compute copy for the delete button
     * @returns {String}
     */
    btnDeleteCopy: function (){
      return this.deleteDiscussions
        ? `Yes, I'm sure`
        : 'Delete'
    },

  },

  methods: {
    removeAnnotation: function() {
      this.$emit('delete', this.deleteAnnotation.annotation)
    },
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
    },

    /**
     * Callback after the dialog has closed
     * Reset dialog
     */
    onClosed: function() {
      this.isProcessing = false
      this.$emit('update:delete-annotation', {
        annotation: {},
        withDiscussions: false
      })
    },
    getUTCDateString: function(d) {
      if(d > 0) {
        d = new Date(d/1000);
        return ( d.toDateString() );
      } else {
        return 'unknown';
      }
    },
    getUTCTimeString: function(d) {
      if(d > 0) {
        d = d / 1000;
        d = new Date(d);
        return ( ('0' + d.getUTCHours()).slice(-2) + ':' +
          ('0' + d.getUTCMinutes()).slice(-2) + ':' + ('0' + d.getUTCSeconds()).slice(-2) );
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.mb-16 {
  color: $red_1
}

h2 {
  color: #000;
  font-size: 14px;
  list-style: 16px;
  margin: 0 0 8px;
}
</style>
