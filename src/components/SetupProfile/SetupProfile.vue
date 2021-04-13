<template>
  <div class="wrapper">
    <div class="login-wrap">
      <h2 class="sharp-sans">
        Let's set up your profile.
      </h2>
      <p>Complete your profile so members of your team can easily idenitfy you. <strong>All fields are required</strong>.</p>
      <el-form
        id="profile-form"
        ref="profileForm"
        :model="profileForm"
        :rules="profileRules"
        status-icon
        @submit.native.prevent="onFormSubmit"
      >
        <el-form-item
          label="First Name"
          prop="firstName"
        >
          <el-input
            v-model="profileForm.firstName"
            required
            class="first-name-input"
            autofocus
          />
        </el-form-item>
        <el-form-item
          label="Last Name"
          prop="lastName"
        >
          <el-input
            v-model="profileForm.lastName"
            required
          />
        </el-form-item>
        <el-form-item
          label="Job Title"
          prop="jobTitle"
        >
          <el-input
            v-model="profileForm.jobTitle"
            required
          />
        </el-form-item>
        <el-form-item
          label="Password"
          prop="password"
          class="password-valid"
        >
          <el-input
            v-model="profileForm.password"
            type="password"
            @enter="onFormSubmit"
          />
          <transition name="el-zoom-in-top">
            <div
              v-if="isPasswordFormValid"
              class="pw-is-valid-text"
            >
              Strong Password!
            </div>
          </transition>
        </el-form-item>
        <div class="helper">
          We recommend that you create a password that is more than 8 characters long and contains a combination of uppercase & lowercase characters, numbers and symbols.
        </div>

        <el-form-item
          label="Retype Your Password"
          prop="passwordConfirm"
        >
          <el-input
            v-model="profileForm.passwordConfirm"
            type="password"
            required
          />
        </el-form-item>
        <el-form-item>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Logging In"
            @click="onFormSubmit"
          >
            Save Profile
          </bf-button>
        </el-form-item>
      </el-form>
      <p class="agreement">
        By clicking “Save Profile” you are agreeing to the Pennsieve
        <a
          href="https://www.blackfynn.com/terms"
          target="_blank"
        >
          Terms of Use
        </a> and
        <a
          href="https://www.blackfynn.com/privacy"
          target="_blank"
        >
          Privacy Policy
        </a>.
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { propOr } from 'ramda'
import Auth from '@aws-amplify/auth'

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import PasswordValidator from '@/mixins/password-validator'

import EventBus from '@/utils/event-bus'
import Request from '@/mixins/request'

