<template>
  <bf-page class="content-wrapper">
    <bf-rafter
      slot="heading"
      :title="teamName"
    >
      <div slot="breadcrumb">
        <router-link :to="{ name: 'teams-list' }">
          All Teams
        </router-link>
      </div>
      <div slot="buttons">
        <div
          v-if="hasAdminRights"
          class="buttons"
        >
          <bf-button
            class="primary"
            @click="openAddUser"
          >
            Add User
          </bf-button>
          <el-dropdown
            trigger="click"
            @command="handleCommand"
          >
            <bf-button class="secondary icon el-dropdown-link">
              <svg-icon icon="icon-menu" />
            </bf-button>
            <el-dropdown-menu
              slot="dropdown"
              class="bf-menu"
            >
              <el-dropdown-item
                command="edit"
                class="bf-menu-item"
              >
                Update Team
              </el-dropdown-item>
              <el-dropdown-item
                v-if="!isSystemTeam"
                command="delete"
                class="bf-menu-item"
              >
                Delete Team
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </bf-rafter>

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >
      <div class="pagination-header mb-16">
        <pagination-page-menu
          class="mr-24"
          pagination-item-label="Results"
          :page-size="limit"
          @update-page-size="onUpdateLimit"
        />
        <el-pagination
          :page-size="limit"
          :pager-count="5"
          :current-page="offset / limit + 1"
          layout="prev, pager, next"
          :total="allMembers.length"
          @current-change="onPaginationPageChange"
        />
      </div>
      <div
        v-if="!isEmpty"
        class="bf-table"
      >
        <div class="bf-table-header">
          <el-row :gutter="32">
            <el-col
              :sm="17"
              class="team-col info"
            >
              <button
                :class="[isSorting('lastName') ? 'sort-active' : '']"
                @click="sortColumn('lastName')"
              >
                Name<svg-icon
                  class="sort-icon"
                  :name="sortIcon('lastName')"
                  color="currentColor"
                />
              </button>
            </el-col>
            <el-col
              :sm="7"
              class="menu"
            />
          </el-row>
        </div>
        <team-member
          v-for="member in members"
          :key="member.id"
          class="bf-table-row"
          :item="member"
          :has-admin-rights="hasAdminRights"
        />
      </div>

      <bf-empty-page-state
        v-if="isEmpty"
        class="team-wrap empty"
      >
        <img
          src="/static/images/illustrations/illo-collaboration.svg"
          height="240"
          width="247"
          alt="Team members illustration"
        >
        <div
          v-if="hasAdminRights"
          class="copy"
        >
          <h2>It's Lonely in here</h2>
          <p>Add anyone from your organization to this team.</p>
        </div>
        <div
          v-if="!hasAdminRights"
          class="copy"
        >
          <h2>{{ teamName }} doesn't have any Members yet.</h2>
        </div>
      </bf-empty-page-state>

      <add-team-members
        :team="team"
        :members="members"
        @members-added-to-team="onMembersAddedToTeam"
      />

      <remove-collaborator
        :team="team"
        @team-member-removed="onTeamMemberRemoved"
      />

      <create-edit-team
        :team="team"
        @team-updated="onTeamUpdated"
      />

      <remove-team />
    </bf-stage>
  </bf-page>
</template>

<script>
  import { mapActions, mapGetters, mapState } from 'vuex';

import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import AddTeamMembers from  '../windows/AddTeamMembers.vue'
import RemoveTeam from  '../windows/RemoveTeam.vue'
import CreateEditTeam from  '../windows/CreateEditTeam.vue'
import RemoveCollaborator from '../windows/RemoveCollaborator.vue'
import TeamMember from './TeamMember.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'

import Sorter from  '../../../mixins/sorter'
import UserRoles from  '../../../mixins/user-roles'
import Request from  '../../../mixins/request'
import EventBus from '../../../utils/event-bus'
import { pathOr, propOr, findIndex, pathEq } from 'ramda'
import PaginationPageMenu from '../../shared/PaginationPageMenu/PaginationPageMenu'

