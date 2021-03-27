<template>
  <div class="terms-of-service">
    <div class="container">
      <h2 class="sharp-sans">
        Terms of Service
      </h2>
      <p>{{ description }}</p>
      <div v-if="!hasCustomTerms">
        <div
          class="agreement-wrap terms"
          v-html="$sanitize(termsOfService, ['p', 'a', 'strong', 'title'])"
        />
      </div>
      <div v-else>
        <div
          class="agreement-wrap terms"
          v-html="$sanitize(customTerms, ['div', 'p', 'a', 'strong'])"
        />
      </div>
      <div class="row input-section">
        <div class="input-col">
          <el-checkbox
            id="confirmation"
            v-model="checked"
          >
            I accept the
            <a
              href="https://www.blackfynn.com/legal/terms"
              target="_blank"
            >
              Terms of Service
            </a>
            and
            <a
              href="https://www.blackfynn.com/legal/privacy/"
              target="_blank"
            >
              Privacy Policy
            </a>
          </el-checkbox>
        </div>
      </div>
      <bf-button
        class="accept-button"
        :processing="isLoading"
        :disabled="!canUserSubmit"
        @click="accept"
      >
        Accept &amp; Continue
      </bf-button>

      <button
        class="decline-button"
        @click="decline"
      >
        Decline &amp; Sign Out
      </button>
    </div>
  </div>
</template>

<script>
import {
  mapActions,
  mapState
} from 'vuex'
import {
  propOr,
  path,
  pathOr
} from 'ramda'

import Request from '@/mixins/request'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

import EventBus from '@/utils/event-bus'

