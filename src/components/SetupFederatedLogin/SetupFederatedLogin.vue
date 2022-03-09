<template>
  <div class="wrapper">



    <div
      v-if="this.askingForEmail"
      class="login-wrap"
    >
      <h2 class="sharp-sans">
        Welcome to the Pennsieve platform!
      </h2>
      <p>Please enter your email address so that we may add it to your user profile. Having an email address associated with your user profile is important. The Pennsieve platform sends emails to users from time to time.</p>
      <el-form
        id="email-form"
        ref="emailForm"
        :model="emailForm"
        :rules="emailRules"
        status-icon
        @submit.native.prevent="onSubmitLookupEmailAddress"
      >
        <el-form-item
          label="Email Address"
          prop="emailAddress"
        >
          <el-input
            v-model="emailForm.emailAddress"
            required
            class="email-address-input"
            autofocus
          />
        </el-form-item>
        <el-form-item>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Looking up email address"
            @click="onSubmitLookupEmailAddress"
          >
            Add Email Address
          </bf-button>
        </el-form-item>
      </el-form>
    </div>



    <div
      v-if="this.askingForProfileInfo"
      class="login-wrap"
      >
      <h2 class="sharp-sans">
        Let's set up your profile.
      </h2>
      <p>Welcome to the Pennsieve platform! Complete your profile so members of your team can easily identify you. <strong>All fields are required</strong>.</p>
      <el-form
        id="profile-form"
        ref="profileForm"
        :model="profileForm"
        :rules="profileRules"
        status-icon
        @submit.native.prevent="onSubmitUpdateProfile"
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
        <el-form-item>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Saving profile"
            @click="onSubmitUpdateProfile"
          >
            Save Profile
          </bf-button>
        </el-form-item>
      </el-form>
      <p class="agreement">
        By clicking “Save Profile” you are agreeing to the Pennsieve
        <a
          href="https://docs.pennsieve.io/page/pennsieve-terms-of-use"
          target="_blank"
        >
          Terms of Use
        </a> and
        <a
          href="https://docs.pennsieve.io/page/privacy-policy"
          target="_blank"
        >
          Privacy Policy
        </a>.
      </p>
    </div>



    <div
      v-if="this.askingToMerge"
      class="login-wrap"
      >
      <h2 class="sharp-sans">
        Would you like to merge accounts?
      </h2>
      <p>A Pennsieve account exists with the email address {{emailForm.emailAddress}}. Merging these accounts will give you a single account accessible by logging in with your email address or ORCID iD. You will need to provide the password for the email account in order to merge.</p>
      <el-form
        id="password-form"
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        status-icon
        @submit.native.prevent="onSubmitMergeAccounts"
      >
        <el-form-item
          label="Email Address"
          prop="emailAddress"
        >
          <el-input
            v-model="passwordForm.emailAddress"
            required
            class="email-address-input"
            readonly=true
          />
        </el-form-item>
        <el-form-item
          label="Password"
          prop="password"
          class="password-valid"
        >
          <el-input
            v-model="passwordForm.password"
            type="password"
            @enter="onSubmitMergeAccounts"
          />
        </el-form-item>
        <el-form-item>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Merging accounts"
            @click="onSubmitMergeAccounts"
          >
            Merge My Accounts
          </bf-button>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Merging accounts"
            @click="onClickEnterDifferentEmailAddress"
          >
            Enter Different Email Address
          </bf-button>
        </el-form-item>
      </el-form>
    </div>



    <div
      v-if="this.askingToFinalize"
      class="login-wrap"
      >
      <h2 class="sharp-sans">
        Let's finalize ORCID iD integration.
      </h2>
      <p>Clicking <strong>Finalize Integration</strong> will initiate a process whereby we will link your ORCID iD to your Pennsieve account. A pop-up window will appear asking you to grant or deny access to read and write to your ORCID record.
        Granting read access permits the Pennsieve platform to retrieve personal details from your ORCID record.
        Granting write access permits the Pennsieve platform to send dataset publication details to ORCID. </p>
      <bf-button
        class="completeLogin"
        :processing="isSavingProfile"
        processing-text="Finalizing Integration"
        @click="onClickFinalizeIntegration"
      >
        Finalize Integration
      </bf-button>
    </div>



    <div
      v-if="this.allDone"
      class="login-wrap"
      >
      <h2 class="sharp-sans">
        Account setup and integration is complete!
      </h2>
      <p>Your account setup and ORCID iD integration is complete. Click <strong>Proceed to Pennsieve</strong> to start working with the Pennsieve Platform.</p>
      <bf-button
        class="completeLogin"
        :processing="isSavingProfile"
        processing-text="Proceeding to Pennsieve..."
        @click="onClickProceedToPennsieve"
      >
        Proceed to Pennsieve
      </bf-button>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import {pathOr, propOr} from "ramda";
import Request from '@/mixins/request'
import { Auth } from '@aws-amplify/auth'
import EventBus from "../../utils/event-bus";