export default {
  name: 'TeamMembersList',

  components: {
    BfRafter,
    BfButton,
    TeamMember,
    RemoveTeam,
    CreateEditTeam,
    RemoveCollaborator,
    AddTeamMembers,
    BfEmptyPageState,
    PaginationPageMenu
  },

  mixins: [
    Sorter,
    UserRoles,
    Request
  ],

  data() {
    return {
      dialogVisible: false,
      allMembers: [],
      offset: 0,
      limit: 25,
      team: {}
    }
  },

  computed: {
    ...mapState([
      'publishers'
    ]),
    ...mapGetters([
      'activeOrganization',
      'userToken',
      'config',
      'teams',
      'publisherTeam'
    ]),
    hasAdminRights: function() {
      if (this.activeOrganization) {
        const isAdmin = propOr(false, 'isAdmin', this.activeOrganization)
        const isOwner = propOr(false, 'isOwner', this.activeOrganization)
        return isAdmin || isOwner
      }
    },
    isEmpty: function() {
      return !this.isLoading && this.allMembers.length === 0
    },
    teamName: function() {
      return pathOr('', ['team', 'name'], this.team)
    },
    isSystemTeam: function() {
      return this.team && this.team.team && !!this.team.team.systemTeamType
    },
    /**
     * the displayed subset of allMembers based on which page in the paginated list we are on
     * @returns {Array}
     */
    members: function() {
      return this.allMembers.slice(this.offset, this.offset + this.limit)
    }
  },

  watch: {
    activeOrganization: {
      handler: function() {
        this.getTeam()
        this.getTeamMembers()
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions([
      'updatePublishers',
    ]),
    /**
     * Updates teams in vuex
     */
    updateTeamState: function(team) {
      const teamId = pathOr(0, ['team', 'id'], team)
      const idx = findIndex(pathEq(['team', 'id'], teamId), this.teams)
      this.teams.splice(idx, 1, team)
    },
    /**
     * Handles team-updated event
     * @param {Object} team
     */
    onTeamUpdated: function(team) {
      this.team = team
      this.updateTeamState(team)
    },
    /**
     * Handles members-added-to-team event
     * @param {Array} newMembers
     */
    onMembersAddedToTeam: function(newMembers) {
      const allMembers = this.allMembers.concat(newMembers)
      const updatedList = this.returnSort('lastName', allMembers, this.sortDirection)
      this.allMembers = updatedList
      this.team.memberCount = allMembers.length
      this.updateTeamState(this.team)
      if (this.team.team.id === this.publisherTeam.id) {
        this.updatePublishers([...this.publishers, ...newMembers])
      }
    },
    /**
     * Handles dropdown menu selections
     * @param {String} memberId
     */
    handleCommand: function(command) {
      const commands = {
        'delete': this.openDeleteTeam,
        'edit': this.openEditTeam
      }
      if (typeof commands[command] === 'function') {
        commands[command]()
      }
    },
    /**
     * Handles team-member-removed event
     * @param {Object} member
     */
    onTeamMemberRemoved: function(member) {
      this.allMembers = this.allMembers.filter(mem => mem.id !== member.id)
      this.team.memberCount = this.team.memberCount - 1
      this.updateTeamState(this.team)
      if (this.team.team.id === this.publisherTeam.id) {
        this.updatePublishers(this.publishers.filter(p => p.id !== member.id))
      }
    },
    /**
     * Creates team url
     */
    getTeamUrl: function() {
      if (!this.activeOrganization.organization || !this.userToken) {
        return
      }
      const teamId = this.$route.params.id
      return `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}/teams/${teamId}?api_key=${this.userToken}`
    },
    /**
     * Creates teams url
     */
    getTeamMembersUrl: function() {
      if (!this.activeOrganization.organization || !this.userToken) {
        return
      }
      const teamId = this.$route.params.id
      return `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}/teams/${teamId}/members?api_key=${this.userToken}`
    },
    /**
     * Makes XHR call to get team data
     */
    getTeam: function() {
      const url = this.getTeamUrl()
      if (!url) {
        return
      }
      this.sendXhr(url)
        .then(team => {
          this.team = team
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Makes XHR call to get teams for current organization
     */
    getTeamMembers: function() {
      const url = this.getTeamMembersUrl()
      if (!url || this.allMembers.length > 0) {
        return
      }
      this.sendXhr(url)
        .then(members => {
          return this.allMembers = this.returnSort('lastName', members, 'asc')
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Makes call to resort table by column
     * @param {String} key
     */
    sortColumn: function(key) {
      this.offset = 0
      this.allMembers = this.returnSort(key, this.allMembers)
    },
    /**
     * Opens confirmation dialog to delete a team
     */
    openDeleteTeam: function() {
      EventBus.$emit('open-remove-team', this.team)
    },
    /**
     * Opens edit dialog for a team
     */
    openEditTeam: function() {
      EventBus.$emit('open-edit-team', this.team)
    },
    /**
     * Opens add user modal
     */
    openAddUser: function() {
      EventBus.$emit('open-add-team-members')
    },

    /**
     * handle changing the page of results
     * @param {Number} page
     */
    onPaginationPageChange: function(page) {
      this.offset = (page - 1) * this.limit
    },

    /**
     * handle changing the results per page
     * @param {Number} limit
     */
    onUpdateLimit: function(limit) {
      this.offset = 0
      this.limit = limit
    }
  }
}
</script>

<style lang="scss">
.team-wrap {
  margin-top: 40px;

  &.empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border: dashed 2px #DADADA;
    border-radius: 2px;
    padding-bottom: 92px;
    padding-top: 92px !important;
    max-width: none !important;
    min-width: 720px;
  }
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
  }
}

.pagination-header {
  display: flex;
  justify-content: space-between
}
</style>
