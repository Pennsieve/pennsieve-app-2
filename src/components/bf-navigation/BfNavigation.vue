<template>
  <div
    class="bf-navigation primary"
    :class="[ primaryNavCondensed || pageNotFound || secondaryNavOpen ? 'condensed' : '' ]"
  >
    <div class="logo-wrap">
      <router-link
        v-if="!pageNotFound"
        tag="button"
        :to="logoRoute"
      >
        <svg-icon
          v-show="!primaryNavCondensed || secondaryNavOpen"
          class="logo"
          name="pennsieve-logo"
          width="24"
          height="24"
          color="currentColor"
        />
      </router-link>
      <a
        v-else
        :href="logoLink"
      >
        <svg-icon
          v-show="!primaryNavCondensed || secondaryNavOpen"
          class="logo"
          name="pennsieve-logo"
          width="24"
          height="24"
          color="currentColor"
        />
      </a>
      <button
        v-show="!secondaryNavOpen && !pageNotFound"
        class="btn-expand-collapse"
        name="Toggle Primary Menu"
        @click="toggleMenu"
      >
        <svg-icon
          :name="primaryNavCondensed ? 'icon-nav-expand' : 'icon-nav-collapse'"
          :width="primaryNavCondensed ? '32' : '24'"
          :height="primaryNavCondensed ? '32' : '24'"
          color="#fff"
          class="collapse"
        />
      </button>
    </div>

    <div class="menu-wrap">
      <bf-navigation-item
        v-if="!(pageNotFound) && isWelcomeOrg"
        :link="{ name: 'welcome', params: {orgId: activeOrganizationId} }"
        label="Welcome"
        icon="icon-organization"
        :condensed="primaryNavCondensed"

      />

      <bf-navigation-item
        v-if="!(pageNotFound) && isWelcomeOrg"
        :link="{ name: 'submit', params: {orgId: activeOrganizationId} }"
        label="Submit Datasets"
        icon="icon-document"
        :condensed="primaryNavCondensed"

      />


      <bf-navigation-item
        v-if="!(pageNotFound) && isWelcomeOrg"
        :link="{ name: 'info', params: {orgId: activeOrganizationId} }"
        label="More Information"
        icon="icon-help"
        :condensed="primaryNavCondensed"

      />

      <bf-navigation-item
        v-if="!(pageNotFound || isWelcomeOrg)"
        :link="{ name: 'datasets-list', params: {orgId: activeOrganizationId} }"
        label="Datasets"
        icon="icon-datasets"
        :condensed="primaryNavCondensed"

      />

      <bf-navigation-item
        v-if="!(pageNotFound || isWelcomeOrg) && !isWorkspaceGuest"
        :link="{ name: 'people-list', params: {orgId: activeOrganizationId} }"
        label="People"
        icon="icon-person"
        :condensed="primaryNavCondensed"

      />

      <bf-navigation-item
        v-if="!(pageNotFound || isWelcomeOrg) && !isWorkspaceGuest"
        :link="{ name: 'teams-list', params: {orgId: activeOrganizationId} }"
        label="Teams"
        icon="icon-team"
        :condensed="primaryNavCondensed"

      />

      <bf-navigation-item
        v-if="!(pageNotFound || isWelcomeOrg) && !isWorkspaceGuest"
        id="nav-publishing"
        :link="{ name: 'publishing', params: {orgId: activeOrganizationId} }"
        label="Publishing"
        icon="icon-public"
        :condensed="primaryNavCondensed"

      />

      <bf-navigation-item
        v-if="!(pageNotFound || isWelcomeOrg) && !isWorkspaceGuest"
        id="nav-integrations"
        :link="{ name: 'integrations-list', params: {orgId: activeOrganizationId} }"
        label="Integrations"
        icon="icon-integrations"
        :condensed="primaryNavCondensed"

      />

      <bf-navigation-item
        v-if="hasAdminRights && !pageNotFound && !isWorkspaceGuest"
        :link="{ name: 'settings', params: {orgId: activeOrganizationId} }"
        label="Settings"
        icon="icon-settings"
        :condensed="primaryNavCondensed"
      />
    </div>
    <span
      v-if="!secondaryNavOpen && !pageNotFound"
      class="collapse-handle"
      @click="toggleMenu"
    />
    <bf-navigation-tertiary />
  </div>
