<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    @open="handleOpen('feedbackForm')"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Send Us Feedback"
    />

    <dialog-body v-if="!success">
      <el-form
        v-show="!success"
        ref="feedbackForm"
        :model="feedbackForm"
        :rules="rules"
        @submit.native.prevent="submitFeedback('feedbackForm')"
      >
        <el-form-item prop="feedback">
          <el-input
            ref="feedback"
            v-model="feedbackForm.feedback"
            autofocus
            type="textarea"
            :rows="8"
            placeholder="It would be great if..."
          />
        </el-form-item>
      </el-form>
    </dialog-body>

    <dialog-body v-if="success">
      <svg-icon
        slot="icon"
        class="dialog-msg-icon"
        icon="icon-done-check-circle"
        height="32"
        width="32"
      />
      <h3 slot="heading">
        Thanks for your feedback!
      </h3>
      <p>We read all of the feedback we receive, but you might not hear back from us right away. A member of our product team may reach out if we need more detail.</p>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
      :class="[ success ? 'center' : '' ]"
    >
      <template v-if="!success">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button @click="submitFeedback('feedbackForm')">
          Send Feedback
        </bf-button>
      </template>
      <template v-if="success">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Close
        </bf-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
  import A11yKeys from '../shared/a11y-keys/A11yKeys.vue'
  import BfButton from '../shared/bf-button/BfButton.vue'
  import DialogBody from '../shared/dialog-body/DialogBody.vue'
  import BfDialogHeader from '../shared/bf-dialog-header/BfDialogHeader.vue'
  import { mapGetters } from 'vuex'
  import Request from '../../mixins/request'
  import AutoFocus from '../../mixins/auto-focus'
  import EventBus from '../../utils/event-bus'

  export default {
    name: 'BfFeedback',

    components: {
      A11yKeys,
      BfButton,
      DialogBody,
      BfDialogHeader
    },

    mixins: [
      Request,
      AutoFocus
    ],

    data: function() {
      return {
        dialogVisible: false,
        feedbackForm: {
          feedback: ''
        },
        rules: {
          feedback: [
            { required: true, message: 'Please provide feedback', trigger: 'false' },
          ]
        },
        success: false
      }
    },

    computed: {
      ...mapGetters([
        'activeOrganization',
        'profile'
      ]),
    },

    mounted() {
      EventBus.$on('open-feedback', this.openFeedback.bind(this))
    },

    beforeDestroy() {
      EventBus.$off('open-feedback', this.openFeedback.bind(this))
    },

    methods: {
      /**
       * Opens the feedback dialog
       */
      openFeedback: function() {
        this.dialogVisible = true
      },
      /**
       * Closes the dialog
       */
      closeDialog: function() {
        if (this.$refs.feedbackForm) {
          this.$refs.feedbackForm.resetFields()
        }
        this.success = false
        this.dialogVisible = false
      },
      /**
       * Handles key-pressed event
       * @param {Object} evt
       */
      handleKeyPress: function(evt) {
        evt.preventDefault()
        this.submitFeedback('feedbackForm')
      },
      /**
       * Handles the dialog @open event
       */
      handleOpen: function() {
        this.success = false
        this.autoFocus()
      },
      /**
       * Sends feedback
       * @param {String} formName
       */
      submitFeedback: function(formName) {
        this.$refs[formName]
          .validate((valid) => {
            if (!valid) {
              return
            }
            this.sendRequest()
          })
      },
      /**
       * Sends XHR request to submit invitation
       */
      sendRequest: function() {
        const prodPadApiKey = '72fb6f74102b3ea958ec29049c9db33de8fbe5483a42c79b9910b25d5493defc'

        this.sendXhr(`https://api.prodpad.com/v1/feedbacks?apikey=${prodPadApiKey}`, {
          method: 'POST',
          body: {
            feedback: `${this.feedbackForm.feedback}

            Organization name: ${this.activeOrganization.organization.name}
            Organization ID: ${this.activeOrganization.organization.id}
            `,
            name: `${this.profile.firstName} ${this.profile.lastName}`,
            email: this.profile.email,
            about: `Job title: ${this.profile.credential}`,
            external_links: [
              {
                'name': 'Referral Page',
                'url': document.location.href
              }
            ],
            products: [
              {
                'name': 'Pennsieve Platform'
              }
            ]
          }
        })
        .then(() => {
          this.success = true
          this.$refs.feedbackForm.resetFields()
        })
        .catch(this.handleXhrError.bind(this))
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../assets/_variables.scss';
  .el-form-item {
    margin: 0;
  }
</style>
