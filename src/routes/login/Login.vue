<template>
  <div class="not-logged-in">
    <div class="login-wrapper">
      <div class="login-inner">
        <div class="login-header">
          <img
            src="/static/images/pennsieve-logo-full.svg"
            class="logo"
          >
        </div>
        <!-- login form -->
        <el-form
          v-if="!showToken"
          id="login-form"
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          @submit.native.prevent="onFormSubmit"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="Your email address"
              autofocus
              class="email-input"
            />
          </el-form-item>
          <el-form-item
            class="password"
            prop="password"
          >
            <a11y-keys @key-pressed="onHandleKeyPressed">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="Your Password"
                class="password-input"
              />
            </a11y-keys>
          </el-form-item>
          <el-form-item class="signin-form-item">
            <bf-button
              class="sign-in"
              :processing="isLoggingIn"
              processing-text="Logging In"
              @click="onFormSubmit"
            >
              Sign in
            </bf-button>
            <router-link
              :to="{ name: 'password' }"
              class="forgot-password"
            >
              Forgot your password?
            </router-link>
          </el-form-item>
          <p class="terms">
            By signing in to Pennsieve you accept our <a
              class="grey-link"
              href="https://www.blackfynn.com/terms"
              target="_blank"
            >
              Terms of Use
            </a>
            and <a
              class="grey-link"
              href="https://www.blackfynn.com/privacy"
              target="_blank"
            >
              Privacy Policy
            </a>.
          </p>
        </el-form>
        <!-- two factor form --->
        <el-form
          v-if="showToken"
          ref="twoFactorForm"
          :model="twoFactorForm"
          :rules="twoFactorRules"
          @submit.native.prevent="onTwoFactorFormSubmit"
        >
          <el-form-item prop="token">
            <a11y-keys @key-pressed="onHandleTwoFactorKeyPressed">
              <el-input
                ref="twoFactor"
                v-model="twoFactorForm.token"
                placeholder="Two-factor token"
                autofocus
              />
            </a11y-keys>
          </el-form-item>
          <el-form-item>
            <bf-button
              :processing="isLoadingTwoFactor"
              processing-text="Submitting"
              @click="onTwoFactorFormSubmit"
            >
              Submit
            </bf-button>
            <a
              href="#"
              class="token-cancel"
              @click.prevent="handleTokenCancel"
            >
              Cancel
            </a>
          </el-form-item>
        </el-form>
      </div>
      <bf-footer />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions, mapState } from 'vuex'
import { propOr, pathOr } from 'ramda'
import Auth from '@aws-amplify/auth'


import BfButton from '../../components/shared/bf-button/BfButton.vue'
import A11yKeys from '../../components/shared/a11y-keys/A11yKeys.vue'
import BfFooter from '../../components/shared/bf-footer/BfFooter.vue'

import EventBus from '../../utils/event-bus'
import AutoFocus from '../../mixins/auto-focus'
import Request from '../../mixins/request'