export default {
  name: 'SetupProfile',

  components: {
    BfButton
  },

  mixins: [
    PasswordValidator,
    Request
  ],

  data() {
    const validatePassword = (rule, value, callback) => {

    if (value === '') {
      this.isPasswordFormValid = false
      return callback(new Error('Please input the password'))
    }

    const { isValid, feedback } = this.validatePassword(value)

    if (!isValid) {
      this.isPasswordFormValid = false
      callback(new Error(feedback))
    } else {
      this.isPasswordFormValid = true
      callback()
    }
  }
    return {
      profileForm: {
        firstName: '',
        lastName: '',
        jobTitle: '',
        password: '',
        passwordConfirm: ''
      },
      profileRules: {
        firstName: [
          { required: true, message: 'Please enter your first name', trigger: 'submit' }
        ],
        lastName: [
          { required: true, message: 'Please enter your last name', trigger: 'submit' }
        ],
        jobTitle: [
          { required: true, message: 'Please enter your job title', trigger: 'submit' }
        ],
        password: [
          { required: true, validator: validatePassword, trigger: 'change' }
        ],
        passwordConfirm: [
          { required: true, message: 'Please enter your password', trigger: 'submit' }
        ]
      },
      isSavingProfile: false,
      isPasswordFormValid: false,
      user: {}
    }
  },

  computed: {
    ...mapState([
      'config',
      'activeOrganization'
    ]),

    /**
     * Compute API url to createUser on initial setup
     */
    createUserUrl: function() {
      const apiUrl = propOr('', 'apiUrl', this.config)
      return `${apiUrl}/account/`
    },

    /**
     * Compute the organization ID from the URL
     * @returns {String}
     */
    activeOrganizationId: function() {
      return this.$route.params.orgId
    },

    /**
     * Get token for profile setup
    */
    setupProfileToken: function() {
      return this.$route.query.token
    },
  },

  methods: {
    /**
     * Submit the form to create the user
     * @param {Object} evt
     */
    onFormSubmit: function(evt) {
      // logic goes here
      evt.preventDefault()

      this.$refs.profileForm.validate((valid) => {
        if (!valid) {
          return
        }

        // Check if the passwords match
        if(this.password !== this.passwordConfirm) {
          this.passwordConfirm.isValid = false
          return;
        }

        this.isSavingProfile = true
        this.initialLogin()
      })
    },

    /**
     * Initial login
     */
    async initialLogin() {
      try {
         this.user = await Auth.signIn(this.$route.params.username, this.$route.params.password)
         this.setupProfile()
        } catch (error) {
          this.handleFailedSignIn(error)
        }
    },

    /**
     * API Request to create a new user
     */
    async setupProfile() {
      try {
        const newUser = await Auth.completeNewPassword(
          this.user,
          this.profileForm.password,
          {
            email: this.$route.query.email
          }
        )

        this.createUser(newUser.signInUserSession.accessToken.jwtToken)
      } catch (error) {
        this.handleFailedUserCreation()
      }
    },

    /**
     * Create the user on Pennsieve
     * @param {String} jwt
     */
    async createUser(jwt) {
      try {
        const user = await this.sendXhr(this.createUserUrl, {
          method: 'POST',
          header: {
            'Authorization': `bearer ${jwt}`
          },
          body: {
            lastName: this.profileForm.lastName,
            firstName: this.profileForm.firstName,
            title: this.profileForm.jobTitle,
          }
        })
        this.handleCreateUserSuccess(user, jwt)
      } catch (error) {
        this.handleFailedUserCreation()
      }
    },

    /**
     * Handle successful API response to createUser
     * @param {Object} response
     * @param {String} jwt
     *
     */
    handleCreateUserSuccess: function(response, jwt) {
      this.isSavingProfile = false
      let loginBody = {
        token: jwt,
        profile: response.profile,
        firstTimeSignOn: true
      }

      const orgId = response.orgIds[0]
      const switchOrgUrl = `${this.config.apiUrl}/session/switch-organization?organization_id=${orgId}`

      this.sendXhr(switchOrgUrl, {
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${jwt}`
        }
      })
      .then(() => {
        EventBus.$emit('login', loginBody)
      })
      .catch(this.handleFailedUserCreation.bind(this))
    },

    /**
     * Handle failed responsed to sign the user in before
     * account creation
     * @param {Object} error
     */
    handleFailedSignIn: function(error) {
      this.isSavingProfile = false
      const msg = error.code === 'NotAuthorizedException'
        ? 'This user has already been registered'
        : error.message

      EventBus.$emit('toast', {
        detail: {
          type: 'error',
          msg: msg
        }
      })
    },

    /**
     * Handle API response error to createUser
     * @param {Object} response
     */
    handleFailedUserCreation: function(response) {
      this.isSavingProfile = false
      const msg = response.status === 400 ?
        'Sorry, but your token has expired. Please request a new invitation.' :
        'Could not create a user with that username and password. Try adding more letters, numbers and punctuation.';
        EventBus.$emit('toast', {
          detail: {
            type: 'message',
            msg: msg
          }
        })

    }
  }
}
</script>

<style scoped lang="scss">
@import '../../assets/_variables.scss';

.wrapper {
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

.login-wrap {
  width: 360px;
  flex: 1;
  flex-basis: 0.000000001px;

  p {
    margin: 10px 0 28px;
  }
}

form {
  margin-bottom: 30px;
}

.bf-button {
  padding: 9px 35px;
  border-radius: 5px;
  line-height: 20px;
  margin-top: 10px;
}

.el-input {
  .el-input__inner {
      display: flex;
      flex-direction: row;
      background: #FFFFFF;
      border: 1px solid #DADADA;
      border-radius: 5px;
      box-sizing: border-box;
      font-size: 14px;
      line-height: inherit;
      max-width: 100%;
      padding: 10px;
      position: relative;
      width: 100%;
    }
  }

  .el-form {
    .el-form-item__content {
      div {
        line-height: 20px;
      }

      .el-form-item__error {
        font-size: 13px;
        line-height: 1;
        padding: 13px 10px;
        background: #FAFAFA;
        border-radius: 0 0 5px 5px;
        border: solid 1px #dadada;
        height: 15px;
        width: 94%;
        position: absolute;
        z-index: 0;
        margin: 0;
      }
    }
  }

.pw-is-valid-text {
  color: #17bb62;
  font-size: 13px;
  line-height: 1;
  padding: 13px 10px;
  background: #FAFAFA;
  border-radius: 0 0 5px 5px;
  border: solid 1px #dadada;
  height: 15px;
  width: 93.5%;
  position: absolute;
  z-index: 0;
  margin: 0;
}


.pw-recommendation-text {
  font-size: 13px;
  padding: 13px 10px;
  margin: 0;
}

.helper {
  color: #71747C;
  font-size: 13px;
  margin-top: 51px;
  margin-bottom: 15px;
}

.form-item-wrap {
  color: #000;
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  pointer-events: none;
}

h2 {
  font-size: 20px;
  line-height: 24px;
  font-weight: 400;
  margin: 0 0 12px;
}

a {
  color: #71747C;
  text-decoration: underline;
}

.sharp-sans {
  color: #000;
  font: 700 24px/31px 'SharpSans', sans-serif;
  display: flex;
}

.agreement {
  font-size: 13px;
  margin: 0;
}

</style>
