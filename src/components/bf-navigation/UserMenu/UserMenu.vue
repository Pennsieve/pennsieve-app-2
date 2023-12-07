<template>
  <div class="user-menu-wrap">
    <el-popover
      ref="orgMenu"
      v-model="orgMenuOpen"
      popper-class="no-padding user-menu-org-menu scroll"
      placement="right-end"
      width="300"
      trigger="manual"
      transition=""
      :visible-arrow="false"
      @show="onOrgMenuShow"
      @hide="onOrgMenuHide"
    >
      <div
        class="scroll-wrap"
        @mouseenter="onOrgMenuMouseenter"
        @mouseleave="onOrgMenuMouseleave"
      >
        <div class="bf-menu scroll-menu">
          <ul>
            <li v-for="org in filteredOrganizations" :key="org.organization.id">
              <a
                href="#"
                class="bf-menu-item"
                @click.prevent="switchOrganization(org)"
              >
                {{ org.organization.name }}
                <svg-icon
                  v-if="org.organization.name === organizationName"
                  icon="icon-check"
                  class="icon-check"
                  width="20"
                  height="20"
                />
              </a>
            </li>
            <hr />
            <li>
              <a
                href="#"
                class="bf-menu-item"
                :class="[maxOrgsCreated ? 'disabled' : '']"
                @click.prevent="requestCreateOrganization"
              >
                Request to Create Private Workspace
              </a>
            </li>
          </ul>
        </div>

        <filter-empty-state
          v-if="filteredOrganizations.length === 0"
          class="filter-empty-state"
        >
          <h3>No results found</h3>
          <p>We couldn't find any organization that matched your search.</p>
        </filter-empty-state>

        <filter-input
          v-show="showOrgFilter"
          ref="inputFilterName"
          v-model="orgFilterName"
          placeholder="Type an organization name to filter"
        />
      </div>
    </el-popover>

    <el-popover
      ref="userMenu"
      v-model="menuOpen"
      popper-class="user-menu-popover no-padding"
      placement="right-end"
      width="260"
      trigger="manual"
      transition=""
      :visible-arrow="false"
      :disabled="pageNotFound"
    >
      <div
        @mouseover="onUserMenuMouseover"
        @mouseenter="onUserMenuMouseenter"
        @mouseleave="onUserMenuMouseleave"
      >
        <div class="bf-menu">
          <ul>
            <li>
              <a
                v-if="organizationName === 'NIH Intramural Research'"
                class="bf-menu-item"
                href="https://docs.pennsieve.io/page/pennsieve-terms-of-service-nih"
                target="_blank"
              >
                Terms of Use
              </a>
              <a
                v-else
                class="bf-menu-item"
                href="https://docs.pennsieve.io/page/pennsieve-terms-of-use"
                target="_blank"
              >
                Terms of Use
              </a>
            </li>
            <li>
              <a
                class="bf-menu-item"
                href="https://docs.pennsieve.io/page/privacy-policy"
                target="_blank"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
          <hr />
          <ul>
            <li>
              <router-link
                class="bf-menu-item"
                :to="{
                  name: 'my-settings-container',
                  params: { orgId: activeOrganizationId }
                }"
                @click.native="closeMenus"
              >
                View My Profile
              </router-link>
            </li>

            <li>
              <a
                href="#"
                class="bf-menu-item"
                @click.prevent="switchOrganization(welcomeOrganization)"
              >
                Submit to Public Repository
              </a>
            </li>
            <li>
              <a
                v-popover:orgMenu
                class="bf-menu-item icon-item"
                href="#"
                @click.prevent
                @mouseenter="onOrgMenuMouseenter"
                @mouseleave="onOrgMenuMouseleave"
              >
                Switch to Private Workspace
                <svg-icon icon="icon-arrow-right" width="10" height="10" />
              </a>
            </li>
          </ul>

          <hr />

          <ul>
            <li>
              <a class="bf-menu-item" href="#" @click.prevent="onSignOutClick">
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </el-popover>

    <button
      v-if="!pageNotFound"
      v-popover:userMenu
      class="user-menu bf-navigation-item"
      :class="{ active: menuOpen }"
      @focus="onUserMenuMouseenter"
      @blur="onUserMenuMouseleave"
      @mouseenter="onUserMenuMouseenter"
      @mouseleave="onUserMenuMouseleave"
    >
      <avatar />

      <div class="info">
        <span id="user-name">{{ displayName }}</span>
        <span id="organization-name">{{ organizationName }}</span>
        <span v-if="isWorkspaceGuest" id="workspace-guest">
          (workspace guest)
        </span>
      </div>

      <svg-icon
        slot="suffix"
        class="icon-caret"
        icon="icon-arrow-up"
        color="#fff"
        dir="right"
        height="10"
        width="10"
      />
    </button>
    <button v-else class="user-menu">
      <a href="https://app.pennsieve.io">
        <div class="person-circle">
          <svg-icon icon="icon-person" color="#fff" width="52" height="20" />
        </div>
      </a>
    </button>
    <create-organization-dialog
      :visible.sync="isCreateOrgDialogVisible"
      @close-dialog="onCloseDialog"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { propOr, pathOr } from 'ramda'