export default Vue.component('bf-login', {
  components: {
    BfButton,
    A11yKeys,
    BfFooter
  },

  mixins: [
    AutoFocus,
    Request
  ],

  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      },
      loginRules: {
        email: [
          { required: true, message: 'Please add your Email', trigger: 'submit' }
        ],
        password: [
          { required: true, message: 'Please add your Password', trigger: 'submit' }
        ]
      },
      twoFactorForm: {
        token: ''
      },
      twoFactorRules: {
        token: [
          { required: true, message: 'Please add your Token', trigger: 'submit' }
        ]
      },
      tempSessionToken: '',
      showToken: false,
      isLoggingIn: false,
      isLoadingTwoFactor: false
    }
  },

  computed: {
    ...mapGetters([
      'config'
    ]),

    ...mapState([
      'cognitoUser'
    ]),

    loginUrl: function() {
      const apiUrl = propOr('', 'apiUrl', this.config)

      if (apiUrl) {
        return `${apiUrl}/account/login`
      }
      return ''
    },

    twoFactorUrl: function() {
      const apiUrl = propOr('', 'apiUrl', this.config)

      if (apiUrl && this.tempSessionToken) {
        return `${apiUrl}/account/login/twofactor?api_key=${this.tempSessionToken}`
      }
      return ''
    }
  },

  methods: {
    ...mapActions(['updateCognitoUser']),
    /**
     * Handles submit event
     * @param {Object} e
     */
    onFormSubmit: function(e) {
      e.preventDefault()

      this.$refs.loginForm
        .validate((valid) => {
          if (!valid) {
            return
          }
          this.sendLoginRequest()
        })
    },

    /**
     * Handles key-pressed event for last input in form
     */
    onHandleKeyPressed: function(e) {
      this.onFormSubmit(e)
    },

    /**
     * Makes XHR call to login
     */
    async sendLoginRequest() {
      this.isLoggingIn = true
       try {
         const user = await Auth.signIn(this.loginForm.email, this.loginForm.password)
         this.handleLoginSuccess(user)
        } catch (error) {
        this.isLoggingIn = false
        EventBus.$emit('toast', {
          detail: {
            msg: `There was an error with your login attempt. Please try again.`
          }
        })
        }
    },

    /**
     * Handles successful login response
     * @param {Object} response
     */
     handleLoginSuccess: function(user) {
      const token = pathOr('', ['signInUserSession', 'accessToken', 'jwtToken'], user)
      const userAttributes = propOr({}, 'attributes', user)
      this.updateCognitoUser(user)
      if (user.challengeName === 'SOFTWARE_TOKEN_MFA') {
        this.showToken = true
      } else {
        EventBus.$emit('login', {token, userAttributes, user})
      }
    },

    /**
     * Handles submit event for Two Factor form
     * @param {Object} e
     */
    onTwoFactorFormSubmit: function(e) {
      e.preventDefault()

      this.$refs.twoFactorForm
        .validate((valid) => {
          if (!valid) {
            return
          }
          this.sendTwoFactorRequest()
        })
    },

    /**
     * Handles key-pressed event for  input in Two Factor form
     * @param {Object} e
     */
    onHandleTwoFactorKeyPressed: function(e) {
      this.onTwoFactorFormSubmit(e)
    },

    /**
     * Makes XHR call to login
     */
    async sendTwoFactorRequest() {
      this.isLoadingTwoFactor = true
      this.twoFactorForm.token = this.twoFactorForm.token.replace(/\s/g, '')
      try {
        const user = await Auth.confirmSignIn(this.cognitoUser, this.twoFactorForm.token, 'SOFTWARE_TOKEN_MFA')
        const token = pathOr('', ['signInUserSession', 'accessToken', 'jwtToken'], user)
        const userAttributes = propOr({}, 'attributes', user)
        EventBus.$emit('login', {token, userAttributes, user})
        this.twoFactorForm.token = ''
        this.showToken = false
        this.isLoadingTwoFactor = false
      } catch (error) {
        this.handleTwoFactorError()
      }

    },

    /**
      * Handles failed login response
      * @param {Object} response
      */
    handleTwoFactorError: function(response) {
      this.isLoadingTwoFactor = false
      this.$refs.twoFactor.focus()

      EventBus.$emit('toast', {
        detail: {
          type: 'ERROR',
          msg: `Two Factor validation failed: Token is invalid`
        }
      })
    },

    /**
     * Clear two factor form
     * @param {Object} e
     */
    handleTokenCancel: function(e) {
      e.preventDefault()
      this.token = ''
      this.showToken = false
      this.loginForm.email = ''
      this.loginForm.password = ''
      this.twoFactorForm.token = ''
      this.isLoggingIn = false
    }
  }
})
</script>

<style lang="scss">
@import '../../assets/variables.scss';

.not-logged-in {
  background: $purple_1;
  display: block;

  .login-wrapper {
    background: $white;
    box-sizing: border-box;
    color: $gray_4;
    max-width: 720px;
    min-height: 100vh;
    padding-bottom: 20px;
    padding-top: 130px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login-inner {
    background: $white;
    box-sizing: border-box;
    color: $gray_4;
    max-width: 720px;
    flex: 1;
    width: 360px;
  }

  .login-header {
    margin-bottom: 60px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .logo {
    display: block;
    height: 35px;
    width: 198px;
  }

  .password {
    margin-bottom: 32px;
  }

  .forgot-password,
  .token-cancel {
    margin-left: 16px;
  }

  .sign-in,
  .forgot-password {
    width: 50%;
  }

  .forgot-password {
    text-align: center;
  }

  .button-spinner {
    height: 20px;
    margin: -3px 8px -3px 0;
    width: 20px;
  }

  .signin-form-item {
    .el-form-item__content {
      display: flex;
    }
  }
}

</style>
