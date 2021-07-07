<template>
  <bf-page class="integrations-list">
    <bf-rafter
      slot="heading"
      title="Integrations"
    >
      <div
        slot="description"
        class="description"
      >
        <p >
          Integrations allow external services to be notified when certain events occur on Pennsieve.
        </p>
      </div>
      <div
        slot="buttons"
        class="buttons"
      >
        <bf-button
          v-if="hasAdminRights && !isEmpty"
          @click="openCreateDialog"
        >
          Add Global Integration
        </bf-button>
      </div>
    </bf-rafter>

    <bf-stage
      slot="stage"
      v-loading="integrationsLoading"
      element-loading-background="transparent"
    >
      <div
        v-if="integrations.length > 0"
        class="integration-list"
      >
        <integration-list-item
          v-for="integration in integrations"
          :key="integration.id"
          :integration="integration"
        />
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
          v-if="hasAdminRights"
          class="copy"
        >
          <h2>There are no integrations yet</h2>
          <p>Integrations allow external services to be notified when certain events occur on Pennsieve. These integrations are available to all members within the organization and can be managed at the dataset level under settings.</p>
          <bf-button
            class="create-team-button"
            @click="openCreateDialog"
          >
            Add Global Integration
          </bf-button>
        </div>
        <div
          v-if="!hasAdminRights"
          class="copy"
        >
          <h2>{{ orgName }} doesn't have any integrastions yet.</h2>
          <p>Contact your administrator to get started working with Integrations.</p>
        </div>
      </bf-empty-page-state>

      <create-edit-team
        ref="createEditTeam"
        @team-created="onTeamCreated"
      />

      <remove-team
        ref="removeTeam"
        @team-removed="onTeamRemoved"
      />
    </bf-stage>
  </bf-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'

import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'

import IntegrationListItem from "../integration-list-item/IntegrationListItem";
import Sorter from  '../../../mixins/sorter'
import UserRoles from  '../../../mixins/user-roles'


import { path, pathOr, propOr } from 'ramda'

export default {
  name: 'IntegrationsList',

  components: {
    BfEmptyPageState,
    BfRafter,
    BfButton,
    IntegrationListItem
  },

  mixins: [
    Sorter,
    UserRoles,
  ],

  props: {
    integrations: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'userToken',
      'config',
      'hasFeature'
    ]),
    ...mapState([
    ]),
    hasAdminRights: function() {
      if (this.activeOrganization) {
        const isAdmin = propOr(false, 'isAdmin', this.activeOrganization)
        const isOwner = propOr(false, 'isOwner', this.activeOrganization)
        return isAdmin || isOwner
      }
    },
    isEmpty: function() {
      return !this.teamsLoading && this.teams && this.teams.length === 0
    },
    orgName: function() {
      return pathOr('', ['organization', 'name'], this.activeOrganization)
    }
  },

  watch: {

  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
     if (vm.hasFeature('sandbox_org_feature')) {
      vm.$router.push({name: 'create-org'})
    }
    })
  },

  methods: {
    ...mapActions([
    ]),
    /**
     * Handles team-removed event
     * @param {Object} teamObj
     */
    onTeamRemoved: function(teamObj) {
      const teamId = path(['team', 'id'], teamObj)
      if (!teamId) {
        return
      }
      const updatedTeams = this.teamsList.filter(t => t.team.id !== teamId)
      this.updateTeams(updatedTeams)
      this.teamsList = updatedTeams
    },
    /**
     * Handles team-created event
     * @param {Object} teamObj
     */
    onTeamCreated: function(teamObj) {
      const teamId = path(['team', 'id'], teamObj)
      const hasTeam = this.teamsList.filter(t => t.team.id === teamId)
      if (hasTeam.length > 0) {
        return
      }
      this.teamsList.push(teamObj)
      const sortedTeams = this.returnSort('team.name', this.teamsList, this.sortDirection)
      this.updateTeams(sortedTeams)
      this.teamsList = sortedTeams
    },
    /**
     * Sorts teams from vuex
     */
    getTeams: function() {
      this.teamsList = this.returnSort('team.name', this.teams, 'asc')
    },
    /**
     * Makes call to resort table by column
     * @param {String} key
     */
    sortColumn: function(key) {
      this.teamsList = this.returnSort(key, this.teams)
    },
    /**
     * Opens dialog to create
     */
    openCreateDialog: function() {
      this.$refs.createEditTeam.dialogVisible = true
    },
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/variables';

.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 85px 190px;
}

.integration-list {
  display: flex;
  flex-direction: column;
}

.copy {
  h2 {
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
  }

  p {
    color: #71747C;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    margin-bottom: 16px;
  }

}
</style>