export default {
  name: 'TermsOfService',

  components: {
    BfButton,
  },

  mixins: [
    Request
  ],

  data() {
    return {
      isLoading: false,
      checked: false,
      loadingTermsError: false,
      canUserSubmit: false,
      customTerms: '',
      termsOfService: ''
    }
  },

  computed: {
    ...mapState([
      'config',
      'bfTermsOfServiceVersion',
      'activeOrganization',
      'userToken',
      'onboardingEvents'
    ]),

    /**
     * Compute accept agreement URL based off of custom terms state
    **/
    acceptAgreementUrl: function() {
      const apiUrl = propOr('', 'apiUrl', this.config)
      return this.hasCustomTerms ? `${apiUrl}/user/custom-terms-of-service` :
      `${apiUrl}/user/pennsieve-terms-of-service`
    },

    /**
    * Compute description
    * **/
    description: function() {
      const activeOrgName = propOr('', ['name'], this.activeOrganization)
      const orgName = this.hasCustomTerms ? activeOrgName : 'Pennsieve'
      return `You must read and accept the ${orgName} Terms of Use before you continue.`
    },

     /**
       * Compute if organization has custom terms
      **/
    hasCustomTerms: function() {
      return Boolean(pathOr('', ['organization', 'customTermsOfService', 'version'], this.activeOrganization))
    },

     /**
      * Compute custom terms url
      **/
    customTermsUrl: function() {
      if (this.hasCustomTerms){
        const apiUrl = propOr('', 'apiUrl', this.config)
        const activeOrgId = pathOr('', ['organization', 'id'], this.activeOrganization)
        return `${apiUrl}/organizations/${activeOrgId}/custom-terms-of-service`
      }

      return ''
    }
  },

  watch: {
    /**
     * Watcher for checkbox
     */
    checked: {
      handler: function(val) {
        if (val) {
          this.canUserSubmit = true
        } else {
          this.canUserSubmit = false
        }
      },
      immediate: true
    },
    /**
     * Watcher for customTermsUrl
     */
    customTermsUrl: {
      handler: function(val) {
        if (val) {
          const url = `${this.customTermsUrl}?api_key=${this.userToken}`
          fetch(url, {
            headers: {
              'Content-Type': 'text/html'
            }
          })
          .then(response => response.text())
          .then(response => {
            this.customTerms = response
          })
          .catch(this.handleXhrError.bind(this))
        }
      },
      immediate: true
    }
  },

  mounted () {
    this.getTermsOfService()
  },

  methods: {
    ...mapActions([
      'updateProfile'
    ]),

    /**
     * Gets Terms of Service
     */
    getTermsOfService: function() {
      fetch('/static/files/tos.html')
        .then(response => response.text())
        .then(text => {
          this.termsOfService = text
        })


    },

    /**
      * User accepts subscription agreement
    */
    accept: function() {
      this.isLoading = true
      let version = this.bfTermsOfServiceVersion
      if (this.hasCustomTerms) {
        version = path(['organization', 'customTermsOfService', 'version'], this.activeOrganization)
      }

      this.sendXhr(this.acceptAgreementUrl, {
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${this.userToken}`
        },
        body: {
          version
        }
      })
      .then(this.onAcceptAgreement.bind(this))
      .catch(this.handleXhrError.bind(this))
    },

    /**
      * User declines subscription agreement and gets logged out
    */
    decline: function(){
      EventBus.$emit('logout')
    },

    /**
      * Accept agreement response
      * @param {Object} e - Event object
      * @param {Object} detail - xhr response
    */
    onAcceptAgreement: function(response) {
      this.isLoading = false
      if (this.loadingTermsError) {
        return;
      }

      this.updateProfile(response)

      // Send user to next route depending on if it is the org owner
      const isOwner = pathOr(false, ['isOwner'], this.activeOrganization)
      const isFirstTimeSignOn = Boolean(this.onboardingEvents.length === 0)
      if (isOwner && isFirstTimeSignOn) {
        this.$router.push({
          name: 'invite-people'
        })
      } else {
        const orgId = pathOr('', ['organization', 'id'], this.activeOrganization)
        EventBus.$emit('set-default-route', orgId)
      }
    }
  },

}
</script>

<style scoped lang="scss">
@import '../../assets/_variables.scss';

.terms-of-service {
  background: $white-matter;
  display: block;
  color: $glial;
  min-height: 100vh;

  .container {
    margin: 0 auto;
    max-width: 560px;
    padding-bottom: 20px;
    padding-top: 130px;
    text-align: center;
  }

   .agreement-wrap {
      border: 1px solid $cortex;
      color: #000;
      font-size: 14px;
      line-height: 21px;
      margin-bottom: 20px;
      width: 540px;
      height: 300px;
      overflow-y: scroll;
      text-align: left;
    }
    .agreement-wrap h3 {
      font-size: 18px;
      font-weight: 700;
    }

    .sharp-sans {
      font: 700 24px/31px SharpSans,sans-serif;
    }

    h2 {
      margin: 0 0 10px;
    }

    p {
      margin: 10px 0 28px;
    }

    a {
      text-decoration: underline;
    }

    .agreement-wrap p:last-of-type {
      margin-bottom: 0;
    }

    .decline-button {
      margin: 0 10px;
      min-width: 160px;
      background: #fff;
      border: 1px solid #bdbdbd;
      border-radius: 5px;
      color: #71747C;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      padding: 9px 30px;
      text-transform: none;

      &:hover {
        background: none;
        box-shadow: none;
      }

      &:active {
        background: none;
        box-shadow: none;
      }
    }

    .accept-button {
      background: #2760FF;
      border-color: #2760FF;
      color: #fff;
      margin: 0 10px;
      padding: 9px 30px;
      min-width: 160px;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      border-radius: 5px;
      text-transform: none;
    }

    .accept-button[disabled] {
      background: #DADADA;
      border-color: #DADADA;
      color: #71747C;
      margin: 0 10px;
      min-width: 160px;
    }

    .row {
      box-sizing: border-box;
      display: flex;
      flex: 0 1 auto;
      flex-direction: row;
      flex-wrap: wrap;
      margin-right: calc((1.428571429rem * 0.5) * -1);
      margin-left: calc((1.428571429rem * 0.5) * -1);
    }

    .input-col {
      flex-basis: 100%;
      max-width: 41%;
    }

    .input-section {
      margin-bottom: 24px;
    }

    #confirmation {
      display: inline-block;
      cursor: pointer;
      margin-bottom: 0;
      height: 14px;
      width: 14px;
    }

    .terms {
      padding: 10px;
      padding-bottom: 0px;
      line-height: 1.35em;
      font-size: 14px;
    }



}
</style>
