<template>
  <el-dialog
    class="add-member-dialog"
    :visible.sync="dialogVisible"
    :show-close="false"
    @open="onOpen('userSearchForm')"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Add Collaborators"
    />

    <dialog-body>
      <div class="team-name-wrapper">
        <svg-icon
          icon="icon-collaborators"
          class="collaborators-icon"
          height="20"
          width="20"
          color="currentColor"
        />
        <div class="team-name">
          Adding to <strong>{{ datasetName }}</strong>
        </div>
      </div>
      <el-form
        ref="userSearchForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="addToDataset('userSearchForm')"
      >
        <el-input
          v-model="ruleForm.searchText"
          placeholder="Find by name, email address, or team name..."
          @input="filterOptions"
          @focus="toggleOptions(true)"
        >
          <div
            slot="prefix"
            class="search-icon-wrapper"
          >
            <svg-icon
              icon="icon-magnifying-glass"
              class="search-icon"
              height="24"
              width="24"
            />
          </div>
        </el-input>
      </el-form>
      <el-popover
        id="autocompletePopover"
        ref="popover"
        popper-class="autocomplete"
        placement="bottom"
        trigger="manual"
        transition=""
        :visible-arrow="false"
      >
        <h4 v-if="searchTextExists">
          Can't find '{{ ruleForm.searchText }}'
        </h4>
        <h4 v-if="filteredMembers.length > 0">
          People
        </h4>
        <ul>
          <li
            v-for="member in filteredMembers"
            :key="member.id"
            class="filtered-member"
            @click="selectMember(member)"
          >
            <div class="name">
              <span v-html="highlight(ruleForm.searchText, fullName(member))" />
            </div>
            <div class="email">
              <span v-html="highlight(ruleForm.searchText, member.email)" />
            </div>
          </li>
        </ul>
        <h4 v-if="filteredTeams.length > 0">
          Teams
        </h4>
        <ul>
          <li
            v-for="team in filteredTeams"
            :key="team.team.id"
            class="filtered-member"
            @click="selectTeam(team)"
          >
            <div class="name">
              <span v-html="highlight(ruleForm.searchText, team.team.name)" />
            </div>
          </li>
        </ul>
      </el-popover>
      <div
        v-if="!isEmpty"
        class="org-members"
      >
        <team-member
          v-for="member in selectedMembers"
          :key="member.id"
          :item="member"
          :remove-from-list="true"
          @remove-member-from-list="onRemoveMemberFromList"
        />
        <team
          v-for="team in selectedTeams"
          :key="team.team.id"
          :item="team"
          :remove-from-list="true"
          @remove-team-from-list="onRemoveTeamFromList"
        />
      </div>
      <bf-empty-page-state v-if="isEmpty">
        <div class="empty">
          <svg-icon
            icon="icon-datasets"
            class="datasets-icon"
            height="32"
            width="32"
          />
          <div class="empty-msg">
            Share your data set with anyone in your organization.
          </div>
        </div>
      </bf-empty-page-state>
    </dialog-body>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        class="primary"
        :disabled="isEmpty"
        @click="addToDataset('userSearchForm')"
      >
        Add to Dataset
      </bf-button>
    </span>
  </el-dialog>
</template>



<script>
import { mapGetters, mapActions } from 'vuex'

import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import TeamMember from '../../../teams/members/TeamMember.vue'
import Team from '../../../teams/team/Team.vue'
import BfEmptyPageState from '../../../shared/bf-empty-page-state/BfEmptyPageState.vue'

import HighlightText from '../../../../mixins/highlight-text'
import Request from  '../../../../mixins/request'
import Sorter from  '../../../../mixins/sorter'
import EventBus from '../../../../utils/event-bus'
import addPropsToTeams from '../../../../utils/addPropsToTeams'
import { findParentById } from '../../../../utils/findParentById'
import { path, pathOr, propOr, prop, find, propEq, pathEq } from 'ramda'

