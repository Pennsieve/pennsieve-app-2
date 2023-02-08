<template>
  <el-dialog
    class="add-member-dialog"
    :show-close="false"
    :visible.sync="dialogVisible"
    @open="resetForm('userSearchForm')"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Add Team Member"
    />

    <dialog-body>
      <div class="team-name-wrapper">
        <svg-icon
          icon="icon-team"
          class="team-icon"
          height="20"
          width="20"
          color="currentColor"
        />
        <div class="team-name">
          Adding to {{ teamName }}
        </div>
      </div>
      <el-form
        ref="userSearchForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="addToTeam('userSearchForm')"
      >
        <el-input
          v-model="ruleForm.searchText"
          placeholder="Find by name or email address"
          @input="filterMembers"
          @focus="toggleMembers(true)"
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
      </el-popover>
      <div class="org-members">
        <team-member
          v-for="member in selectedMembers"
          :key="member.id"
          :item="member"
          :remove-from-list="true"
          @remove-member-from-list="onRemoveMemberFromList"
        />
      </div>
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
        @click="addToTeam('userSearchForm')"
      >
        Add to Team
      </bf-button>
    </span>
  </el-dialog>
</template>

<style lang="scss">
@import '../../../assets/_variables.scss';
@import '../../../assets/components/_add-member-dialog.scss';
</style>

<script>
import { mapGetters } from 'vuex'

import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import TeamMember from '../members/TeamMember.vue'

import Request from  '../../../mixins/request'
import Sorter from  '../../../mixins/sorter'
import EventBus from '../../../utils/event-bus'
import HighlightText from '../../../mixins/highlight-text'
import { findParentById } from '../../../utils/findParentById'
import { path, pathOr, propOr, find, propEq } from 'ramda'

export default {
  name: 'AddTeamMembers',

  components: {
    BfButton,
    TeamMember,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    Sorter,
    Request,
    HighlightText
  ],

  props: {
    team: {
      type: Object,
      default: function() {
        /* istanbul ignore next */
        return {}
      }
    },
    members: {
      type: Array,
      default: function() {
        /* istanbul ignore next */
        return []
      }
    }
  },

  data() {
    /* istanbul ignore next */
    const checkSelectedMembers = (rule, value, callback) => {
      if (this.selectedMembers.length === 0) {
        return callback('At least one team member is required')
      }
      return callback()
    }
    return {
      dialogVisible: false,
      filteredMembers: [],
      selectedMembers: [],
      origMembers: [],
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
      'orgMembers'
    ]),
    teamName: function() {
      return pathOr('', ['team', 'name'], this.team)
    }
  },

  mounted() {
    EventBus.$on('open-add-team-members', this.onOpenTeamMembers.bind(this))

    this.$el.addEventListener('click', (evt) => {
      if (!this.$refs.popover.showPopper) {
        return
      }
      const targ = evt.target.tagName.toLowerCase()
      const visibility = (targ === 'input') ? true : findParentById(evt.target, 'autocompletePopover')
      this.toggleMembers(visibility)
    })
  },

  beforeDestroy() {
    EventBus.$off('open-add-team-members', this.onOpenTeamMembers.bind(this))
  },

  methods: {
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
     * Add users to team
     */
    addToTeam: function(formName) {
      this.$refs[formName]
        .validate((valid) => {
          if (!valid) {
            return
          }
          this.addToTeamRequest()
        })
    },
    /**
     * Creates the add to team
     */
    addToTeamUrl: function() {
      const orgId = pathOr('', ['organization', 'id'], this.activeOrganization)
      const teamId = pathOr(0, ['team', 'id'], this.team)
      const apiUrl = propOr('', 'apiUrl', this.config)
      return `${apiUrl}/organizations/${orgId}/teams/${teamId}/members?api_key=${this.userToken}`
    },
    /**
     * Makes XHR call to add members to team
     */
    addToTeamRequest: function() {
      const ids = this.selectedMembers.map(mem => mem.id)
      if (ids.length === 0) {
        return
      }
      this.sendXhr(this.addToTeamUrl(), {
        method: 'POST',
        body: { ids }
      })
        .then(members => {
          this.closeDialog()
          this.$emit('members-added-to-team', members)
          EventBus.$emit('toast', {
            detail: {
              type: 'MESSAGE',
              msg: `Team member(s) added for ${this.teamName}`
            }
          })
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Selects member to add to team
     * @param {Object} member
     */
    selectMember: function(member) {
      this.selectedMembers.push(member)
      this.filteredMembers = this.filteredMembers.filter(fm => fm.id !== member.id)
      this.toggleMembers(false)
    },
    /**
     * Toggles filtered members autocomplete list
     * @param {Boolean} bool
     */
    toggleMembers: function(bool) {
      this.$refs.popover.showPopper = bool
    },
    /**
     * Removes a team member from filtered list
     * @param {Object} member
     */
    onRemoveMemberFromList: function(member) {
      this.selectedMembers = this.selectedMembers.filter(mem => mem.id !== member.id)
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
        const firstName = propOr('', 'firstName', mem)
        const lastName = propOr('', 'lastName', mem)
        const name = `${firstName} ${lastName}`.toLowerCase()
        const email = propOr('', 'email', mem).toLowerCase()
        return name.indexOf(searchText) >= 0 || email.indexOf(searchText) >= 0
      })
      this.filteredMembers = filteredList.length > 0 ? filteredList : []
    },
    /**
     * Handles open-add-team-members event
     */
    onOpenTeamMembers: function() {
      this.dialogVisible = true
      if (this.filteredMembers.length === 0 && this.orgMembers) {
        this.getMembers()
      }
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.filteredMembers = []
      this.selectedMembers = []
      this.toggleMembers(false)
    },
    /**
     * Gets all members within an org
     */
    getMembers: function() {
      const originalList = this.orgMembers.filter(orig => {
        const existingMember = find(propEq('id', orig.id), this.members)
        const guestUser = orig.role === 'guest'
        return !existingMember && !guestUser
      })
      this.origMembers = this.returnSort('lastName', originalList)
      this.filteredMembers = this.origMembers
    },
    /**
     * Resets form fields and validations
     * @param {String} formName
     */
    resetForm: function(formName) {
      this.ruleForm.searchText = ''
      this.$nextTick(() => {
        this.$refs[formName].resetFields()
      })
    },
  }
}
</script>
