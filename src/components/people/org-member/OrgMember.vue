<template>
  <div>
    <el-row
      type="flex"
      class="member"
      align="middle"
      :gutter="32"
    >
      <el-col
        :sm="7"
        class="member-col info"
      >
        <user :user="item" />
      </el-col>

      <template v-if="showStorage">
        <el-col
          :sm="4"
          class="member-col"
        >
          {{ dataUsage }}
        </el-col>
        <el-col
          :sm="3"
          class="member-col col-spacer"
        />
        <el-col
          :sm="4"
          class="member-col administrator"
        >
          {{ item.role }}
        </el-col>
      </template>

      <template v-else>
        <el-col
          :sm="4"
          class="member-col administrator"
        >
          {{ getRole(item.role) }}
        </el-col>
        <el-col
          :sm="4"
          class="member-col col-spacer"
        />
      </template>

      <el-col
        :sm="6"
        class="member-col menu"
      >
        <span
          v-if="status === 'Pending' || status === 'Expired'"
          class="no-shrink"
        >
          <span :class="statusClass">
            {{ status }}
          </span>
          <a
            class="resendInvite"
            href="#resendInvite"
            @click="resendInvite(item.id)"
          >
            Resend Invite
          </a>
        </span>
        <el-dropdown
          v-if="hasAdminRights"
          trigger="click"
          placement="bottom-end"
          @command="handleCommand"
        >
          <span class="el-dropdown-link">
            <svg-icon
              name="icon-menu"
              height="20"
              width="20"
            />
          </span>
          <el-dropdown-menu
            v-if="status === 'Pending' || status === 'Expired'"
            slot="dropdown"
            :offset="9"
            class="bf-menu"
          >
            <el-dropdown-item
              command="remove"
              class="bf-menu-item"
            >
              Delete Member
            </el-dropdown-item>
          </el-dropdown-menu>
          <el-dropdown-menu
            v-if="status !== 'Pending' && status !== 'Expired'"
            slot="dropdown"
            :offset="9"
            class="bf-menu"
          >
            <el-dropdown-item
              command="edit-member"
              class="bf-menu-item"
            >
              Update Member
            </el-dropdown-item>
            <el-dropdown-item
              v-if="getRole(item.role) !== 'Administrator'"
              command="promote-admin"
              class="bf-menu-item"
            >
              Promote to Admin
            </el-dropdown-item>
            <el-dropdown-item
              v-if="getRole(item.role) === 'Administrator'"
              command="demote-admin"
              class="bf-menu-item"
            >
              Demote Admin
            </el-dropdown-item>
            <el-dropdown-item
              command="reset-password"
              class="bf-menu-item"
            >
              Reset Password
            </el-dropdown-item>
            <el-dropdown-item
              command="remove"
              class="bf-menu-item"
            >
              Delete Member
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import User from '../../shared/user/User.vue'
import StorageMetrics from '../../../mixins/bf-storage-metrics'
import UserRoles from '../../../mixins/user-roles'
import Request from '../../../mixins/request'
import EventBus from '../../../utils/event-bus'
import { mapGetters } from 'vuex'

import { propOr } from 'ramda'
import moment from 'moment'