import BfNavigationItem from '../bf-navigation-item/BfNavigationItem.vue'
import Avatar from '../../shared/avatar/Avatar.vue'
import FilterInput from '../../shared/FilterInput/FilterInput.vue'
import FilterEmptyState from '../../shared/FilterEmptyState/FilterEmptyState.vue'
import CreateOrganizationDialog from '@/components/CreateOrganizationDialog/CreateOrganizationDialog.vue'

import EventBus from '../../../utils/event-bus'

export default {
  name: 'UserMenu',

  components: {
    BfNavigationItem,
    Avatar,
    FilterInput,
    FilterEmptyState,
    CreateOrganizationDialog
  },

  data() {
    return {
      menuOpen: false,
      orgMenuOpen: false,
      orgFilterName: '',
      userMenuMouseover: false,
      isCreateOrgDialogVisible: false
    }
  },

  computed: {
    ...mapState(['profile', 'activeOrganization', 'organizations']),

    /**
     * Checks where user has created the maximum number of organizations
     * @returns {Boolean}
     */
    maxOrgsCreated: function() {
      // NOTE: Adding the first condition so that this can go through
      // as these properties do not exist in the profile object yet
      return (
        this.profile.maxOrganizationsAllowed === 3 &&
        this.profile.organizationsCreated ===
          this.profile.maxOrganizationsAllowed
      )
    },

    /**
     * Checks if route is a 404 page
     * @returns {Boolean}
     */
    pageNotFound: function() {
      return this.$route.name === 'page-not-found'
    },

    /**
     * Compute active organization id
     * @returns {String}
     */
    activeOrganizationId: function() {
      return pathOr(
        'Organization',
        ['organization', 'id'],
        this.activeOrganization
      )
    },

    /**
     * Compute organizations based off of filter
     * @return {Array}
     */
    filteredOrganizations: function() {
      if (this.organizations.length) {
        // Update the org menu's position when the list changes
        this.$nextTick(() => {
          this.$refs.orgMenu.updatePopper()
        })

        return this.organizations.filter(organization => {
          return (
            organization.organization.name
              .toLowerCase()
              .indexOf(this.orgFilterName.toLowerCase()) > -1 &&
            organization.organization.name != 'Welcome'
          )
        })
      }

      return []
    },
    welcomeOrganization: function() {
      if (this.organizations.length) {
        let welcomeOrgs = this.organizations.filter(org => {
          return org.organization.name == 'Welcome'
        })
        return welcomeOrgs[0]
      }
    },

    /**
     * Computes user's display name
     * @returns {String}
     */
    displayName: function() {
      const firstName = propOr('', 'firstName', this.profile)
      const lastName = propOr('', 'lastName', this.profile)
      return `${firstName} ${lastName}`
    },

    /**
     * Compute active organization name
     * @returns {String}
     */
    organizationName: function() {
      return pathOr('----', ['organization', 'name'], this.activeOrganization)
    },

    isWorkspaceGuest: function() {
      const isGuest = propOr(false, 'isGuest', this.activeOrganization)
      return isGuest
    },

    /**
     * Compute if the filter should be shown
     * @returns {Boolean}
     */
    showOrgFilter: function() {
      return this.organizations.length >= 20
    }
  },

  methods: {
    ...mapActions(['toggleDatasetVis']),

    /**
     * Open Create Organization Dialog
     */
    openCreateOrganizationDialog: function() {
      if (!this.maxOrgsCreated) {
        this.isCreateOrgDialogVisible = true
      }
    },

    /**
     * Close Create Organization Dialog
     */
    onCloseDialog: function() {
      this.isCreateOrgDialogVisible = false
    },

    /*
     * Sets the dataset name visibility flag to false
     */
    setDatasetVis: function() {
      console.log('SETTING VISIBILITY TO FALSE')
      this.toggleDatasetVis(false)
    },
    /**
     * Close all menus
     */
    closeMenus: function() {
      this.orgMenuOpen = false
      this.menuOpen = false
      this.setDatasetVis()
    },

    /**
     * Switch organization
     * @param {Object} org
     */
    switchOrganization: function(org) {
      this.closeMenus()

      EventBus.$emit('switch-organization', org)
    },

    /**
     * Callback for when the org menu is shown
     */
    onOrgMenuShow: function() {
      this.$nextTick(() => {
        this.$refs.inputFilterName.focus()
      })
    },

    /**
     * Callback for when the org menu is hidden
     * Use `setTimeout` rather than nextTick to ensure
     * the menu is hidden before resetting
     */
    onOrgMenuHide: function() {
      window.setTimeout(() => {
        this.orgFilterName = ''
      }, 100)
    },

    /**
     * Callback for mouseleave
     * Hide org menu
     */
    onOrgMenuMouseleave: function() {
      clearTimeout(this._timerOrgMenu)
      this._timerOrgMenu = setTimeout(() => {
        this.orgMenuOpen = false

        // Close user menu if the user is not over it
        if (this.userMenuMouseover === false) {
          this.menuOpen = false
        }
      }, 200)
    },

    /**
     * Callback for mouseenter on org menu
     * Show org menu
     */
    onOrgMenuMouseenter: function() {
      clearTimeout(this._timerOrgMenu)
      this._timerOrgMenu = setTimeout(() => {
        this.orgMenuOpen = true
      }, 100)
    },

    /**
     * Callback for mouseover on user menu
     */
    onUserMenuMouseover: function() {
      this.userMenuMouseover = true
    },

    /**
     * Callback for mouseleave on user menu
     * Hide user menu
     */
    onUserMenuMouseleave: function() {
      this.userMenuMouseover = false
      clearTimeout(this._timerUserMenu)

      if (this.orgMenuOpen || this.userMenuMouseover) {
        return
      }

      this._timerUserMenu = setTimeout(() => {
        this.menuOpen = false
      }, 200)
    },

    /**
     * Callback for mouseenter on user menu
     * Show user menu
     */
    onUserMenuMouseenter: function() {
      if (!this.pageNotFound) {
        clearTimeout(this._timerUserMenu)
        this._timerUserMenu = setTimeout(() => {
          this.menuOpen = true
        }, 200)
      }
    },

    /**
     * Callback for sign out menu option click
     * Dispatch event to log the user out
     */
    onSignOutClick: function() {
      this.closeMenus()

      EventBus.$emit('logout')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.person-circle {
  margin-left: 11px;
  position: relative;
  align-items: center;
  background: transparent;
  border: solid 2px #fff;
  border-radius: 50%;
  box-sizing: border-box;
  color: $white;
  display: inline-flex;
  font-weight: 600;
  height: 32px;
  overflow: hidden;
  width: 32px;
}
.user-menu-wrap {
  background: $purple_3;
  .secondary & {
    background: $gray_2;
  }
}
.user-menu {
  cursor: pointer;
  height: 74px;
  &:disabled {
    cursor: default;
    pointer-events: none;
  }
}
.avatar-circle {
  border: 2px solid #fff;
  flex-shrink: 0;
  height: 32px;
  width: 32px;
  .condensed & {
    margin-left: -12px;
  }
}
#user-name {
  font-weight: 500;
}
#organization-name {
  font-size: 12px;
}
#workspace-guest {
  font-size: 10px;
  color: #999999;
}
.icon-caret {
  flex-shrink: none;
}
.info {
  flex: 1;
  margin: 0 8px 0 12px;
  overflow: hidden;
  white-space: nowrap;
  .condensed & {
    margin-left: 16px;
  }
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.filter-input {
  border-bottom: none;
  border-top: 1px solid $gray_2;
}
</style>
<style lang="scss">
@import '../../../assets/_variables.scss';

.user-menu-org-menu {
  margin-left: 0 !important;
}
.user-menu-popover {
  margin-left: 16px !important;
}
.icon-check {
  margin-top: -4px;
  float: right;
  color: $gray_4;
}
</style>
