<template>
  <bf-page class="bf-my-settings">
    <bf-rafter
      slot="heading"
      title="My Settings"
    />

    <bf-stage slot="stage">
      <!-- update profile -->
      <el-form
        id="update-profile-form"
        ref="updateProfileForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="handleUpdateProfileSubmit"
      >
        <el-form-item
          label="First Name"
          prop="firstName"
        >
          <el-input
            v-model="ruleForm.firstName"
          />
        </el-form-item>
        <el-form-item
          id="input-middle-initial"
          label="Middle Initial"
          prop="middleInitial"
        >
          <el-input
            v-model="ruleForm.middleInitial"
            :maxlength="1"
          />
        </el-form-item>
        <el-form-item
          label="Last Name"
          prop="lastName"
        >
          <el-input
            v-model="ruleForm.lastName"
          />
        </el-form-item>
        <el-form-item
          label="Title"
          prop="credential"
        >
          <el-input
            v-model="ruleForm.credential"
          />
        </el-form-item>
        <el-form-item
          label="Degree"
          prop="degree"
        >
          <degree-select
            v-model="ruleForm.degree"
          />
        </el-form-item>
        <el-form-item>
          <bf-button @click="handleUpdateProfileSubmit">
            Update Profile
          </bf-button>
        </el-form-item>
      </el-form>
      <div
        class="divider"
      />
      <!-- reset password -->
      <el-row>
        <el-col :span="12">
          <h2>Password</h2>
          <el-row class="mb-20">
            <p>We'll send you an email containing a link to reset your password.</p>
          </el-row>
          <el-row>
            <bf-button @click="submitResetPasswordRequest">
              Reset Password
            </bf-button>
          </el-row>
        </el-col>
      </el-row>
      <div
        class="divider"
      />
      <!-- two-factor auth -->
      <el-row>
        <el-col :span="12">
          <h2>Two-Factor Authentication</h2>
          <el-row class="mb-20">
            <p>
              Keep your account secure by providing a security code from a trusted device each time you sign in.
              Two-factor authentication requires the free
              <a
                href="https://authy.com/download/"
                target="_blank"
              >
                Authy
              </a> app for iOS or Android.
            </p>
          </el-row>
          <el-row
            class="two-factor-wrap"
            type="flex"
            justify="space-between"
          >
            <el-col>
              <div class="two-factor-status-wrap">
                <span class="status-text">
                  Status: {{ hasAuthyId ? 'On' : 'Off' }}
                </span>
                <span
                  class="status-icon"
                  :class="{ enabled: hasAuthyId }"
                >
                  <svg-icon
                    :name="hasAuthyId ? 'icon-lock' : 'icon-unlocked'"
                    height="20"
                    width="20"
                  />
                </span>
              </div>
            </el-col>
            <el-col class="two-factor-col-btn">
              <bf-button
                @click="handleTwoFactorBtnClick(hasAuthyId)"
              >
                {{ hasAuthyId ? 'Disable' : 'Enable' }}
              </bf-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <div
        class="divider"
      />
      <!-- api keys -->
      <el-row>
        <el-col :span="12">
          <h2>API Keys</h2>
          <el-row v-if="hasApiKeys">
            <p>This is the list of API keys associated with your account and organization.</p>
          </el-row>
          <el-row class="mb-20">
            <bf-button @click="openApiKeyWindow('createApiKeyDialog')">
              Create API Key
            </bf-button>
          </el-row>
          <el-row class="mb-20">
            <template v-if="!hasApiKeys">
              <p>There are no API keys associated with this account and organization.</p>
            </template>
            <template v-else>
              <div
                v-loading="isApiKeysLoading"
                class="bf-table"
                element-loading-background="transparent"
              >
                <div class="bf-table-header">
                  <el-row
                    type="flex"
                    :gutter="20"
                  >
                    <el-col>
                      <button
                        :class="[isSorting('name') ? 'sort-active' : '']"
                        @click="sortColumn('name')"
                      >
                        Name
                        <svg-icon
                          class="sort-icon"
                          :name="sortIcon('name')"
                          color="currentColor"
                        />
                      </button>
                    </el-col>
                  </el-row>
                </div>
                <div
                  v-for="apiKey in apiKeys"
                  :key="apiKey.key"
                  class="bf-table-row"
                  :item="apiKey"
                >
                  <el-row
                    type="flex"
                    align="middle"
                  >
                    <el-col>
                      <span>
                        {{ apiKey.name }}
                      </span>
                    </el-col>
                    <el-col class="api-key-col-delete-btn">
                      <button @click="openApiKeyWindow('deleteApiKeyDialog', apiKey)">
                        <svg-icon
                          icon="icon-remove"
                          height="10"
                          width="10"
                        />
                      </button>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </template>
          </el-row>
        </el-col>
      </el-row>
      <div
        class="divider"
      />
      <!-- ORCID -->
      <el-row>
        <el-col :span="12">
          <h2 id="orcid-id">
            ORCID
          </h2>
          <el-row v-if="!hasOrcidId">
            <p>
              Connect your Pennsieve Profile to your ORCID. <a href="http://help.blackfynn.com/blackfynn-web-application/blackfynn-discover/linking-orcid-to-blackfynn">
                Learn More
              </a>
            </p>
            <button
              id="connect-orcid-button"
              @click="openORCID"
            >
              <img
                id="orcid-id-icon"
                src="/static/images/orcid_24x24.png"
                width="24"
                height="24"
                alt="Logo for ORCID"
              >
              Register or Connect your ORCID iD
            </button>
          </el-row>
          <el-row v-else>
            <div>
              <p class="orcid-success-text">
                Below is the ORCID associated with your Pennsieve account. <a
                  href="http://help.blackfynn.com/blackfynn-web-application/blackfynn-discover/linking-orcid-to-blackfynn"
                  target="_blank"
                >
                  Learn More
                </a>
              </p>
              <div
                v-if="!loading"
                class="orcid-success"
              >
                <img src="/static/images/orcid.png">
                <el-row
                  class="orcid-success-info"
                  type="flex"
                  align="middle"
                  alt="Logo for ORCID"
                >
                  <el-col>
                    <a
                      :href="getORCIDResultUrl"
                      target="_blank"
                    >
                      {{ getORCIDResultUrl }}
                    </a>
                  </el-col>
                </el-row>
                <el-col class="orcid-delete-button">
                  <button @click="isDeleteOrcidDialogVisible = true">
                    <svg-icon
                      icon="icon-remove"
                      height="10"
                      width="10"
                    />
                  </button>
                </el-col>
              </div>
              <div
                v-else
                class="orcid-waiting"
              >
                <el-row>
                  <div
                    v-loading="loading"
                    class="orcid-loader"
                  />
                </el-row>
              </div>
            </div>
          </el-row>
        </el-col>
      </el-row>

      <create-two-factor
        ref="addTwoFactorDialog"
      />

      <delete-two-factor
        ref="deleteTwoFactorDialog"
      />

      <create-api-key
        ref="createApiKeyDialog"
        @api-key-created="updateApiKeys"
      />

      <delete-api-key
        ref="deleteApiKeyDialog"
        @api-key-deleted="updateApiKeys"
      />

      <api-key-detail
        ref="apiKeyDetailDialog"
      />

      <delete-orcid
        ref="deleteOrcidDialog"
        :visible.sync="isDeleteOrcidDialogVisible"
        @orcid-deleted="updateORCID"
      />
    </bf-stage>
  </bf-page>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import EventBus from '../../utils/event-bus'
