<template>
  <el-dialog
    class="concept-dialog simple"
    :show-close="false"
    :visible="visible"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />

    <dialog-body>
      <slot />
      <div class="dialog-simple-buttons">
        <template v-if="failed">
          <bf-button
            class="secondary"
            @click="closeDialog"
          >
            Close
          </bf-button>
        </template>
        <template v-else>
          <bf-button
            class="secondary"
            @click="closeDialog"
          >
            Cancel
          </bf-button>
          <bf-button
            :class="primaryBtnClass"
            @click="emitEvents"
          >
            {{ confirmText }}
          </bf-button>
        </template>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import { pathOr } from 'ramda'

export default {
  name: 'ConceptDialog',

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
    title: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: ''
    },
    failed: {
      type: Boolean,
      default: false
    },
    primaryBtnClass: {
      type: String,
      default: 'primary'
    }
  },

  computed: {
    ...mapGetters(['concepts'])
  },

  methods: {
    ...mapActions(['updateConcepts']),
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.$emit('update:visible', false)
      this.$emit('update:failed', false)
      this.$emit('close')
    },
    /**
     * Determines events to emit upon confirmation
     */
    emitEvents: function() {
      // decrement property count if archiving
      if (this.confirmText === 'Delete') {
        this.decrementPropertyCount()
      }
      this.$emit('confirm')
    },
    /**
     * Decrements property count for concept in state
     */
    decrementPropertyCount: function() {
      const id = pathOr('', ['params', 'conceptId'], this.$route)
      const updatedConcepts = this.concepts.map(concept => {
        if (concept.id === id) {
          concept.propertyCount = concept.propertyCount - 1
        }
        return concept
      })
      this.updateConcepts(updatedConcepts)
    }
  }
}
</script>

<style lang="scss">
@import '../../../../assets/_variables.scss';

.concept-dialog {
  .dialog-body {
    text-align: center;
  }
  .svg-icon {
    margin-bottom: 16px;
  }
  h3 {
    color: #000;
    font-size: 14px;
    list-style: 16px;
    margin: 0 0 8px;
  }
}
</style>
