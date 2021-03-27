import { mapGetters } from 'vuex'

import Avatar from '../../shared/avatar/Avatar.vue'
import CircleIcon from '../../shared/circle-icon/CircleIcon.vue'

import EventBus from '../../../utils/event-bus'
import { pathOr, path, propOr } from 'ramda'

export default {
  name: 'team',

  components: {
    Avatar,
    CircleIcon
  },

  props: {
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
    },
    hasAdminRights: {
      type: Boolean,
      default: false
    },
    removeFromList: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization'
    ]),

    teamName: function() {
      return pathOr('', ['team', 'name'], this.item)
    },
    systemTeamType: function() {
      const value = this.item.team.systemTeamType || ''
      return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
    },
    memberCount: function() {
      const count = propOr(0, 'memberCount', this.item)
      const plural = count === 1 ? '' : 's'
      return `${count} Member${plural}`
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
    },
    /**
     * Dynamically changes route and saves team in $store.view state
     * @param {Object} team
     */
    changeRoute: function(team) {
      const id = this.createTeamId(team)
      this.$router.push({
        name: 'team-members-list',
        params: {
          id
        }
      })
    },
    /**
     * Open delete team dialog
     * @param {Object} team
     */
    openDeleteDialog: function(team) {
      if (this.removeFromList) {
        return this.$emit('remove-team-from-list', team)
      }
      EventBus.$emit('open-remove-team', team)
    },
    /**
     * Handler for team menu click
     * @param {String} name
     */
    onTeamMenu: function(name) {
      if (typeof this[name] === 'function') {
        this[name](this.item)
      }
    },
  }
}
