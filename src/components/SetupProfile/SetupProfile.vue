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
        By clicking “Save Profile” you are agreeing to the Blackfynn
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
import Amplify, { Auth } from 'aws-amplify';

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import PasswordValidator from '@/mixins/password-validator'

import EventBus from '@/utils/event-bus'
import Request from '@/mixins/request'

import AWSConfig from '@/utils/aws-exports.js'

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
      isPasswordFormValid: false
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
        this.setupProfile()
      })
    },

    /**
     * API Request to create a new user
     */
    setupProfile: function() {
      Amplify.configure(AWSConfig)
      Auth.completeNewPassword(
        this.$route.params.user,
        this.profileForm.password,
        {
          email: this.$route.params.email
        }
        ).then(user => {
          // at this time the user is logged in if no MFA required
           this.sendXhr(this.createUserUrl, {
           method: 'POST',
           header: {
            'Authorization': `bearer ${user.signInUserSession.accessToken.jwtToken}`
          },
           body: {
              lastName: this.profileForm.lastName,
              firstName: this.profileForm.firstName,
              token: user.signInUserSession.accessToken.jwtToken,
              title: this.profileForm.jobTitle,
              password: this.profileForm.password
           }
    })
    .then(this.handleCreateUserSuccess.bind(this))
    .catch(this.handleFailedUserCreation.bind(this))
    }).catch(this.handleFailedUserCreation.bind(this));
    },

    /**
     * Handle successful API response to createUser
     * @param {Object} response
     *
     */
    handleCreateUserSuccess: function(response) {
      this.isSavingProfile = false
      let loginBody = {
        token: response.sessionId,
        profile: response.profile,
        firstTimeSignOn: true
      }

      const apiUrl = propOr('', 'apiUrl', this.config)
      const switchOrgUrl = `${apiUrl}/user/organization/${this.activeOrganizationId}/switch?api_key=${loginBody.token}`

      this.sendXhr(switchOrgUrl, {
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${loginBody.token}`
        }
      })
      .then(response => {
        EventBus.$emit('login', loginBody)
      })
      .catch(this.handleFailedUserCreation.bind(this))
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
  background: $white-matter;
  box-sizing: border-box;
  color: $glial;
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
