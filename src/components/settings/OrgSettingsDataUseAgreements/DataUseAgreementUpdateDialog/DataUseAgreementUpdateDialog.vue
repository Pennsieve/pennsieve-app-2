<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="onClosed"
    @open="onOpen"
  >
    <bf-dialog-header
      slot="title"
      :title="dialogCTA"
    />

    <dialog-body>
      <el-form
        ref="form"
        label-position="top"
        :model="form"
        :rules="rules"
        @keyup.enter.native="validateForm"
      >
        <el-form-item
          class="mb-16"
          prop="name"
        >
          <template slot="label">
            Name
          </template>
          <el-input
            v-model="form.name"
            autofocus
          />
        </el-form-item>
        <el-form-item
          class="mb-16"
          prop="description"
        >
          <template slot="label">
            Description
            <span class="label-helper">
              optional
            </span>
          </template>
          <character-count-input
            v-model="form.description"
            :rows="1"
            :maxlength="100"
          />
        </el-form-item>
        <el-form-item
          class="mb-16"
          prop="body"
        >
          <template slot="label">
            Agreement Text
          </template>
          <el-input
            ref="input"
            v-model="form.body"
            type="textarea"
            :rows="8"
          />
        </el-form-item>
      </el-form>
    </dialog-body>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="close"
      >
        Cancel
      </bf-button>
      <bf-button
        :processing="isProcessing"
        @click="validateForm"
      >
        {{ dialogCTA }}
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import Autofocus from '@/mixins/auto-focus'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import CharacterCountInput from '@/components/shared/CharacterCountInput/CharacterCountInput.vue'

const defaultForm = () => {
  return {
    name: '',
    description: '',
    body: '',
    isDefault: false
  }
}

export default {
  name: 'DataUseAgreementUpdateDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton,
    CharacterCountInput
  },

  mixins: [
    Autofocus
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dataUseAgreement: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data: function () {
    return {
      form: defaultForm(),
      rules: {
        name: [
          {
            required: true,
            message: 'Please provide a name',
            trigger: 'false'
          }
        ],
        description: [
          {
            required: false
          }
        ],
        body: [
          {
            required: true,
            message: 'Please provide agreement text',
            trigger: 'false'
          }
        ]
      },
      isProcessing: false,
      isEditing: false
    }
  },

  computed: {
    /**
     * Compute dialog CTA based on if the user
     * is creating or updating
     * @returns {String}
     */
    dialogCTA: function()  {
      return this.isEditing
        ? 'Edit Data Use Agreement'
        : 'Create Data Use Agreement'
    }
  },

  methods: {
    /**
     * Set default values on open
     */
    onOpen: function() {
      this.autoFocus()

      this.setDataUseAgreement()
    },

    /**
     * Set contributor, used when a user is editing
     */
    setDataUseAgreement: function() {
      if (Object.keys(this.dataUseAgreement).length) {
        this.form = { ...this.dataUseAgreement }
        this.isEditing = true
      }
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
      this.isEditing = false
      this.$refs.form.resetFields()
      this.form = defaultForm()

      this.$emit('update:dataUseAgreement', {})
    },

    /**
     * Validate form, and then submit if it is valid
     */
    validateForm: function (){
      this.isProcessing = true

      this.$refs.form
        .validate((valid) => {
          if (!valid) {
            this.isProcessing = false
            return
          }
          this.submitForm()
        })
    },

    /**
     * Submit form and emit event
     */
    submitForm: function() {
      const eventName = this.isEditing
        ? 'edit-data-use-agreement'
        : 'add-data-use-agreement'

      this.$emit(eventName, this.form)
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