</template>

<script>
  import BfNavigationItem from './bf-navigation-item/BfNavigationItem.vue'
  import BfNavigationTertiary from '../bf-navigation-tertiary/BfNavigationTertiary.vue'
  import BfOrganizationsList from './bf-organizations-list/BfOrganizationsList.vue'
  import { mapActions, mapGetters, mapState } from 'vuex'
  import { pathOr, propOr } from 'ramda'
  import { PublicationTabs } from '../../utils/constants';

  export default {
    name: 'BfNavigation',

    components: {
      BfNavigationItem,
      BfNavigationTertiary,
      BfOrganizationsList
    },

    computed: {
      ...mapGetters([
        'activeOrganization',
        'hasFeature',
        'isUserPublisher',
        'isWelcomeOrg'
      ]),

      ...mapState([
        'config',
        'secondaryNavOpen',
        'primaryNavCondensed',
        'pageNotFound',

      ]),

      PublicationTabs: function() {
        return PublicationTabs
      },

      /**
       * Compute what route the logo should
       * take the user based on their organization
       * @returns {Object}
       */
      logoRoute: function() {
        let routeName = 'datasets-list'

        return {
          name: routeName, params: { orgId: this.activeOrganizationId }
        }
      },

    /**
     * Dynamic link to generate home page, based on environment
     * @returns {String}
     */
    logoLink: function() {
      return this.config.environment === 'prod' ? 'https://app.pennsieve.io' : 'https://app.pennsieve.net'
    },

      /**
       * Computes whether or not user has administratrive rights for the organization
       */
      hasAdminRights: function() {
        const isAdmin = propOr(false, 'isAdmin', this.activeOrganization)
        const isOwner = propOr(false, 'isOwner', this.activeOrganization)
        return isAdmin || isOwner
      },

      isWorkspaceGuest: function() {
        const isGuest = propOr(false, 'isGuest', this.activeOrganization)
        return isGuest
      },

      /**
       * Compute active organization name
       * @returns {String}
       */
      activeOrganizationName: function() {
        return pathOr('Organization', ['organization', 'name'], this.activeOrganization)
      },

      /**
       * Compute active organization id
       * @returns {String}
       */
      activeOrganizationId: function() {
        return pathOr('Organization', ['organization', 'id'], this.activeOrganization)
      },
    },

    methods: {
      ...mapActions([
        'togglePrimaryNav',
        'condensePrimaryNav'
      ]),
      
      /**
       * Toggles primary nav open and closed
       */
      toggleMenu: function() {
        this.condensePrimaryNav(!this.primaryNavCondensed)
      },

      /**
       * Collapses the primary nav menu
       */
      closeMenu: function() {
        this.togglePrimaryNav(false)
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../assets/_variables.scss';
  @import 'bf-navigation';
  @import './logo.scss';

  .bf-navigation {
    background: $app-primary-color;
    color: $white;
    z-index: 99;
  }
  .active-org {
    align-items: center;
    color: $white;
    display: flex;
    font-size: 12px;
    font-weight: 500;
    margin: 0;
    text-decoration: none;
    .svg-icon {
      margin-left: 8px;
    }
  }
  .active-org-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .logo {
    color: $white;
    fill: $white;
  }
  .logo-wrap {
    margin: 18px 0;
  }
  .logo-arrow {
    color: $white;
  }
  .slide-enter-active, .slide-leave-active {
    transition: transform .20s ease-out
  }
  .slide-enter-to {
    transform: translate3d(0, 0, 0);
  }
  .slide-enter, .slide-leave-to {
    transform: translate3d(-100%, 0, 0);
  }
</style>
<style>
  #nav-publishing .icon-main {
    height: 30px !important;
    margin: 0 20px 0 -6px;
    width: 30px !important;
  }
  #nav-integrations .icon-main {
    height: 26px !important;
    margin: 0 20px 0 -3px;
    width: 26px !important;
  }
</style>
