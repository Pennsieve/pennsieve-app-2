<template>
  <el-dialog
    class="log-in-dialog"
    :visible="visible"
    :show-close="false"
    :width="dialogWidth"
    @close="closeLogInDialog"
  >
    <button class="log-in-dialog__close-dialog" @click="closeLogInDialog">
      <svg-icon name="icon-remove" width="12" height="12" color="#71747c" />
    </button>

    <div class="log-in-dialog__container" :class="containerClass">
      <img
        src="/static/images/pennsieve-logo-full.svg"
        class="log-in-dialog__container--logo"
      />
      <template v-if="logInState !== states.TWO_FACTOR">
        <p class="log-in-dialog__container--top-copy">
          {{ formTopCopy }}
        </p>
        <template v-if="isLogInState">
          <el-form
            ref="logInForm"
            :model="logInForm"
            :rules="logInRules"
            :validate-on-rule-change="false"
            @submit.native.prevent="onFormSubmit('logInForm')"
          >
            <el-form-item prop="email">
              <el-input v-model="logInForm.email" placeholder="Email Address" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="logInForm.password"
                type="password"
                placeholder="Password"
              />
            </el-form-item>
            <el-form-item>
              <bf-button
                class="log-in-dialog__container--button"
                :processing="isLoggingIn"
                processing-text="Signing In"
                @click="onFormSubmit('logInForm')"
                >Sign In</bf-button
              >
            </el-form-item>
          </el-form>
          <bf-button
            class="log-in-dialog__container--federated-login-button"
            :processing="isLoggingIn"
            processing-text="Signing In"
            @click="initiateFederatedLogin('ORCID')"
            ><img src="/static/images/orcid_24x24.png" alt="iD" width="24" height="24" style="display: block; margin-left: auto; margin-right: auto; width: 24px; height: 24px">Sign In with your ORCID iD</bf-button>
          <div class="log-in-dialog__container--actions" :class="actionsClass">
            <a href="#" @click.prevent="toForgotPasswordState"
              >Forgot Password?</a
            >
            |
            <a href="https://docs.pennsieve.io/" target="_blank"
              >Learn More</a
            >
          </div>
        </template>
        <template v-else-if="isForgotPasswordState">
          <el-form
            ref="forgotPasswordForm"
            :model="forgotPasswordForm"
            :rules="forgotPasswordRules"
            :validate-on-rule-change="false"
            @submit.native.prevent="onFormSubmit('forgotPasswordForm')"
          >
            <el-form-item prop="email">
              <el-input
                ref="forgotPasswordEmailInput"
                v-model="forgotPasswordForm.email"
                placeholder="Email Address"
                @enter="onFormSubmit('forgotPasswordForm')"
              />
            </el-form-item>
            <el-form-item>
              <bf-button
                class="log-in-dialog__container--button"
                :processing="isSendingResetEmail"
                processing-text="Sending Email"
                @click="onFormSubmit('forgotPasswordForm')"
              >
                Reset password
              </bf-button>
            </el-form-item>
          </el-form>
          <a
            class="log-in-dialog__container--actions"
            :class="actionsClass"
            href="#"
            @click.prevent="toLogInState"
          >
            <svg-icon icon="icon-arrow" dir="down" height="20" width="20" />Back
            to Sign In</a
          >
        </template>
        <template v-else>
          <bf-button
            class="log-in-dialog__container--back-button"
            @click="toLogInState"
          >
            Back to Sign In
          </bf-button>
          <a
            class="log-in-dialog__container--actions"
            :class="actionsClass"
            href="https://docs.pennsieve.io/"
            target="_blank"
            >Need Help?</a
          >
        </template>
        <p class="log-in-dialog__container--footer">
          By signing in to Pennsieve, you accept our
          <a
            class="grey-link"
            href="https://docs.pennsieve.io/page/pennsieve-terms-of-use"
            target="_blank"
            >Terms of Use</a
          >
          and
          <a
            class="grey-link"
            href="https://docs.pennsieve.io/page/privacy-policy"
            target="_blank"
            >Privacy Policy</a
          >.
        </p>
      </template>
      <!-- two factor form -->
      <el-form
        v-if="logInState === states.TWO_FACTOR"
        ref="twoFactorForm"
        class="two-factor-form"
        :model="twoFactorForm"
        :rules="twoFactorRules"
        @submit.native.prevent="onTwoFactorFormSubmit"
      >
        <el-form-item prop="token" :inline-message="true">
          <el-input
            ref="twoFactor"
            v-model="twoFactorForm.token"
            placeholder="Two-factor token"
            autofocus
            @key.enter="onTwoFactorFormSubmit"
          />
        </el-form-item>
        <el-form-item class="log-in-dialog__container--footer">
          <bf-button
            :processing="isLoadingTwoFactor"
            processing-text="Submitting"
            @click="onTwoFactorFormSubmit"
          >
            Submit
          </bf-button>
          <a href="#" class="grey-link ml-8" @click.prevent="toLogInState">
            Cancel
          </a>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { propOr, pathOr } from 'ramda'
