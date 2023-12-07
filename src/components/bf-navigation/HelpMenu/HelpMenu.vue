<template>
  <div class="help-menu">
    <el-popover
      ref="helpMenu"
      v-model="menuOpen"
      popper-class="help-menu-popover no-padding"
      placement="right-end"
      trigger="hover"
      transition=""
      :open-delay="200"
      :width="popoverWidth"
      :visible-arrow="false"
    >
      <getting-started
        v-if="showGettingStarted"
        @close-menu="menuOpen = false"
      />

      <div class="bf-menu">
        <ul>
          <li>
            <a
              class="bf-menu-item"
              href="https://forms.clickup.com/8664796/f/88dpw-2951/I6M7Z1V8NEBQFTIKSU"
              target="_blank"
            >
              Contact Us
            </a>
          </li>
          <li>
            <a
              class="bf-menu-item"
              href="https://docs.pennsieve.io/docs/pennsieve-open-office-hours"
              target="_blank"
            >
              Office Hours
            </a>
          </li>
          <li>
            <a
              class="bf-menu-item"
              href="http://docs.pennsieve.io/"
              target="_blank"
            >
              Documentation &amp; Tutorials
            </a>
          </li>
          <li>
            <a
              class="bf-menu-item"
              href="https://docs.pennsieve.io/reference"
              target="_blank"
            >
              Developer Documentation
            </a>
          </li>
          <li>
            <a
              class="bf-menu-item"
              href="https://docs.pennsieve.io/changelog"
              target="_blank"
            >
              Recent Updates
            </a>
          </li>
        </ul>
      </div>
    </el-popover>

    <button
      v-popover:helpMenu
      class="user-menu bf-navigation-item"
      :class="{ active: menuOpen }"
    >
      <svg-icon class="icon-main" icon="icon-help-message" />
      <span class="label">Get Help</span>
      <svg-icon
        slot="suffix"
        icon="icon-arrow-up"
        color="#fff"
        dir="right"
        height="10"
        width="10"
      />
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import GettingStarted from '@/components/onboarding/GettingStarted/GettingStarted.vue'

import EventBus from '@/utils/event-bus'
import UserAccountAge from '@/mixins/user-account-age'

export default {
  name: 'HelpMenu',

  components: {
    GettingStarted
  },

  mixins: [UserAccountAge],

  data() {
    return {
      menuOpen: false
    }
  },

  computed: {
    ...mapGetters(['hasFeature']),

    /**
     * Compute if the getting started guide should be shown
     * @returns {Boolean}
     */
    showGettingStarted: function() {
      return this.userIsLessThan30DaysOld
    },

    /**
     * Compute popover width based on if the getting
     * started guide is being shown
     */
    popoverWidth: function() {
      return this.showGettingStarted ? 340 : 260
    }
  },

  mounted() {
    EventBus.$on('open-getting-started', this.showUserMenu.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('open-getting-started', this.showUserMenu.bind(this))
  },

  methods: {
    /**
     * Show the user menu
     */
    showUserMenu: function() {
      this.menuOpen = true
    }
  }
}
</script>

<style lang="scss" scoped>
.help-menu-popover {
  margin-left: 8px !important;
}
</style>
