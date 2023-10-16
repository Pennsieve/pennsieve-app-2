<template>
  <div class="not-logged-in">
    <!-- Header   -->
    <pennsieve-header
      :is-search-visible="false"
      @onLogin="handleLoginSuccess"
    />

    <!-- Image call-out   -->
    <div class="body-content-wrap">
      <div class="header-feature">
        <div class="discover-content container-fluid">
          <div class="row">
            <div class="col-xs-12">
              <h1>Scientific Data Management, Integration and Publishing.</h1>
              <p>
                Organize, visualize and link scientific data, and publish high
                quality datasets with the Pennsieve Platform.
              </p>
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12 col-sm-10"><dataset-search /></div>
          </div>
        </div>
        <img
          src="/static/images/illustrations/illo-neuron-mural.svg"
          alt="Neuron Mural Image"
        />
      </div>
    </div>

    <div class="highlight-wrapper">
      <div class="highlight-image">
        <img
          src="/static/images/illustrations/research-platform.svg"
          class="highlight"
        />
      </div>
      <div class="highlight-text">
        <p>
          The Pennsieve Data Management Platform provides a scalable cloud-based
          solution for managing, analyzing, and sharing scientific datasets. The
          platform enables graph based data and metadata integration, supporting
          meaningful curation of data in context. Using the platform, scientists
          can publish high quality datasets, cite, and make them available to
          the larger scientific community.
        </p>
      </div>
    </div>

    <div class="highlight-wrapper2">
      <div class="highlight-text">
        <p class="larger">
          "What if all you have to do is ask the right scientific question?"
        </p>
        <p>
          Integrate files, complex metadata and annotations in a meaningful way.
        </p>
      </div>
      <div class="highlight-image">
        <img
          src="/static/images/illustrations/illo-dr_azumi_1.svg"
          class="highlight"
        />
      </div>
    </div>

    <div class="featureSection">
      <div class="feature" v-for="feature in features">
        <img ref="img" :src="feature.img" alt="Dataset Banner Image" />
        <div class="content">
          <div class="header">{{ feature.header }}</div>
          <div class="text">{{ feature.text }}</div>
        </div>
      </div>
    </div>

    <div class="discover-section">
      <div class="header">Discover Public Datasets</div>
      <div class="subheader">
        Private datasets can be published to Pennsieve Discover
      </div>
      <PublicDatasetsGrid />
      <div class="browseAllButton">
        <bf-button type="submit" @click="directToDiscover">
          More Public Data
        </bf-button>
      </div>
    </div>

    <div class="org-section">
      <img
        ref="img"
        src="/static/logos/psom_logo_blue.svg"
        alt="Perelman School of Medicine at the University of Pennsylvania"
        class="logo"
      />
      <img
        ref="img"
        src="/static/logos/ibi-logo.png"
        alt="Institute for Biomedical Informatics"
        class="logo"
      />
      <img
        ref="img"
        src="/static/logos/cropped-CNT-logo.png"
        alt="Center for Translational Bioengineering  & Therapeutics"
        class="logo"
      />
      <img
        ref="img"
        src="/static/logos/DataCite-Logos_primary.svg"
        alt="Datacite.org"
        class="logo"
      />
      <img
        ref="img"
        src="/static/logos/ORCID_Member_CMYK.svg"
        alt="Orcid.org"
        class="logo"
      />
    </div>

    <PennsieveFooter />
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions, mapState } from 'vuex'
import { propOr, pathOr } from 'ramda'
import { Auth } from '@aws-amplify/auth'

import BfButton from '../../components/shared/bf-button/BfButton.vue'
import A11yKeys from '../../components/shared/a11y-keys/A11yKeys.vue'
import BfFooter from '../../components/shared/bf-footer/BfFooter.vue'
import PennsieveHeader from '../../components/shared/PennsieveHeader/PennsieveHeader.vue'
import DatasetSearch from '../../components/DatasetSearch/DatasetSearch'
import PennsieveFooter from '../../components/shared/PennsieveFooter/PennsieveFooter.vue'
import PublicDatasetsGrid from '../../components/PublicDatasets/PublicDatasetsGrid'

import EventBus from '../../utils/event-bus'
import AutoFocus from '../../mixins/auto-focus'
import Request from '../../mixins/request'

