<template>
  <span>
    <div v-show="!isSignedIn" class="link-container">
      <a href="#" @click.prevent="openLogInModal">
        <svg-icon
          :class="iconSpacing"
          icon="icon-person"
          height="18"
          width="18"
          color="#fff"
        />{{ signInCopy }}
      </a>
    </div>
    <div v-show="isSignedIn" class="link-container">
      <a v-popover:userDropdownMenu href="#">
        <svg-icon
          :class="iconSpacing"
          icon="icon-person"
          height="18"
          width="18"
          color="#fff"
        />{{ displayNameCopy }}
      </a>
      <el-popover
        ref="userDropdownMenu"
        popper-class="no-padding scroll small-margin"
        width="100"
        trigger="hover"
        transition=""
        :offset="dropdownOffset"
        :disabled="!isSignedIn"
        :visible-arrow="false"
      >
        <div class="bf-menu scroll-menu">
          <ul>
            <li>
              <a class="bf-menu-item" href="#" @click.prevent="logout">
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      </el-popover>
    </div>
  </span>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import EventBus from '@/utils/event-bus'

export default {
  name: 'BfUserDropdownMenu',

  props: {
    isMobile: {
      type: Boolean,
      default: false
    },

    iconSpacing: {
      type: String,
      default: 'mr-8'
    }
  },

  computed: {
    ...mapGetters(['isSignedIn', 'userDisplayName']),

    /**
     * Copy for sign in button, display nothing
     * if on mobile
     * @returns {String}
     */
    signInCopy() {
      return this.isMobile ? '' : 'Access Platform'
    },

    /**
     * Copy for user display name, display nothing
     * if on mobile
     * @returns {String}
     */
    displayNameCopy() {
      return this.isMobile ? '' : this.userDisplayName
    },

    /**
     * Conditional dropdown menu offset for mobile
     * @returns {Number}
     */
    dropdownOffset() {
      return this.isMobile ? -40 : -12
    }
  },

  methods: {
    ...mapActions(['clearState']),

    /**
     * Emit display modal event
     */
    openLogInModal() {
      this.$emit('open-log-in-modal')
    },

    /**
     * Emit logout event
     */
    logout() {
      EventBus.$emit('logout')
    }
  }
}
</script>

<style lang="scss" scoped>
.link-container {
  display: inline-block;
  a {
    color: white;
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 400;
  }
  li {
    text-align: center;
  }
}
</style>