export default {
  name: 'AddCollaborators',

  components: {
    DialogBody,
    BfDialogHeader,
    BfButton,
    TeamMember,
    Team,
    BfEmptyPageState
  },

  mixins: [
    Sorter,
    Request,
    HighlightText
  ],

  props: {
    collaborators: {
      type: Array,
      default: []
    }
  },

  data() {
    /* istanbul ignore next */
    const checkSelectedMembers = (rule, value, callback) => {
      if (this.selectedMembers.length === 0) {
        return callback('At least one collaborator is required')
      }
      return callback()
    }
    return {
      dialogVisible: false,
      selectedMembers: [],
      filteredMembers: [],
      origMembers: [],
      selectedTeams: [],
      filteredTeams: [],
      origTeams: [],
      ruleForm: {
        searchText: ''
      },
      rules: {
        searchText: [
          { validator: checkSelectedMembers, trigger: 'false' },
        ],
      }
    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'profile',
      'userToken',
      'config',
      'orgMembers',
      'dataset',
      'teams'
    ]),
    datasetName: function() {
      return pathOr('', ['content', 'name'], this.dataset)
    },
    isEmpty: function() {
      return this.selectedMembers.length === 0 && this.selectedTeams.length === 0
    },
    searchTextExists: function(){
      return this.filteredMembers.length === 0 && this.filteredTeams.length === 0
    }
  },
  mounted() {
    this.$el.addEventListener('click', this.handleFieldClick.bind(this))
  },

  destroy() {
    this.$el.removeEventListener('click', this.handleFieldClick.bind(this))
  },

  methods: {
    ...mapActions([
      'updateDataset'
    ]),
    /**
     * Builds the user's full name
     * @param {Object} member
     */
    fullName: function(member) {
      const firstName = propOr('', 'firstName', member)
      const lastName = propOr('', 'lastName', member)
      return `${firstName} ${lastName}`
    },
    /**
     * Handles click within the field
     * @param {Object} evt
     */
    handleFieldClick: function(evt) {
      if (!this.$refs.popover.showPopper) {
        return
      }
      const targ = evt.target.tagName.toLowerCase()
      const visibility = (targ === 'input') ? true : findParentById(evt.target, 'autocompletePopover')
      this.toggleOptions(visibility)
    },
    /**
     * Creates DELETE url to remove all collaborators from dataset
     */
    deleteUrl: function() {
      const datasetId = path(['content', 'id'], this.dataset)
      if (!this.userToken || !datasetId) {
        return
      }
      return `${this.config.apiUrl}/datasets/${datasetId}/collaborators?api_key=${this.userToken}`
    },
    /**
     * Makes XHR call to remove organization collaborators from dataset
     */
    removeOrgCollaborators: function() {
      const url = this.deleteUrl()
      const orgId = path(['organization', 'id'], this.activeOrganization)
      if (!url || !orgId) {
        return Promise.reject(new Error('No url or org id!'))
      }
      return this.sendXhr(url, {
        method: 'DELETE',
        body: [orgId]
      })
      .then(() => {
        this.$emit('update-dataset-sharing', 0)
        return Promise.resolve()
      })
    },
    /**
     * Add users to dataset
     */
    addToDataset: function(formName) {
      this.$refs[formName]
        .validate((valid) => {
          if (!valid) {
            return
          }
          this.removeOrgCollaborators()
            .then(this.addToDatasetRequest.bind(this))
            .catch(this.handleXhrError.bind(this))
        })
    },
    /**
     * Creates the add to dataset url
     */
    addToDatasetUrl: function() {
      const datasetId = path(['content', 'id'], this.dataset)
      if (!this.userToken || !datasetId) {
        return
      }
      return `${this.config.apiUrl}/datasets/${datasetId}/collaborators?api_key=${this.userToken}`
    },
    /**
     * Makes XHR call to add members to dataset
     */
    addToDatasetRequest: function() {
      const memberIds = this.selectedMembers.map(prop('id')).filter(Boolean)
      const teamIds = this.selectedTeams.map(path(['team', 'id'])).filter(Boolean)
      if (memberIds.length === 0 && teamIds.length === 0) {
        return
      }
      const url = this.addToDatasetUrl()
      if (!url) {
        return
      }
      const ids = memberIds.concat(teamIds)
      // DELETE ORG FIRST

      this.sendXhr(url, {
        method: 'PUT',
        body: ids
      })
        .then(resp => {
          const allTeams = addPropsToTeams(this.selectedTeams)
          // add properties to teams to they can be sorted correctly in the list page
          const updatedCollaborators = allTeams.concat(this.selectedMembers)
          const newCollaborators = {
            collaboratorCounts: {
              'organizations': 0,
              'teams': pathOr(0, ['counts', 'teams'], resp),
              'users': pathOr(0, ['counts', 'users'], resp)
            }
          }
          const updatedDataset = Object.assign({}, this.dataset, newCollaborators)
          this.updateDataset(updatedDataset)
            .then(_ => {
              this.$emit('collaborators-added-to-dataset', updatedCollaborators)
              EventBus.$emit('toast', {
                detail: {
                  msg: `Collaborator(s) added to ${this.datasetName}`
                }
              })
            })
          this.closeDialog()
        })
    },
    /**
     * Selects member to add to dataset
     * @param {Object} member
     */
    selectMember: function(member) {
      this.selectedMembers.push(member)
      this.filteredMembers = this.filteredMembers.filter(fm => fm.id !== member.id)
      this.toggleOptions()
    },
    /**
     * Selects team to add to dataset
     * @param {Object} team
     */
    selectTeam: function(team) {
      this.selectedTeams.push(team)
      this.filteredTeams = this.filteredTeams.filter(fm => fm.team.id !== team.team.id)
      this.toggleOptions()
    },
    /**
     * Toggles filtered members autocomplete list
     * @param {Boolean} bool
     */
    toggleOptions: function(bool) {
      this.$refs.popover.showPopper = bool
      this.ruleForm.searchText = ''
    },
    /**
     * Removes a team member from filtered list
     * @param {Object} member
     */
    onRemoveMemberFromList: function(member) {
      this.selectedMembers = this.selectedMembers.filter(mem => mem.id !== member.id)
    },
    /**
     * Removes a team from filtered list
     * @param {Object} team
     */
    onRemoveTeamFromList: function(team) {
      this.selectedTeams = this.selectedTeams.filter(t => t.team.id !== team.team.id)
    },
    /**
     * Filters members and teams based on searchText
     */
    filterOptions: function() {
      this.filterMembers()
      this.filterTeams()
    },
    /**
     * Filters org members based on searchText
     */
    filterMembers: function() {
      const searchText = this.ruleForm.searchText.toLowerCase()
      const list = this.origMembers.filter(member => {
        const selectedMember = find(propEq('id', member.id), this.selectedMembers)
        return !selectedMember
      })
      const filteredList = list.filter(mem => {
        const name = `${mem.firstName} ${mem.lastName}`.toLowerCase()
        const email = mem.email.toLowerCase()
        return name.indexOf(searchText) >= 0 || email.indexOf(searchText) >= 0
      })
      this.filteredMembers = filteredList.length > 0 ? filteredList : []
    },
    /**
     * Filters teams based on searchText
     */
    filterTeams: function() {
      const searchText = this.ruleForm.searchText.toLowerCase()
      const list = this.origTeams.filter(team => {
        const selectedTeam = find(pathEq(['team', 'id'], team.team.id), this.selectedTeams)
        return !selectedTeam
      })
      const filteredTeamList = list.filter(team => {
        const name = pathOr('', ['team', 'name'], team)
        return name.toLowerCase().indexOf(searchText) >= 0
      })
      this.filteredTeams = filteredTeamList.length > 0 ? filteredTeamList : []
    },
    /**
     * Handles open-add-team-members event
     * @param {String} formName
     */
    onOpen: function(formName) {
      this.resetForm(formName)
      if (this.filteredMembers.length === 0) {
        this.getMembers()
      }
      if (this.filteredTeams.length === 0) {
        this.getTeams()
      }
    },
    /**
     * Gets all members for org
     */
    getMembers: function() {
      const originalList = this.orgMembers.filter(orig => {
        const existingMember = find(propEq('id', orig.id), this.collaborators)
        return !existingMember
      })
      this.origMembers = this.returnSort('lastName', originalList)
      this.filteredMembers = this.origMembers
    },
    /**
     * Gets all teams within an org
     */
    getTeams: function() {
      const originalList = this.teams.filter(orig => {
        const teamId = path(['team', 'id'], orig)
        const existingTeam = find(pathEq(['team', 'id'], teamId), this.collaborators)
        return !existingTeam
      })
      this.origTeams = this.returnSort('team.name', originalList)
      this.filteredTeams = this.origTeams
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    },
    /**
     * Resets form fields and validations
     * @param {String} formName
     */
    resetForm: function(formName) {
      this.filteredMembers = []
      this.selectedMembers = []
      this.filteredTeams = []
      this.selectedTeams = []
      this.$nextTick(() => {
        this.toggleOptions(false)
        this.$refs[formName].resetFields()
      })
    },
  }
}
</script>

<style lang="scss">
@import '../../../../assets/_variables.scss';
@import '../../../../assets/components/_add-member-dialog.scss';

.add-member-dialog{
  .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 150px;

  .empty-msg {
    margin-top: 8px;
    font-size: 14px;
    color: $glial;
  }

  .datasets-icon {
    color: $dopamine;
  }

}
.autocomplete{
    h4{
      color: #000;
      font-size: 12px;
    }

    ul {
      li {
        font-size: 12px;
        color: #000;
      }
    }
  }
}

</style>