export default {
  name: 'SetupFederatedLogin',

  components: {
    BfButton
  },

  mixins: [
    Request
  ],

  data() {
    return {
      internalState: 0,
      internalStates: {
        initial: 0,
        askingForEmail: 0,
        askingForProfileInfo: 1,
        askingToMerge: 2,
        askingToFinalize: 3,
        done: 4
      },
      emailForm: {
        emailAddress: ''
      },
      emailRules: {
        emailAddress: [
          {required: true, message: 'Please enter your email address', trigger: 'submit'}
        ]
      },
      profileForm: {
        firstName: '',
        middleInitial: '',
        lastName: '',
        credential: '',
        degree: null
      },
      profileRules: {
        firstName: [
          { required: true, message: 'Please enter your first name', trigger: 'submit' }
        ],
        lastName: [
          { required: true, message: 'Please enter your last name', trigger: 'submit' }
        ]
      },
      passwordForm: {
        emailAddress: '',
        password: ''
      },
      isSavingProfile: false,
      isPasswordFormValid: false,
      isUserSignInFailed: false,
      oauthWindow: '',
      oauthCode: '',
      oauthInfo: ''
    }
  },

  computed: {
    ...mapState([
      'config'
    ]),

    askingForEmail: function() {
      return this.internalState == this.internalStates.askingForEmail
    },

    askingForProfileInfo: function() {
      return this.internalState == this.internalStates.askingForProfileInfo
    },

    askingToMerge: function() {
      return this.internalState == this.internalStates.askingToMerge
    },

    askingToFinalize: function() {
      return this.internalState == this.internalStates.askingToFinalize
    },

    allDone: function() {
      return this.internalState == this.internalStates.done
    },

    apiUrl: function() {
      return propOr('', 'apiUrl', this.config)
    },

    getUserByEmailRequest: function() {
      return `${this.apiUrl}/user/email/`
    },

    updateUserEmailUrl: function() {
      return `${this.apiUrl}/user/email`
    },

    updateUserProfileUrl: function() {
      return `${this.apiUrl}/user`
    },

    mergeUserAccountsUrl: function() {
      return `${this.apiUrl}/user/merge`
    },

    /**
     * Retrieves URL for ORCID redirect, based on environment
     */
    getORCIDUrl: function() {
      const url = pathOr('', ['config', 'ORCIDUrl'])(this)

      if (!url) {
        return ''
      }
      return url
    }
  },

  methods: {
    ...mapGetters(['userToken']),
    ...mapActions(['updateProfile']),
    ...mapState(['profile']),

    clearEmailForm: function() {
      this.emailForm.emailAddress = ''
    },

    clearProfileForm: function() {
      this.profileForm.firstName = ''
      this.profileForm.lastName = ''
    },

    clearPasswordForm: function() {
      this.passwordForm.emailAddress = ''
      this.passwordForm.password = ''
    },

    clearAllForms: function() {
      this.clearEmailForm()
      this.clearProfileForm()
      this.clearPasswordForm()
    },

    toAskForEmailAddress: function() {
      this.clearEmailForm()
      this.internalState = this.internalStates.askingForEmail
    },

    toAskForProfileInfo: function() {
      this.clearProfileForm()
      this.internalState = this.internalStates.askingForProfileInfo
    },

    toAskToMergeAccounts: function() {
      this.clearPasswordForm()
      this.passwordForm.emailAddress = this.emailForm.emailAddress
      this.internalState = this.internalStates.askingToMerge
    },

    toFinalizeIntegration: function() {
      this.internalState = this.internalStates.askingToFinalize
    },

    toAllDone: function() {
      this.internalState = this.internalStates.done
    },

    startOver: function() {
      this.clearAllForms()
      this.toAskForEmailAddress()
    },

    onSubmitLookupEmailAddress: function() {
      console.log("onSubmitLookupEmailAddress()")
      // TODO: validate form
      this.lookupEmailAddress(this.emailForm.emailAddress)
    },

    lookupEmailAddress: function(email) {
      console.log("lookupEmailAddress()")
      const url = `${this.getUserByEmailRequest}${email}`
      console.log("url:")
      console.log(url)
      this.sendXhr(url, {
        method: 'GET',
        header: {
          'Authorization': `bearer ${this.userToken()}`
        }
      })
        .then(user => {
          // email exists
          console.log("user:")
          console.log(user)
          this.toAskToMergeAccounts()
        })
        .catch(error => {
          if (error.status === 404) {
            console.log("404 - email address not found")
            this.updateUserEmailAddress()
            this.toAskForProfileInfo()
          } else {
            console.log("error:")
            console.log(err)
            this.toast("Error looking up email address: " + error)
            this.startOver()
          }
        })
    },

    onSubmitUpdateProfile: function() {
      console.log("onSubmitUpdateProfile()")
      // TODO: validate form

      try {
        this.updateUserProfile()
      }
      catch (error) {
        // something went wrong...
        // TODO: alert user of failure, and transition to ... ???
        console.log("error:")
        console.log(error)
        this.toast("Error updating profile: " + error)
      }
      this.toFinalizeIntegration()
    },

    updateUserEmailAddress: function() {
      console.log("updateUserEmailAddress()")
      const url = `${this.updateUserEmailUrl}`
      this.sendXhr(url, {
        method: 'PUT',
        header: {
          'Authorization': `bearer ${this.userToken()}`
        },
        body: {
          email: this.emailForm.emailAddress
        }
      })
        .then(user => {
          console.log("user:")
          console.log(user)
          this.updateProfile({
            ...this.profile,
            ...user
          })
        })
        .catch(error => {throw error})
    },

    updateUserProfile: function() {
      console.log("updateUserProfile()")
      const url = this.updateUserProfileUrl
      this.sendXhr(url, {
        method: 'PUT',
        header: {
          'Authorization': `bearer ${this.userToken()}`
        },
        body: {
          organization: this.profile.preferredOrganization,
          email: this.emailForm.email,
          url: this.profile.url,
          color: this.profile.color,
          ...this.profileForm
        }
      })
        .then(user => {
          console.log("user:")
          console.log(user)
          this.updateProfile({
            ...this.profile,
            ...user
          })
        })
        .catch(error => {throw error})
    },

    onSubmitMergeAccounts: function() {
      console.log("onSubmitMergeAccounts()")
      try {
        const authenticatedToken = this.authenticateUser()
        this.mergeUserAccounts(authenticatedToken)
      }
      catch (error) {
        // something went wrong...
        // TODO: alert user of failure, and transition to ... ???
        console.log("error:")
        console.log(error)
        this.toast("Error during account merge: " + error)
      }
      this.toFinalizeIntegration()
    },

    authenticateUser: function() {
      console.log("authenticateUser()")
      Auth.signIn(this.passwordForm.emailAddress, this.passwordForm.password)
        .then(authenticatedUser => {
          const authenticatedToken = pathOr('', ['signInUserSession', 'accessToken', 'jwtToken'], authenticatedUser)
          return authenticatedToken
        })
        .catch(error => {
          this.toast("Error authenticating user")
          throw(error)
        })
    },

    mergeUserAccounts: function(authenticatedToken) {
      console.log("mergeUserAccounts()")
      this.sendXhr(this.mergeUserAccountsUrl, {
        method: 'PUT',
        header: {
          'Authorization': `bearer ${this.userToken()}`
        },
        body: {
          oldUserToken: this.userToken(),
          newUserToken: authenticatedToken
        }
      })
      .then(user => {
        console.log("user:")
        console.log(user)
        this.updateProfile({
          ...this.profile,
          ...user
        })
      })
      .catch(error => {
        this.toast("Error merging accounts")
        throw(error)
      })
    },

    onClickEnterDifferentEmailAddress: function() {
      console.log("onSubmitEnterDifferentEmailAddress()")
      this.toAskForEmailAddress()
    },

    onClickFinalizeIntegration: function() {
      console.log("onClickFinalizeIntegration()")
      this.openORCID()
      this.toAllDone()
    },

    /**
     * Logic to connect to user's ORCID
     */
    openORCID: function() {
      this.oauthWindow = window.open(this.getORCIDUrl, "_blank", "toolbar=no, scrollbars=yes, width=500, height=600, top=500, left=500");
      window.addEventListener('message', function(event) {
        console.log("window-event-listener")
        console.log(event)
        if (event.data && event.data.source && event.data.source === 'orcid-redirect-response' && event.data.code) {
          console.log("window-event-listener - sending event: " + event.data.code)
          EventBus.$emit('finalize-orcid-integration', {
              oauthCode: event.data.code
            }
          )
        }
      })
    },

    onClickProceedToPennsieve: function() {
      console.log("onClickProceedToPennsieve()")
      Auth.currentAuthenticatedUser()
      .then(user => {
        const token = pathOr('', ['signInUserSession', 'accessToken', 'jwtToken'], user)
        const userAttributes = propOr({}, 'attributes', user)
        EventBus.$emit('login', {token, userAttributes, user})
      })
      .catch(error => {
        console.log("onClickProceedToPennsieve() error: " + error)
        this.toast("Error getting authenticated user: " + error)
        this.$router.replace('/')
      })
    },

    toast: function(message) {
      EventBus.$emit('toast', {
        detail: {
          msg: message
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
.btn-back-to-sign-in {
  text-decoration: none;
  .bf-button {
    margin-top: 0;
    text-decoration: none;;
  }
}
.user-already-created-wrap {
  align-items: center;
  display: flex;
  justify-content: space-between;
  .forgot-password {
    color: $app-primary-color;
    flex: 1;
    margin-left: 16px;
    text-align: center;
  }
}
</style>
