<template>
  <div class="team-info">
    <circle-icon
      :class="avatarClass"
      icon="icon-team"
    />
    <div class="team-details">
      <div class="name">
        <router-link
          v-if="showMembers"
          :to="{ name: 'team-members-list', params: { id: createTeamId(item) }}"
        >
          {{ teamName }}
        </router-link>
        <span
          v-if="!showMembers"
          class="display-name"
        >
          {{ teamName }}
        </span>
      </div>
      <div
        v-if="showMembers"
        class="members"
      >
        {{ memberCount }} Members
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../../assets/variables';

.team-info {
  display: flex;
  align-items: center;
}

.team-details {
  a {
    cursor: pointer;
  }

  .name {
    color: #000;
    font-weight: 600;
    font-size: 16px;

    .display-name {
      font-size: 14px;
    }
  }
}

.team-avatar {
  margin-right: 16px;

  &.condensed {
    margin-right: 8px;
  }
}
</style>

<script>
import CircleIcon from '../../shared/circle-icon/CircleIcon.vue'

import { pathOr, propOr } from 'ramda'

export default {
  name: 'TeamLabel',

  components: {
    CircleIcon
  },

  props: {
    showMembers: {
      type: Boolean,
      default: true
    },
    item: {
      type: Object,
      default: function() {
        return {
          team: {
            name: ''
          },
          memberCount: 0
        }
      }
    }
  },

  computed: {
    avatarClass: function() {
      return this.showMembers ? 'team-avatar' : 'team-avatar condensed'
    },
    memberCount: function() {
      return propOr(0, 'memberCount', this.item)
    },
    teamName: function() {
      return pathOr('', ['team', 'name'], this.item)
    }
  },

  methods: {
    /**
     * Dynamically creates team members id for team-members-list route
     * @param {Object} team
     * @returns {String}
     */
    createTeamId: function(team) {
      const teamId = pathOr('N:team:0', ['team', 'id'], team)
      return teamId
    }
  }
}
</script>