export default {
  name: 'OrgMember',

  components: {
    User
  },

  mixins: [
    StorageMetrics,
    UserRoles,
    Request
  ],

  props: {
    item: {
      type: Object,
      default: function() {
        return {}
      }
    },
    hasAdminRights: {
      type: Boolean,
      default: false
    },
    showStorage: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      administrator: 'Administrator'
    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'config',
      'userToken',
      'profile',
      'hasFeature'
    ]),
    status: function() {
      if (!this.item.pending) {
        return ''
      }
      let status = 'Pending'
      const now = moment.utc()
      const expiresDate = moment.utc(this.item.validUntil)
      // Check if invitation has expired
      if (moment(expiresDate).isBefore(now)) {
        status = 'Expired'
      }
      return status
    },
    statusClass: function() {
      return `member-status ${this.status.toLowerCase()}`
    },
    dataUsage: function() {
      const storage = propOr(0, 'storage', this.item)
      return this.formatMetric(storage)
    }
  },

  methods: {

    /**
     * Displays proper role value per member based
     * on what's returned from endpoint or method
     * @param {String} role
     */
    getRole: function(role) {
      return role === 'manager' ? 'Administrator'
      : role === 'owner' ? 'Owner'
      : role === 'blind_reviewer' ? 'Blind Reviewer'
      : 'Collaborator'
    },

    /**
     * Resend invitation
     * @param {String} memberId
     */
    resendInvite: function(memberId) {
      const url = `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}/invites/${memberId}?api_key=${this.userToken}`;
      this.sendXhr(url, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        }
      })
        .then(() => {
          EventBus.$emit('toast', {detail: { msg: 'Invite resent' }})
        })
        .catch(() => {
          EventBus.$emit('toast', {detail: { msg: 'Error resending invite' }})
        })
    },
    /**
     * Handles dropdown menu selections
     * @param {String} memberId
     */
    handleCommand: function(command) {
      const commands = {
        'remove': () => this.removeMember(this.item),
        'promote-admin': () => this.setAdminStatus(this.item, 'administer'),
        'demote-admin': () => this.setAdminStatus(this.item, 'delete'),
        'reset-password': () => this.resetPassword(this.item),
        'edit-member': () => this.editMember(this.item)
      }
      if (typeof commands[command] === 'function') {
        commands[command]()
      }
    },
    /**
     * Edit member in organization
     * @param {Object} member
     */
    editMember: function(member) {
      EventBus.$emit('update-org-member', member)
    },
    /**
     * Remove member from organization
     * @param {Object} member
     */
    removeMember: function(member) {
      EventBus.$emit('remove-org-member', member)
    },
    /**
     * Creates PUT url
     */
    createPutUrl: function(memberId) {
      return `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}/members/${memberId}?api_key=${this.userToken}`
    },

    /**
     * Promote or demote a user
     * @param {Object} member
     * @param {String} status
     */
    setAdminStatus: function(member, status) {
      const memberId = propOr('', 'id', member)
      const url = this.createPutUrl(memberId)
      const firstName = propOr('', 'firstName', this.item)
      const lastName = propOr('User', 'lastName', this.item)
      this.sendXhr(url, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: {permission: status}
      })
        .then(() => {
          if (status === 'administer') {
            EventBus.$emit('toast', {detail: { msg: `${firstName} ${lastName} has been promoted to admin` }})
            this.$emit('promote-to-admin', member)
          } else {
            EventBus.$emit('toast', {detail: { msg: `${firstName} ${lastName} has been demoted to collaborator` }})
            this.$emit('demote-from-admin', member)
          }
        })
        .catch(() => {
          if (status === 'administer') {
            EventBus.$emit('toast', {detail: { msg: `Error promoting ${firstName} ${lastName} to admin` }})
          } else {
            EventBus.$emit('toast', {detail: { msg: `Error demoting ${firstName} ${lastName} to collaborator` }})
          }
        })
    },
    /**
     * Reset a user's password
     * @param {Object} member
     */
    resetPassword: function(member) {
      const email = propOr('', 'email', member)
      const firstName = propOr('', 'firstName', member)
      const lastName = propOr('User', 'lastName', member)
      const url = `${this.config.apiUrl}/account/${email}/reset`
      this.sendXhr(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      })
        .then(() => {
          EventBus.$emit('toast', {detail: { msg: `${firstName} ${lastName}'s password has been reset` }})
          if (this.profile.email === email) {
            setTimeout(() => EventBus.$emit('logout'), 2500)
          }
        })
        .catch(() => {
          EventBus.$emit('toast', {detail: { msg: `Error resetting ${firstName} ${lastName}'s password` }})
        })
    }
  }
}
</script>


<style scoped lang="scss">
@import '../../../assets/variables';

.member-col {
  color: $glial;

  &.menu {
    display: flex;
    justify-content: flex-end;
  }
}

.no-shrink {
  flex-shrink: 0;
}

.member {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0
}

.member-status {
  display: inline-block;
  text-transform: uppercase;
  border: solid 1px transparent;
  border-radius: 2px;
  font-size: 10px;
  line-height: 24px;
  height: 24px;
  width: 57px;
  text-align: center;
  margin-right: 16px;

  &.pending {
    color: #634B09;
    background-color: #FFC727;
  }
  &.expired {
    color: #404554;
    background-color: #BDBDBD;
  }
}

.svg-icon.menu {
  height: 8px;
  width: 24px;
}

.el-dropdown {
  margin-left: 16px;
}

.el-dropdown-link {
  cursor: pointer;
}
</style>
