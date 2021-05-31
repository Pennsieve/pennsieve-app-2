<template>
  <div class="user">
    <avatar
      :class="avatarClass"
      :user="user"
    />
    <div class="user-info">
      <div class="name">
        {{ user.firstName }} {{ user.lastName }} <span
          v-if="isOwner"
          class="dataset-owner"
        >
          Owner
        </span>
      </div>
      <div
        v-if="showEmail"
        class="email"
      >
        {{ user.email }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../../assets/variables';

.user {
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  height: 100%;

  .icon {
    margin-right: 16px;
    flex-shrink: 0;

    &.condensed {
      margin-right: 8px;
    }
  }

  .name {
    color: #000;
    font-weight: 600;

    .dataset-owner {
      color: #9B9B9B;
      display: inline-block;
      margin-left: 8px;
      font-weight: 500;
      font-size: 12px;
    }
  }

  .email {
    color: $gray_4;
  }

  .user-info {
    overflow: hidden;
    & > div {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

<script>
import Avatar from '../avatar/Avatar.vue'

export default {
  name: 'User',

  components: {
    Avatar
  },

  props: {
    showEmail: {
      type: Boolean,
      default: true
    },
    isOwner: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },

  computed: {
    avatarClass: function() {
      return !this.showEmail ? 'icon condensed' : 'icon'
    }
  }
}
</script>
