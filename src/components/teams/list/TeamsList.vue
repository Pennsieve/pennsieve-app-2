<template>
  <bf-page class="bf-teams-list">
    <bf-rafter
      slot="heading"
      title="Teams"
    >
      <div
        slot="buttons"
        class="buttons"
      >
        <bf-button
          v-if="hasAdminRights && !isEmpty"
          @click="openCreateDialog"
        >
          Create Team
        </bf-button>
      </div>
    </bf-rafter>

    <bf-stage
      slot="stage"
      v-loading="teamsLoading"
      element-loading-background="transparent"
    >
      <div
        v-if="!isEmpty"
        class="bf-table"
      >
        <div class="bf-table-header">
          <el-row
            type="flex"
            align="middle"
            :gutter="32"
          >
            <el-col
              :sm="17"
              class="team-col info"
            >
              <button
                :class="[isSorting('team.name') ? 'sort-active' : '']"
                @click="sortColumn('team.name')"
              >
                Name<svg-icon
                  class="sort-icon"
                  :name="sortIcon('team.name')"
                  color="currentColor"
                />
              </button>
            </el-col>
            <el-col
              :sm="17"
              class="team-col info"
            >
              <button
                :class="[isSorting('team.systemTeamType') ? 'sort-active' : '']"
                @click="sortColumn('team.systemTeamType')"
              >
                System Team<svg-icon
                  class="sort-icon"
                  :name="sortIcon('team.systemTeamType')"
                  color="currentColor"
                />
              </button>
            </el-col>
            <el-col
              :sm="7"
              class="team-col menu"
            />
          </el-row>
        </div>
        <div>
          <team
            v-for="team in teamsList"
            :key="team.id"
            class="bf-table-row"
            :item="team"
            :has-admin-rights="hasAdminRights"
          />
        </div>
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
          <h2>Create a Team</h2>
          <p>Teams make it easy to share datasets with groups within your organization.</p>
          <bf-button
            class="create-team-button"
            @click="openCreateDialog"
          >
            Create Team
          </bf-button>
        </div>
        <div
          v-if="!hasAdminRights"
          class="copy"
        >
          <h2>{{ orgName }} doesn't have any Teams yet.</h2>
          <p>Contact your administrator to get started working with Teams.</p>
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

import CreateEditTeam from '../windows/CreateEditTeam.vue'
import RemoveTeam from '../windows/RemoveTeam.vue'
import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'
import Team from '../team/Team.vue'

import Sorter from  '../../../mixins/sorter'
import UserRoles from  '../../../mixins/user-roles'

import { path, pathOr, propOr } from 'ramda'

export default {
  name: 'TeamsList',

  components: {
    BfEmptyPageState,
    CreateEditTeam,
    RemoveTeam,
    BfRafter,
    BfButton,
    Team,
  },

  mixins: [
    Sorter,
    UserRoles,
  ],

  data() {
    return {
      teamsList: []
    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'userToken',
      'config',
    ]),
    ...mapState([
      'teamsLoading',
      'teams'
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
    teams: {
      handler: function(teams) {
        if (teams) {
          this.getTeams()
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions([
      'updateTeams'
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

.team-col {
  color: #71747C;
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

  .create-team-button {
    height: 40px;
    width: 137px;
  }
}
</style>
