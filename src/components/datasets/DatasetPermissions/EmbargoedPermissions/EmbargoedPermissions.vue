<template>
  <bf-page class="embargoed-permissions">
    <locked-banner
      slot="banner"
    />
    <bf-rafter
      slot="heading"
      title="Dataset Permissions"
    >
      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li>
          <router-link :to="{ name: 'dataset-permissions' }">
            Platform Permissions
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'embargoed-permissions' }">
            Embargoed Access
          </router-link>
        </li>
      </ul>
    </bf-rafter>
    <bf-stage
      element-loading-background="#fff"
    >
      <div v-if="getPermission('owner')">
        <div
          class="mb-64"

        >
          <h2>Embargoed Access</h2>
          <p>
            Give individuals in your organization access to embargoed data on Pennsieve Discover.
          </p>
          <div
            v-if="embargoedRequests.length === 0"
            class="embargoed-permissions__empty-state"
          >
            <p>
              There are no pending requests at this time.
            </p>
          </div>
          <embargoed-request-list
            v-for="request in embargoedRequests"
            :key="request.userId"
            :request="request"
            @accept-request="acceptRequest(request.userId)"
            @remove-request="rejectRequest(request)"
          />
        </div>
        <dataset-permissions-data-use-agreement />
      </div>
      <bf-empty-page-state
        v-else
        class="empty"
      >
        <img
          src="/static/images/illustrations/illo-collaboration.svg"
          height="240"
          width="247"
          alt="Teams illustration"
        >
        <div
          class="copy"
        >
          <h2>You don't have permission to manage embargoed access.</h2>
          <p>Only dataset owners can grant requests for early access to embargoed datasets.</p>
        </div>
      </bf-empty-page-state>

    </bf-stage>
  </bf-page>
</template>

<script>

import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue'
import BfPage from '@/components/layout/BfPage/BfPage.vue'
import BfStage from '@/components/layout/BfStage/BfStage.vue'
import BfRafter from '@/components/shared/bf-rafter/BfRafter.vue'
import LockedBanner from '@/components/datasets/LockedBanner/LockedBanner.vue'
import EmbargoedRequestList from '@/components/datasets/DatasetPermissions/EmbargoedRequestList/EmbargoedRequestList.vue'
import DatasetPermissionsDataUseAgreement from '@/components/datasets/DatasetPermissions/DatasetPermissionsDataUseAgreement/DatasetPermissionsDataUseAgreement.vue'
import { EmbargoedRequestStatus } from '@/utils/constants'
import Request from '@/mixins/request/index'
import { pathOr } from 'ramda'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'EmbargoedPermissions',

  components: {
    BfPage,
    BfStage,
    BfRafter,
    EmbargoedRequestList,
    LockedBanner,
    DatasetPermissionsDataUseAgreement,
    BfEmptyPageState
  },

   mixins: [Request],

  data() {
    return {
      embargoedRequests: [],
      EmbargoedRequestStatus
    }
  },

  computed: {
    ...mapState([
      'config',
      'userToken',
      'activeOrganization'
    ]),

    ...mapGetters([
      'getPermission'
    ]),

    /**
     * Embargoed requests url
     */
    embargoedRequestsUrl: function() {
      return `${this.config.apiUrl}/datasets/${this.$route.params.datasetId}/publication/preview?api_key=${this.userToken}`
    }
  },

    watch: {
      userToken: {
        handler: function(val) {
          if (val) {
            this.getEmbargoedRequests()
          }
        },
        immediate: true
      }
    },

  methods: {

    /**
     * Get list of embargoed requests
     */
    getEmbargoedRequests: function() {
      if (!this.embargoedRequestsUrl) {
        return
      }

      this.sendXhr(this.embargoedRequestsUrl).then(response => {
        this.embargoedRequests = response.map(resp => {
          const firstName = pathOr('', ['user', 'firstName'], resp)
          const lastName = pathOr('', ['user', 'lastName'], resp)
          const email = pathOr('', ['user', 'email'], resp)
          const userId = pathOr('', ['user', 'intId'], resp)

          return {
            userId,
            firstName,
            lastName,
            email,
            status: resp.embargoAccess
          }
        })
      }).catch(this.handleXhrError.bind(this))
    },

    /**
     * Accepts pending embargoed request
     * @param {String} userId
     */
    acceptRequest: function(userId) {
      if (!this.embargoedRequestsUrl) {
        return
      }

      this.sendXhr(this.embargoedRequestsUrl, {
        method: 'POST',
        body: {
          userId: userId
        }
      }).then(() => {
        this.embargoedRequests.map(request => {
          if (request.userId === userId) {
            request.status = EmbargoedRequestStatus.GRANTED
          }
          return request
        })
      }).catch(this.handleXhrError.bind(this))
    },

    /**
     * Rejects pending embargoed request
     * @param {Object} request
     */
    rejectRequest: function(request) {
      if (!this.embargoedRequestsUrl) {
        return
      }

      this.sendXhr(this.embargoedRequestsUrl, {
        method: 'DELETE',
        body: {
          userId: request.userId
        }
      }).then(() => {
        this.embargoedRequests = this.embargoedRequests.filter((req) => request.userId !== req.userId)
      })

    }
  },
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
.embargoed-permissions {
  background: $white;
  &__empty-state {
    border-top: solid 1px $gray_2;
    p {
      margin-top: 22px;
      font-size: 14px;
      color: $gray_4;
      font-style: italic;
      font-weight: 400;
      line-height: 16px;
    }
  }
  p {
    margin-bottom: 21px;
  }
}
</style>
