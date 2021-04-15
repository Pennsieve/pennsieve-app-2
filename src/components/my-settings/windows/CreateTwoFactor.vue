<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    @open="handleOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Setup Two-Factor Authentication"
    />

    <dialog-body>
      <p> Follow these steps to enable two-factor authentication for your account.</p>

      <p>Please use a TOTP-compatible authenticator app, such as Google Authenticator or Authy. <a href="#" target="blank">Read More.</a></p>

      <p class="strong">1. Enter the code into your authenticator app</p>
      <el-input v-model="totpCode"></el-input>

      <p class="strong">
        2. Enter validation code:
      </p>
      <el-input v-model="totpValidation"></el-input>
      <!-- <el-form
        ref="twoFactorForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="onTwoFactorFormSubmit"
      >
        <el-form-item
          label="Country Code"
          prop="countryCode"
        >
          <el-input
            v-model="ruleForm.countryCode"
            autofocus
          />
        </el-form-item>
        <el-form-item
          label="Phone Number"
          prop="phoneNumber"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input v-model="ruleForm.phoneNumber">
              <template slot="prepend">
                +{{ ruleForm.countryCode }}
              </template>
            </el-input>
          </a11y-keys>
        </el-form-item>
        <div>Please provide numbers only.</div>
      </el-form> -->
    </dialog-body>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button @click="onTwoFactorFormSubmit">
        Confirm
      </bf-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { pathOr, prop } from 'ramda'
import Auth from '@aws-amplify/auth'

import A11yKeys from '../../shared/a11y-keys/A11yKeys.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'

import AutoFocus from '../../../mixins/auto-focus'
import Request from '../../../mixins/request'
import EventBus from '../../../utils/event-bus'

export default {
  name: 'CreateTwoFactor',

  components: {
    A11yKeys,
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    AutoFocus,
    Request
  ],

  data() {
    return {
      dialogVisible: false,
      totpCode: '',
      totpValidation: '',
      cognitoUser: {},
      labelPosition: 'right',
      ruleForm: {
        countryCode: '1',
        phoneNumber: '',
      },
      rules: {
        countryCode: [
          { required: true, message: 'Please provide a country code', trigger: 'false' },
        ],
        phoneNumber: [
          { required: true, message: 'Please provide your phone number', trigger: 'false' }
        ]
      }
    }
  },

  computed: {
    ...mapGetters([
      'profile',
      'activeOrganization',
      'userToken',
      'config'
    ]),
    twoFactorUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const userToken = prop('userToken', this)

      if (!url || !userToken) {
        return ''
      }
      return `${url}/user/twofactor?api_key=${userToken}`
    }
  },

  methods: {
    ...mapActions([
      'updateProfile'
    ]),

    /**
     * Generates Two Factor code
     */
    generateTwoFactorCode: function() {
      // retrieve current authenticated user
      Auth.currentAuthenticatedUser().then(user => {
        this.cognitoUser = user
        // setup TOTP
        Auth.setupTOTP(user).then((code) => {
          this.totpCode = code
        })
      })
      .catch(err => console.log(err));
    },

    /**
     * Handles key-pressed event for last input in form
     */
    onHandleKeyPressed: function() {
      this.onTwoFactorFormSubmit()
    },
    /**
     * Handles submit event
     */
    onTwoFactorFormSubmit: function() {
      // TODO - keep code until SMS two factor validation is completed on backend
      // this.$refs.twoFactorForm
      //   .validate((valid) => {
      //     if (!valid) {
      //       return
      //     }
      //     this.sendTwoFactorAuthRequest()
      //   })

      Auth.verifyTotpToken(this.cognitoUser, this.totpValidation).then(() => {
      // don't forget to set TOTP as the preferred MFA method
      Auth.setPreferredMFA(this.cognitoUser, 'TOTP');
      this.handleTwoFactorXhrSucces()

      }).catch(this.handleXhrError.bind(this))
    },
    /**
     * Makes XHR call to update two factor auth status
     */
    sendTwoFactorAuthRequest: function() {
      const phoneNumber = this.ruleForm.phoneNumber.replace(/\D/g, '')

      this.sendXhr(this.twoFactorUrl, {
        method: 'POST',
        body: {
          countryCode: this.ruleForm.countryCode,
          phoneNumber
        }
      })
      .then(this.handleTwoFactorXhrSucces.bind(this))
      .catch(this.handleXhrError.bind(this))
    },
    /**
     * Handles successful two factor xhr response
     * @param {Object} response
     */
    handleTwoFactorXhrSucces: function(response) {
      this.closeDialog()

      EventBus.$emit('toast', {
        detail: {
          type: 'MESSAGE',
          msg: 'Two-factor Authentication successfully added'
        }
      })

      this.updateProfile({
        ...this.profile,
        authyId: true
      })
    },
    /**
     * Resets form fields and validations
     */
    handleOpen: function() {
      this.labelPosition = 'right'
      this.apiKeys = []
      this.autoFocus()
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      // this.$refs.twoFactorForm.resetFields()
    }
  },

  mounted () {
    this.generateTwoFactorCode()
  },
}
</script>

<style scoped lang="scss">
p {
  color: black;
}

.strong {
  font-size: 14px;
  font-weight: 500;
  margin-top: 30px;
}

</style>
