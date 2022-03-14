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
      v-if="this.askingForPassword"
      class="login-wrap"
      >
      <h2 class="sharp-sans">
        We found an existing account
      </h2>
      <p>A Pennsieve account exists with the email address {{emailForm.emailAddress}}. Connecting your accounts will give you a single account accessible by logging in with your email address and passowrd or ORCID iD. Please enter your password for the Pennsieve account created with your email address.</p>
      <el-form
        id="password-form"
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        status-icon
        @submit.native.prevent="onSubmitAuthenticate"
      >
        <el-form-item
          label="Email Address"
          prop="emailAddress"
        >
          <el-input
            v-model="passwordForm.emailAddress"
            required
            class="email-address-input"
            readonly
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
            @enter="onSubmitAuthenticate"
          />
        </el-form-item>
        <el-form-item>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Merging accounts"
            @click="onSubmitAuthenticate"
          >
            Authenticate Pennsieve email account
          </bf-button>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Merging accounts"
            @click="onClickEnterDifferentEmailAddress"
          >
            Enter a Different Email Address
          </bf-button>
        </el-form-item>
      </el-form>
    </div>



    <div
      v-if="this.askingToConnect"
      class="login-wrap"
      >
      <h2 class="sharp-sans">
        Authentication succeeded
      </h2>
      <p>Great! Your Pennsieve email account has been authenticated. Now let's connect your Pennsieve and ORCID accounts.</p>
      <bf-button
        class="completeLogin"
        :processing="isSavingProfile"
        processing-text="Connecting Accounts"
        @click="onClickConnectAccounts"
      >
        Connect Accounts
      </bf-button>
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
        askingForPassword: 2,
        askingToConnect: 3,
        askingToFinalize: 4,
        done: 5
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
      passwordRules: {
        emailAddress: [
          { required: true, message: 'Please add your Email', trigger: 'submit' }
        ],
        password: [
          { required: true, message: 'Please add your Password', trigger: 'submit' }
        ]
      },
      isSavingProfile: false,
      isPasswordFormValid: false,
      isUserSignInFailed: false,
      currentAuthentication: {
        user: '',
        token: '',
        userAttributes: ''
      },
      currentCognitoUser: {},
      currentProfile: {},
      authenticatedUser: {
        emailAddress: '',
        token: ''
      },
      oauthWindow: '',
      oauthCode: '',
      oauthInfo: ''
    }
  },

  computed: {
    ...mapState([
      'config',
      'profile',
      'cognitoUser'
    ]),

    askingForEmail: function() {
      return this.internalState == this.internalStates.askingForEmail
    },

    askingForProfileInfo: function() {
      return this.internalState == this.internalStates.askingForProfileInfo
    },

    askingForPassword: function() {
      return this.internalState == this.internalStates.askingForPassword
    },

    askingToConnect: function() {
      return this.internalState == this.internalStates.askingToConnect
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

  mounted () {
    console.log("mounted()")
    this.currentCognitoUser = this.cognitoUser
    this.currentProfile = this.profile
    Auth.currentAuthenticatedUser()
      .then(user => {
        const token = pathOr('', ['signInUserSession', 'accessToken', 'jwtToken'], user)
        const userAttributes = propOr({}, 'attributes', user)
        this.currentAuthentication.user = user
        this.currentAuthentication.token = token
        this.currentAuthentication.userAttributes = userAttributes
      })
      .catch(error => {})
  },

  methods: {
    ...mapGetters(['userToken']),
    ...mapActions(['updateProfile']),
    ...mapState([
      'profile',
      'cognitoUser'
    ]),

    clearEmailForm: function() {
      this.emailForm.emailAddress = ''
    },

    clearProfileForm: function() {
      this.profileForm.firstName = ''
      this.profileForm.lastName = ''
    },

    clearPasswordForm: function() {
      this.authenticatedUser = {
        emailAddress: '',
        token: ''
      }
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

    toAskForPassword: function() {
      this.clearPasswordForm()
      this.passwordForm.emailAddress = this.emailForm.emailAddress
      this.internalState = this.internalStates.askingForPassword
    },

    toAskToConnectAccounts: function() {
      this.internalState = this.internalStates.askingToConnect
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
          // email exists, next ask for password
          console.log("user:")
          console.log(user)
          this.toAskForPassword()
        })
        .catch(error => {
          if (error.status === 404) {
            // email address does not exist, next ask for profile info
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

    onSubmitAuthenticate: function() {
      console.log("onSubmitAuthenticate()")

      this.authenticatedUser.emailAddress = this.passwordForm.emailAddress
      Auth.signIn(this.passwordForm.emailAddress, this.passwordForm.password)
        .then(authenticatedUser => {
          console.log("onSubmitAuthenticate() authenticatedUser:")
          console.log(authenticatedUser)
          this.authenticatedUser.token = pathOr('', ['signInUserSession', 'accessToken', 'jwtToken'], authenticatedUser)
          console.log("onSubmitAuthenticate() this.authenticatedUser.token:")
          console.log(this.authenticatedUser.token)
          this.toAskToConnectAccounts()
        })
        .catch(error => {
          console.log("Error while trying to authenticate user: " + error)
          this.toast("Error authenticating user")
          this.toAskForPassword()
        })
    },

    onClickConnectAccounts: function() {
      console.log("onClickConnectAccounts()")

      const url = `${this.mergeUserAccountsUrl}/${this.currentProfile.intId}`
      console.log("url: " + url)
      this.sendXhr(url, {
        method: 'PUT',
        header: {
          'Authorization': `bearer ${this.authenticatedUser.token}`
        },
        body: {
          email: this.authenticatedUser.emailAddress,
          cognitoId: this.currentCognitoUser.username
        }
      })
      .then(user => {
        this.updateProfile({
          ...this.profile,
          ...user
        })
        this.toFinalizeIntegration()
      })
      .catch(error => {
        console.log("Error while trying to merge accounts: " + error)
        this.toast("Error connecting accounts")
        this.toAskForPassword()
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
      const token = this.currentAuthentication.token
      const user = this.currentAuthentication.user
      const userAttributes = this.currentAuthentication.userAttributes
      EventBus.$emit('login', {token, userAttributes, user})
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