export default Vue.component('bf-login', {
  components: {
    BfButton,
    A11yKeys,
    BfFooter,
    PennsieveHeader,
    DatasetSearch,
    PennsieveFooter,
    PublicDatasetsGrid
  },

  mixins: [AutoFocus, Request],

  data() {
    return {
      features: [
        {
          img: '/static/images/icons/collaboration.svg',
          header: 'Easy sharing between collaborators',
          text:
            'An easy, cloud-based solution for managing and sharing data with your team.'
        },
        {
          img: '/static/images/icons/analyze.svg',
          header: 'Explore your data',
          text:
            'Open API access and Python client to programmatically interact with data on the platform.'
        },
        {
          img: '/static/images/icons/log-forms.svg',
          header: 'Advanced metadata management',
          text:
            'Create advanced metadata schemas and link metadata to files through a knowledge graph.'
        },
        {
          img: '/static/images/icons/eeg-data.svg',
          header: 'Interactive viewers',
          text:
            'Directly interact with microscopy, timeseries and other scientific data modalities in the browser.'
        },
        {
          img: '/static/images/icons/security.svg',
          header: 'Secure data management',
          text:
            'Secure encrypted storage in the cloud, SSL data transfer, and flexible user permissions.'
        },
        {
          img: '/static/images/icons/storage.svg',
          header: 'FAIR publishing of data',
          text:
            'Publish your data, make your data findable, and cite your data using a DOI'
        }
      ],
      loginForm: {
        email: '',
        password: ''
      },
      loginRules: {
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
      tempSessionToken: '',
      showToken: false,
      isLoggingIn: false,
      isLoadingTwoFactor: false,
      oauthWindow: '',
      oauthCode: '',
      showOrcidError: false,
      windowWidth: 0
    }
  },

  computed: {
    ...mapGetters(['config']),

    ...mapState(['cognitoUser']),

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
        return `${apiUrl}/account/login/twofactor?api_key=${
          this.tempSessionToken
        }`
      }
      return ''
    }
  },

  mounted: function() {
    this.doneMounting()
  },

  methods: {
    ...mapActions(['updateCognitoUser']),

    /**
     * Handles submit event
     * @param {Object} e
     */
    onFormSubmit: function(e) {
      e.preventDefault()

      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return
        }
        this.sendLoginRequest()
      })
    },

    directToDiscover: function() {
      const discoverUrl = propOr('', 'discoverAppUrl', this.config)

      window.location.href = `${discoverUrl}`
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
        const user = await Auth.signIn(
          this.loginForm.email,
          this.loginForm.password
        )
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
      const token = pathOr(
        '',
        ['signInUserSession', 'accessToken', 'jwtToken'],
        user
      )
      const userAttributes = propOr({}, 'attributes', user)
      this.updateCognitoUser(user)
      if (user.challengeName === 'SOFTWARE_TOKEN_MFA') {
        this.showToken = true
      } else {
        EventBus.$emit('login', { token, userAttributes, user })
      }
    },

    /**
     * Handles submit event for Two Factor form
     * @param {Object} e
     */
    onTwoFactorFormSubmit: function(e) {
      e.preventDefault()

      this.$refs.twoFactorForm.validate(valid => {
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
        const user = await Auth.confirmSignIn(
          this.cognitoUser,
          this.twoFactorForm.token,
          'SOFTWARE_TOKEN_MFA'
        )
        const token = pathOr(
          '',
          ['signInUserSession', 'accessToken', 'jwtToken'],
          user
        )
        const userAttributes = propOr({}, 'attributes', user)
        EventBus.$emit('login', { token, userAttributes, user })
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
    },

    onLoginWithORCID: function(e) {
      e.preventDefault()
      this.sendFederatedLoginRequest('ORCID')
    },

    async sendFederatedLoginRequest(provider) {
      this.isLoggingIn = true
      try {
        const cred = await Auth.federatedSignIn({ customProvider: provider })
      } catch (error) {
        this.isLoggingIn = false
        EventBus.$emit('toast', {
          detail: {
            msg: `There was an error with your federated login attempt. Please try again.`
          }
        })
      }
    },

    getFragmentParameterByName: function(name) {
      var name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
      var regex = new RegExp('[\\#&]' + name + '=([^&#]*)'),
        results = regex.exec(window.location.hash)
      return results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '))
    },

    doneMounting: async function() {
      var access_token = this.getFragmentParameterByName('access_token')
      if (access_token) {
        const user = await Auth.currentAuthenticatedUser()
        this.handleLoginSuccess(user)
      }

      var error = this.getFragmentParameterByName('error_description')
      if (error.includes('Already found an entry for username orcid', 0)) {
        // try federated login again (workaround for known AWS/Cognito issue)
        this.sendFederatedLoginRequest('ORCID')
      } else if (error.includes('PreSignUp failed with error', 0)) {
        EventBus.$emit('toast', {
          detail: {
            msg: `ORCID Login Error: please login with your Pennsieve account and verify your ORCID iD is linked.`
          }
        })
      } else if (error) {
        // TODO: present the error on the login page
        console.log('doneMounting() error: ' + error)
      }
    }
  }
})
</script>