import Auth from '@aws-amplify/auth'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import EventBus from '@/utils/event-bus'

export default {
  name: 'BfLogInDialog',

  components: {
    BfButton
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      logInForm: {
        email: '',
        password: ''
      },
      forgotPasswordForm: {
        email: ''
      },
      logInState: '',
      states: {
        LOG_IN: 'logIn',
        FORGOT_PASSWORD: 'forgotPassword',
        RESET_PASSWORD: 'resetPassword',
        TWO_FACTOR: 'twoFactor'
      },
      logInRules: {
        email: [
          {
            required: true,
            message: 'Please add your Email',
            trigger: 'submit'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please add your Password',
            trigger: 'submit'
          }
        ]
      },
      twoFactorForm: {
        token: ''
      },
      twoFactorRules: {
        token: [
          {
            required: true,
            message: 'Please add your Token',
            trigger: 'submit'
          }
        ]
      },
      isLoadingTwoFactor: false,
      tempSessionToken: '',
      isLoggingIn: false,
      isSendingResetEmail: false
    }
  },

  computed: {
    /**
     * True if user is on login dialog
     * @returns {Boolean}
     */
    isLogInState() {
      return this.logInState === this.states.LOG_IN
    },

    /**
     * True if user is on forgot password dialog
     * @returns {Boolean}
     */
    isForgotPasswordState() {
      return this.logInState === this.states.FORGOT_PASSWORD
    },

    /**
     * True if user is on reset password dialog
     * @returns {Boolean}
     */
    isResetPasswordState() {
      return this.logInState === this.states.RESET_PASSWORD
    },

    /**
     * Conditional modal width for mobile
     * @returns {String}
     */
    dialogWidth() {
      return this.isMobile ? '327px' : '374px'
    },

    /**
     * Conditional modal height to account for
     * different dialog heights
     * @returns {String}
     */
    containerClass() {
      return this.isForgotPasswordState || this.isResetPasswordState
        ? 'password-reset-height'
        : 'log-in-height'
    },

    /**
     * Conditional container bottom margin
     * for actions below dialog forms
     * @returns {String}
     */
    actionsClass() {
      return this.isResetPasswordState
        ? 'reset-password'
        : this.isForgotPasswordState
        ? 'forgot-password'
        : 'log-in'
    },

    /**
     * Copy at the top of the three different
     * dialog dialogs
     * @returns {String}
     */
    formTopCopy() {
      if (this.isForgotPasswordState) {
        return "We'll email you a link to reset your password."
      } else if (this.isResetPasswordState) {
        return "We've sent an email that contains a link to reset your password. Contact support if you have any issues or don't receive an email."
      } else {
        return 'Sign in using your existing Pennsieve account.'
      }
    },

    /**
     * User api url
     * @returns {String}
     */
    userUrl() {
      return `${process.env.api_host}/user`
    },

    twoFactorUrl() {
      return `${process.env.api_host}/account/login/twofactor?api_key=${this.tempSessionToken}`
    },

    /**
     * Rules for forgot password form
     * @returns {Object}
     */
    forgotPasswordRules() {
      return { email: this.logInRules.email }
    }
  },

  beforeMount() {
    // Start on login dialog
    this.toLogInState()
  },

  methods: {
    ...mapActions(['updateUserToken', 'updateProfile']),

    /**
     * Reset all values and validation for
     * login form
     */
    resetLogInForm() {
      this.$refs.logInForm.clearValidate('email')
      this.$refs.logInForm.clearValidate('password')
      this.logInForm.email = ''
      this.logInForm.password = ''

      this.twoFactorForm.token = ''
      this.isLoadingTwoFactor = false
    },

    /**
     * Reset all values and validation for
     * forgot password form
     */
    resetForgotPasswordForm() {
      this.$refs.forgotPasswordForm.clearValidate('email')
      this.forgotPasswordForm.email = ''
    },

    /**
     * Reset all values and validation for
     * two factor form
     */
    resetTwoFactorForm() {
      this.$refs.twoFactorForm.clearValidate('token')
      this.twoFactorForm.token = ''
    },

    /**
     * Close login modal, clear current form and
     * return to login dialog before closings
     */
    closeLogInDialog() {
      if (this.isLogInState) {
        this.resetLogInForm()
      } else if (this.isForgotPasswordState) {
        this.resetForgotPasswordForm()
      }
      if (!this.isLogInState) {
        this.toLogInState()
      }
      this.$emit('close-log-in-dialog')
    },

    /**
     * Send user to login dialog
     */
    toLogInState() {
      if (this.isForgotPasswordState) {
        this.resetForgotPasswordForm()
      }
      if (this.logInState === this.states.TWO_FACTOR) {
        this.resetTwoFactorForm()
      }
      this.logInState = this.states.LOG_IN
    },

    /**
     * Send user to forgot password dialog
     */
    toForgotPasswordState() {
      if (this.isLogInState) {
        this.resetLogInForm()
      }
      this.logInState = this.states.FORGOT_PASSWORD
      this.$nextTick(() => this.$refs.forgotPasswordEmailInput.focus())
    },

    /**
     * Send user to reset password confirmation
     * dialog
     */
    toResetPasswordState() {
      if (this.isForgotPasswordState) {
        this.resetForgotPasswordForm()
      }
      this.logInState = this.states.RESET_PASSWORD
    },

    /**
     * Validate form and submit if valid
     * @param {String} e
     */
    onFormSubmit(e) {
      this.$refs[e].validate((valid) => {
        if (!valid) {
          return
        }
        if (this.isLogInState) {
          this.sendLoginRequest()
        } else {
          this.sendResetPasswordEmailRequest()
        }
      })
    },

    /**
     * Handle login request after validation
     */
    async sendLoginRequest() {
      this.isLoggingIn = true
      try {
        const user = await Auth.signIn(
          this.logInForm.email,
          this.logInForm.password
        )
        // this.handleLoginSuccess(user)
        this.$emit('succesfulLogin', user)
      } catch (error) {
        EventBus.$emit('toast', {
          detail: {
            msg: `There was an error with your login attempt. Please try again.`
          }
        })
      }
      this.isLoggingIn = false
    },
    
    initiateFederatedLogin(provider) {
      console.log("initiateFederatedLogin() provider: " + provider)
    },

    /**
     * Handle a successful login: set vuex state
     * and cookies, close login dialog
     */
    handleLoginSuccess(user) {
      const token = pathOr(
        '',
        ['signInUserSession', 'accessToken', 'jwtToken'],
        user
      )
      const userAttributes = propOr({}, 'attributes', user)
      if (user.preferredMFA !== 'NOMFA') {
        this.tempSessionToken = token
        this.logInState = this.states.TWO_FACTOR

        this.$nextTick(() => {
          this.$refs.twoFactor.focus()
        })
      } else {
        this.setLogin(token, userAttributes)
      }
    },

    /**
     * Log the user in and set the state
     * @param {String} token
     * @param {Object} profile
     */
    setLogin(token) {
      this.$cookies.set('user_token', token)

      this.updateUserToken(token)
      const url = `${this.userUrl}` + `?api_key=${token}`
      this.$axios.$get(url).then((response) => {
        this.updateProfile(response)
      })
      this.closeLogInDialog()
    },

    /**
     * Handle password reset request after validation
     */
    sendResetPasswordEmailRequest() {
      this.isSendingResetEmail = true
      Auth.forgotPassword(this.forgotPasswordForm.email)
        .then(this.toResetPasswordState())
        .catch(() => {
          EventBus.$emit('toast', {
            detail: {
              msg: `There was an error sending a password reset request. Please try again.`
            }
          })
        })
        .finally(() => {
          this.isSendingResetEmail = false
        })
    },

    /**
     * Generate password reset url based on email param
     * @param {String} email
     */
    generateResetPasswordEmailUrl(email) {
      return `${process.env.api_host}/account/${email}/reset`
    },

    /**
     * Handles submit event for Two Factor form
     */
    onTwoFactorFormSubmit() {
      this.$refs.twoFactorForm.validate((valid) => {
        if (!valid) {
          return
        }
        this.sendTwoFactorRequest()
      })
    },

    /**
     * Makes XHR call to login
     */
    sendTwoFactorRequest() {
      this.isLoadingTwoFactor = true

      this.$axios
        .$post(this.twoFactorUrl, {
          token: this.twoFactorForm.token
        })
        .then(this.handleTwoFactorSuccess.bind(this))
        .catch(this.handleTwoFactorError.bind(this))
    },

    /**
     * Handles successful login response
     * @param {Object} response
     */
    handleTwoFactorSuccess(response) {
      this.setLogin(response.sessionToken, response.profile)
    },

    /**
     * Handles failed login response
     * @param {Object} response
     */
    handleTwoFactorError(response) {
      this.isLoadingTwoFactor = false
      this.$refs.twoFactor.focus()

      EventBus.$emit('toast', {
        detail: {
          type: 'ERROR',
          msg: `Two Factor validation failed: Token is invalid`
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.log-in-dialog {
  &__close-dialog {
    float: right;
  }

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    word-break: normal;

    a {
      line-height: 18px;
      font-size: 14px;
    }

    &--logo {
      padding: 20px 0 30px 0;
      display: block;
      height: 35px;
      width: 198px;
    }

    &--top-copy {
      margin-bottom: 16px;
      line-height: 22px;
    }

    &--button,
    &--back-button {
      width: 298px;
    }

    &--back-button {
      margin-bottom: 16px;
    }

    &--federated-login-button {
      height: 36px;
      width: 298px;
      color: black;
      background-color: whitesmoke;
      border-color: darkgray;
    }

    &--actions {
      &.log-in {
        margin-top: 32px;
        margin-bottom: 32px;
        @media (max-width: 48em) {
          margin-bottom: 22px;
        }
      }
      &.forgot-password {
        margin-bottom: 56px;
        @media (max-width: 48em) {
          margin-bottom: 46px;
        }
      }
      &.reset-password {
        margin-bottom: 70px;
        @media (max-width: 48em) {
          margin-bottom: 60px;
        }
      }
    }

    &--footer {
      color: $purple_1;
      line-height: 18px;
      font-size: 14px;
    }
  }

  .el-input {
    width: 100%;
  }

  .el-form-item {
    margin-bottom: 16px;
  }
}

/deep/ .el-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }
}

.password-reset-height {
  height: 355px;
}

.two-factor-form {
  text-align: left;
  width: 100%;
}
</style>