import { pathOr, propOr, prop } from 'ramda'

import BfRafter from '../shared/bf-rafter/BfRafter.vue'
import BfButton from '../shared/bf-button/BfButton.vue'
import CreateTwoFactor from './windows/CreateTwoFactor.vue'
import DeleteTwoFactor from './windows/DeleteTwoFactor.vue'
import CreateApiKey from './windows/CreateApiKey.vue'
import DeleteApiKey from './windows/DeleteApiKey.vue'
import DeleteOrcid from './windows/DeleteOrcid.vue'
import ApiKeyDetail from './windows/ApiKeyDetail.vue'
import DegreeSelect from '@/components/shared/DegreeSelect/DegreeSelect.vue'

import Request from '../../mixins/request'
import Sorter from '../../mixins/sorter'

export default {
  name: 'MySettingsContainer',

  components: {
    BfRafter,
    BfButton,
    CreateTwoFactor,
    DegreeSelect,
    DeleteTwoFactor,
    CreateApiKey,
    DeleteApiKey,
    DeleteOrcid,
    ApiKeyDetail
  },

  mixins: [Request, Sorter],

  data() {
    return {
      apiKeys: [],
      isApiKeysLoading: true,
      ruleForm: {
        firstName: '',
        middleInitial: '',
        lastName: '',
        credential: '',
        degree: null
      },
      rules: {
        firstName: [
          {
            required: true,
            message: 'Please provide your first name',
            trigger: 'false'
          }
        ],
        lastName: [
          {
            required: true,
            message: 'Please provide your last name',
            trigger: 'false'
          }
        ]
      },
      oauthWindow: '',
      oauthCode: '',
      orcidInfo: {},
      loading: false,
      isDeleteOrcidDialogVisible: false
    }
  },

  computed: {
    ...mapState([
      'profile',
      'activeOrganization',
      'userToken',
      'config',
      'onboardingEvents'
    ]),

    ...mapGetters(['hasOrcidId']),

    hasAuthyId: function() {
      return this.profile && this.profile.authyId > 0
    },
    hasApiKeys: function() {
      return this.apiKeys.length > 0
    },
    getApiKeysUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const userToken = prop('userToken', this)

      if (!url || !userToken) {
        return ''
      }
      return `${url}/token?api_key=${userToken}`
    },
    updateProfileUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const userToken = prop('userToken', this)

      if (!url || !userToken) {
        return ''
      }

      return `${url}/user?api_key=${userToken}`
    },

    /**
     * Retrieves the API URL for adding ORCID
     */
    getORCIDApiUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)

      if (!url) {
        return ''
      }

      return `${url}/user/orcid?api_key=${this.userToken}`
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
    },

    /**
     * Retrieves Url to display with name once ORCID is connected to user profile
     */
    getORCIDResultUrl: function() {
      const env = pathOr('', ['config', 'environment'])(this)
      return env === 'dev'
        ? `https://sandbox.orcid.org/${this.profile.orcid.orcid}`
        : `https://orcid.org/${this.profile.orcid.orcid}`
    },

    resetPasswordUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const email = pathOr('', ['profile', 'email'])(this)
      const userToken = prop('userToken', this)

      if (!url || !email || !userToken) {
        return ''
      }
      return `${url}/account/${email}/reset?api_key=${userToken}`
    }
  },

  watch: {
    profile: function(profile) {
      this.setRuleFormData(profile)
    },
    getApiKeysUrl: function(url) {
      if (!url) {
        return
      }
      this.getApiKeys()
    },

  },

  mounted() {
    this.setRuleFormData(this.profile)
    this.getApiKeys()
    this.scrollToElement()
  },

  methods: {
    ...mapActions(['updateProfile']),
    /**
     * Scroll to element
     */
    scrollToElement: function() {
      const scrollTo = pathOr('', ['query', 'scrollTo'], this.$route)
      if (scrollTo && this.$el) {
        const scrollToEl = this.$el.querySelector(`#${scrollTo}`)
        if (scrollToEl) {
          scrollToEl.scrollIntoView()

          // Remove query
          this.$router.replace({ query: {} })
        }
      }
    },

    /**
     * Makes call to resort table by column
     * @param {String} key
     */
    sortColumn: function(key) {
      this.apiKeys = this.returnSort(key, this.apiKeys)
    },
    /**
     * Opens proper two factor dialog
     * @param {Boolean} hasAuthyId
     */
    handleTwoFactorBtnClick: function(hasAuthyId) {
      if (!hasAuthyId) {
        this.$refs.addTwoFactorDialog.dialogVisible = true
      } else {
        this.$refs.deleteTwoFactorDialog.dialogVisible = true
      }
    },
    /**
     * Update profile form data
     */
    setRuleFormData: function(profile) {
      if (!profile) {
        return
      }
      const { firstName, lastName, credential, degree, middleInitial } = profile

      this.ruleForm = {
        firstName,
        lastName,
        credential,
        degree,
        middleInitial
      }
    },
    /**
     * Validates user profile form
     */
    handleUpdateProfileSubmit: function() {
      this.$refs.updateProfileForm.validate(valid => {
        if (!valid) {
          return
        }

        this.submitUpdateProfileRequest()
      })
    },
    /**
     * Makes XHR call to update a user profile
     */
    submitUpdateProfileRequest: function() {
      this.sendXhr(this.updateProfileUrl, {
        method: 'PUT',
        body: {
          organization: this.profile.preferredOrganization,
          email: this.profile.email,
          url: this.profile.url,
          color: this.profile.color,
          ...this.ruleForm
        }
      })
        .then(this.handleUpdateProfileXhrSuccess.bind(this))
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Handles successful two factor xhr response
     * @param {Object} response
     */
    handleUpdateProfileXhrSuccess: function(response) {
      EventBus.$emit('toast', {
        detail: {
          type: 'success',
          msg: 'Profile Updated'
        }
      })
      this.updateProfile({
        ...this.profile,
        ...response
      })
    },
    /**
     * Makes XHR call to reset a user's password
     */
    submitResetPasswordRequest: function() {
      this.sendXhr(this.resetPasswordUrl, {
        method: 'POST'
      })
        .then(this.handleResetPasswordXhrSuccess.bind(this))
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Handles successful two factor xhr response
     */
    handleResetPasswordXhrSuccess: function() {
      EventBus.$emit('toast', {
        detail: {
          type: 'MESSAGE',
          msg: 'Password reset email sent'
        }
      })
      setTimeout(() => {
        this.logout()
      }, 1500)
    },
    /**
     * Fetches api keys for logged in user
     */
    getApiKeys: function() {
      if (!this.getApiKeysUrl) {
        return
      }

      this.sendXhr(this.getApiKeysUrl)
        .then(response => {
          this.apiKeys = this.returnSort('name', response)
          this.isApiKeysLoading = false
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Update API keys after CREATE & DELETE XHR calls
     * @param {Object} payload
     */
    updateApiKeys: function(payload) {
      const { apiKey, type } = payload
      const apiKeys = [...this.apiKeys]

      if (type === 'CREATED') {
        // render api key detail dialog
        this.openApiKeyWindow('apiKeyDetailDialog', apiKey)

        // add key to list
        apiKeys.push(payload.apiKey)

        // update keys list
        this.apiKeys = this.returnSort('name', apiKeys, this.sortDirection)
      } else if (type === 'DELETED') {
        const index = this.apiKeys.findIndex(item => item.key === apiKey.key)
        apiKeys.splice(index, 1)
        this.apiKeys = this.returnSort('name', apiKeys, this.sortDirection)
      }
    },

    /**
     * Function that's called after ORCID is deleted
     */
    updateORCID: function() {
      this.isDeleteOrcidDialogVisible = false
      this.updateProfile({
        ...this.profile,
        orcid: {}
      })
    },

    /**
     * Open api key dialog
     * @param {String} refName
     * @param {Object} apiKey
     */
    openApiKeyWindow: function(refName, apiKey = {}) {
      const dialog = this.$refs[refName]
      dialog.apiKey = apiKey
      dialog.apiKeys = this.apiKeys
      dialog.dialogVisible = true
    },
    /**
     * Logout the user
     */
    logout: function() {
      EventBus.$emit('logout')
    },

    /**
     * Logic to connect to user's ORCID
     */
    openORCID: function() {
      this.oauthWindow = window.open(this.getORCIDUrl, "_blank", "toolbar=no, scrollbars=yes, width=500, height=600, top=500, left=500");
      const self = this
      window.addEventListener('message', function(event) {
        this.oauthCode = event.data
        if (this.oauthCode !== '') {

          // @NOTE - Ignore this for now. Will delete once we verify that API works on dev
          // const response = {
          //   name: 'Nathan Vecchiarelli',
          //   orcid: '0000-0001-7257-2030'
          // }

           if (!self.getORCIDApiUrl) {
            return
          }

          self.sendXhr(self.getORCIDApiUrl, {
            method: 'POST',
            body: {
                "authorizationCode": this.oauthCode
              }
            })
            .then((response) => {
              // response logic goes here
              self.oauthInfo = response

              self.updateProfile({
                ...self.profile,
                orcid: self.oauthInfo
              })

              EventBus.$emit('toast', {
                detail: {
                  type: 'success',
                  msg: 'Your ORCID has been successfully added'
                }
              })
            })
            .catch(self.handleXhrError.bind(this))

        }
      })
    },

    /**
     * Opens deleteORCID modal
     * @param {String} refName
     */
    openORCIDWindow: function() {
      this.$refs.deleteOrcidDialog.dialogVisible = true
    }
  }
}
</script>

<style lang="scss">
@import '../../assets/_variables';

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

p {
  font-size: 13px;
}

.divider {
  background: $gray_2;
  height: 1px;
  margin: 19px 1px 20px 1px;
}

.two-factor-wrap {
  background: white;
  border: 1px solid #dadada;
  height: 48px;
  max-width: 560px;
}

.two-factor-status-wrap {
  margin: 12px 0 0 15px;

  .status-text {
    vertical-align: bottom;
  }

  .status-icon {
    color: red;

    &.enabled {
      color: green;
    }
  }
}

.two-factor-col-btn {
  flex: 1;
  margin-right: 6px;

  .bf-button {
    margin-top: 3px;
  }
}

.api-key-col-delete-btn {
  flex: 1;

  button {
    color: $gray_4;
    &:hover,
    &:focus {
      cursor: pointer;
      color: $purple_1;
    }
  }
}

.bf-table-row {
  .el-row {
    height: 40px;
  }
}

#connect-orcid-button {
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

#connect-orcid-button:hover {
  border: 1px solid #338caf;
  color: #338caf;
}

#orcid-id-icon {
  display: block;
  margin: 0 0.5em 0 0;
  padding: 0;
  float: left;
}

.orcid-success {
  border: solid 1px #dadada;
  padding: 10px;
  display: flex;
  flex-direction: row;
  background: #fff;

  .orcid-waiting {
    padding-top: 30px;
    padding-bottom: 20px;
    flex: 1;
  }

  .orcid-waiting {
    padding-top: 30px;
    padding-bottom: 20px;
    flex: 1;
  }

  .orcid-success-info {
    .orcid-success-text {
      margin-left: 10px;
      margin-top: 8px;
      margin-bottom: 0;

      a {
        margin-left: 3px;
      }
    }

    a {
      margin-left: 10px;
    }
  }

  img {
    width: 30px;
    height: 30px;
  }

  .orcid-delete-button {
    flex: 1;
    flex-direction: row-reverse;

    button {
      color: $gray_4;
      margin-top: 7px;
      &:hover,
      &:focus {
        cursor: pointer;
        color: $purple_1;
      }
    }
  }

  .el-row--flex.is-align-middle {
    flex: 25;
  }
}
#update-profile-form {
  .el-form-item__content {
  max-width: 330px;
  }
}
</style>