<style lang="scss">
@import '../../assets/variables.scss';

.not-logged-in {
  background: $gray_1;
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

  .sign-up {
    text-align: center;
    margin-bottom: 20px;
    margin-top: 30px;
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

  .centered-spaced {
    text-align: center;
    margin-bottom: 20px;
    margin-top: 30px;
  }
  .orcid-error-text {
    color: #fcb603;
  }
}

.org-section {
  background: $gray-2;
  min-height: 80px;
  margin-top: 80px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 24px;
  .logo {
    padding: 8px;
    height: 40px;
    width: auto;
    align-self: center;
    color: $gray_6;
  }
}

.highlight-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  .highlight-image {
    .highlight {
      display: block;
      height: 400px;
      width: 400px;
    }
  }
  .highlight-text {
    margin: 24px;
    font-size: 24px;
    color: $gray_3;
    line-height: 1.5em;
    align-self: center;
    max-width: 600px;
  }
}

.highlight-wrapper2 {
  display: flex;
  flex-direction: row;
  margin: 0 40px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin-top: 48px;
  .highlight-image {
    .highlight {
      margin: 8px;
      display: block;
      height: 64px;
      width: 64px;
    }
  }
  .highlight-text {
    color: $gray_3;
    margin: 0 24px;
    font-size: 16px;

    .larger {
      color: $gray_4;
      font-size: 24px;
      line-height: 1.1em;
    }
  }
}

.featureSection {
  margin: 80px auto;
  padding: 24px;
  flex-direction: row;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  max-width: 1200px;
  .feature {
    display: flex;
    flex-direction: row;
    max-width: 350px;
    align-items: center;
    .content {
      margin-left: 8px;
      .header {
        color: $gray_5;
        font-weight: 500;
        font-size: 16px;
      }
      .text {
        color: $gray_4;
        line-height: 1.1em;
        font-weight: 300;
        font-size: 14px;
      }
    }
    img {
      display: block;
      width: 86px;
      height: 86px;
    }
  }
}

.discover-section {
  .header {
    font-weight: 500;
    font-size: 32px;
    text-align: center;
    color: $gray_4;
    margin-bottom: 8px;
  }
  .subheader {
    font-weight: 300;
    font-size: 16px;
    text-align: center;
    color: $gray_4;
    margin-bottom: 16px;
  }
}

#login-orcid-button {
  border: 1px solid #d3d3d3;
  padding: 0.3em;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 1px 1px 3px #999;
  cursor: pointer;
  color: #999;
  font-weight: bold;
  font-size: 0.8em;
  line-height: 24px;
  vertical-align: middle;
}

#login-orcid-button:hover {
  border: 1px solid #338caf;
  color: #338caf;
}

#orcid-id-icon {
  display: block;
  margin: 0 0.5em 0 0;
  padding: 0;
  float: left;
}

img {
  //position: absolute;
  top: -381px;
  right: -575px;
  width: 1397px;
  z-index: 1;
}

.browseAllButton {
  display: flex;
  justify-content: center;
  margin: 16px;
}

.header-feature {
  width: 100%;
  background-color: $gray_4;
  box-sizing: border-box;
  padding: 64px 0 64px;
  position: relative;
  overflow: hidden;
  @media only screen and (max-width: 550px) {
    padding-top: 40px;
  }

  .discover-content {
    margin: 0 24px;
    position: relative;
    z-index: 2;
    box-sizing: border-box;
    max-width: calc(936px + 4rem);
  }

  h1 {
    color: #ffffff;
    font-size: 48px;
    font-weight: 200;
    margin-bottom: 16px;
    max-width: 600px;
    line-height: 56px;
  }

  p {
    color: #ffffff;
    font-size: 24px;
    font-weight: 200;
    line-height: 32px;
    margin-bottom: 24px;
    max-width: 616px;
  }

  a {
    text-decoration: none;
    color: #fafafa;
    button {
      border-radius: 3px;
      border: 2px solid #fafafa;
      height: 48px;
      width: 252px;
      font-size: 16px;
      font-weight: bold;
      line-height: 32px;
      color: #fafafa;

      &:hover {
        background-color: #2760ff;
        border: 2px solid #2760ff;
      }

      &:focus {
        background-color: #1c46bd;
        border: 2px solid #1c46bd;
      }
    }
  }

  .copy {
    z-index: 1;
  }

  img {
    position: absolute;
    top: -381px;
    right: -575px;
    width: 1397px;
    z-index: 1;
  }

  @media only screen and (min-width: 1024px) and (max-width: 1430px) {
    img {
      right: -787px;
    }
  }

  @media only screen and (min-width: 320px) and (max-width: 1020px) {
    img {
      right: -998px;
    }
  }
}
</style>
