<template>
  <el-dialog
    :visible="visible"
    class="simple"
    confirm-text="Delete"
    :before-close="suppressCloseIfLoading"
    @close="onClose"
  >
    <dialog-body>
      <svg-icon
        name="icon-trash"
        height="32"
        width="32"
        color="#e94b4b"
      />
      <template v-if="isPropertyDeletion">
        <template v-if="propertyDeletionState === PROPERTY_DELETION_STATES.INITIAL">
          <h3>Delete {{ property.displayName }}?</h3>
          <p>By deleting this property, members of your organization will no longer be able to add values to records in your graph.</p>
        </template>
        <template v-else-if="propertyDeletionState === PROPERTY_DELETION_STATES.FAILED">
          <h3>Delete failed</h3>
          <p>Cannot delete {{ property.displayName }}.  Please contact Pennsieve for assistance.</p>
        </template>
        <template v-else>
          <h3>{{ property.displayName }} is used on {{ propertyRecordUsageCount }} record{{ propertyRecordUsageCount > 1 ? 's' : '' }}</h3>
          <template v-if="propertyRecordUsageCount <= MAX_RECORD_COUNT_FOR_PROPERTY_DELETION">
            <p>
              Deleting it will also modify those records.
            </p>
            <p>
              This cannot be undone. Are you sure you want to continue?
            </p>
          </template>
          <template v-else>
            <p>
              The maximum amount of records that can be modified automatically is {{
                MAX_RECORD_COUNT_FOR_PROPERTY_DELETION }}.
            </p>
            <p>
              Please remove the property from records manually or contact Pennsieve for help.
            </p>
          </template>
        </template>
      </template>

      <template v-else>
        <h3>Delete {{ modelName }}?</h3>
        <p>By deleting this model, members of your organization will no longer be able to create records in your graph.</p>
      </template>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          :disabled="loading"
          @click="onClose"
        >
          Cancel
        </bf-button>
        <bf-button
          v-if="propertyRecordUsageCount <= MAX_RECORD_COUNT_FOR_PROPERTY_DELETION && propertyDeletionState !== PROPERTY_DELETION_STATES.FAILED"
          class="red"
          :processing="loading"
          processing-text="Please wait..."
          @click="confirmArchiveDialog"
        >
          {{ propertyDeletionState === PROPERTY_DELETION_STATES.CONFIRM_RECORD_MODIFICATION ? 'Confirm Deletion' : 'Delete' }}
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import DialogBody from '../../../shared/dialog-body/DialogBody';
import BfButton from '../../../shared/bf-button/BfButton';
import { MAX_RECORD_COUNT_FOR_PROPERTY_DELETION, PROPERTY_DELETION_STATES } from '../ConceptManagement/utils';

export default {
  components: {
    DialogBody,
    BfButton
  },

  props: {
    visible: Boolean,
    loading: Boolean,
    propertyDeletionState: {
      type: String,
      validate: v => Object.values(PROPERTY_DELETION_STATES).includes(v),
      default: () => PROPERTY_DELETION_STATES.INITIAL
    },
    propertyRecordUsageCount: {
      type: Number,
      default: () => 0
    },
    property: {
      type: Object,
      default: () => {}
    },
    modelName: {
      type: String,
      default: () => ''
    }
  },

  computed: {
    isPropertyDeletion: function() {
      return Object.keys(this.property).length > 0
    },
    MAX_RECORD_COUNT_FOR_PROPERTY_DELETION: function() {
      return MAX_RECORD_COUNT_FOR_PROPERTY_DELETION
    },
    PROPERTY_DELETION_STATES: function() {
      return PROPERTY_DELETION_STATES
    }
  },

  methods: {
    confirmArchiveDialog: function(event) {
      this.$emit('confirm', event)
    },
    onClose: function() {
      this.$emit('close')
    },
    suppressCloseIfLoading: function(done) {
      if (!this.loading) done()
    }
  }
}
</script>