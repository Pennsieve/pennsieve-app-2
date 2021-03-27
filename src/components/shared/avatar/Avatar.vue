<template>
  <el-tooltip
    ref="tooltip"
    placement="top-start"
    :content="fullName"
    :disabled="!tooltip"
  >
    <div
      class="avatar-circle"
      :style="`backgroundColor: ${profileColor}`"
    >
      <img
        :src="gravatarUrl"
        class="gravatar"
      >
      <span class="avatar-initials">
        {{ avatarText }}
      </span>
    </div>
  </el-tooltip>
</template>

<script>
  import { compose, head, propOr, defaultTo } from 'ramda'
  import { mapGetters } from 'vuex'
  import md5 from 'blueimp-md5'

  export default {
    name: 'Avatar',

    props: {
      tooltip: {
        type: Boolean,
        default: false
      },
      user: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      ...mapGetters([
        'profile'
      ]),

      /**
       * Compute what user to use for the avatar
       * Defaults to the profile in state
       * @returns {Object}
       */
      avatarProfile: function() {
        return Object.keys(this.user).length
          ? this.user
          : this.profile
      },

      /**
       * Compute full name of user
       * @returns {String}
       */
      fullName: function() {
        return `${this.avatarProfile.firstName} ${this.avatarProfile.lastName}`
      },

      /**
       * Compute first initial of profile
       * @returns {String}
       */
      firstInitial: function() {
        return this.getInitial('firstName', this.avatarProfile)
      },

      /**
       * Compute last initial of profile
       * @returns {String}
       */
      lastInitial: function() {
        return this.getInitial('lastName', this.avatarProfile)
      },

      /**
       * Compute md5 hash from user's email
       * @returns {String}
       */
      emailHash: function() {
        const email = propOr('', 'email', this.avatarProfile);
        return md5(email)
      },

      /**
       * Compute gravatar URL
       * @returns {String}
       */
      gravatarUrl: function() {
        return `//gravatar.com/avatar/${this.emailHash}?d=blank&r=g&s=48`
      },

      /**
       * Compute color from profile
       * @returns {String}
       */
      profileColor: function() {
        return propOr('', 'color', this.avatarProfile)
      },

      /**
       * Compute avatar text based defaulting to first and
       * last initial and falling back to email
       * @returns {String}
       */
      avatarText: function() {
        const email = propOr('', 'email', this.avatarProfile)
        return this.firstInitial || this.lastInitial ? `${this.firstInitial}${this.lastInitial}` : email[0]
      }
    },

    methods: {
      /**
       * Returns the first letter of a string
       * @param {String}
       * @param {Object}
       * @returns {String}
       */
      getInitial: (propName, data) => compose(
        head,
        defaultTo(''),
        propOr('', propName)
      )(data)
    }
  }
</script>



<style lang="scss">
  @import '../../../assets/_variables.scss';

  .avatar-circle {
    position: relative;
    align-items: center;
    background: $app-primary-color;
    border-radius: 50%;
    box-sizing: border-box;
    color: $white-matter;
    display: inline-flex;
    font-weight: 600;
    height: 32px;
    justify-content: center;
    overflow: hidden;
    width: 32px;
  }
  .avatar-initials {
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
  }
  .gravatar {
    position: absolute;
    z-index: 2;
    display: block;
    height: 100%;
    width: 100%;
  }
</style>
