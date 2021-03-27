import { propOr } from 'ramda'

export default {
  methods: {
    /**
     * Pluralizing method to add an s
     * @param {Number}
     * @returns {String}
     */
    _pluralize: function(num) {
      return num == 1 ? '' : 's'
    },
    /**
     * Displays the number of teams with whom data is shared
     * @param {Number} numTeams
     * @returns {String}
     */
    displayTeams: function(numTeams) {
      if (numTeams === 0) {
        return ''
      }
      const plural = this._pluralize(numTeams)
      return `${numTeams} team${plural}`
    },
    /**
     * Displays the number of users with whom data is shared
     * @param {Number} numUsers
     * @returns {String}
     */
    displayUsers: function(numUsers) {
      if (numUsers === 0) {
        return ''
      }
      const plural = this._pluralize(numUsers)
      return `${numUsers} user${plural}`
    },
    /**
     * Calculates with who the dataset is shared
     * @param {Object} collaborators
     * @returns {String}
     */
    peopleShared: function(collaborators) {
      const orgs = propOr(0, 'organizations', collaborators)
      const teams = propOr(0, 'teams', collaborators)
      const users = propOr(0, 'users', collaborators)

      const sum = orgs + teams + users
      if (sum === 0) {
        return 'no one'
      }

      /**
       *  @NOTE: we still have an issue where teams does not return
       *  the total number of users per team with whom the data was shared
       */
      const userList = [this.displayTeams(teams), this.displayUsers(users)].filter(Boolean)
      const allUsers = userList.join(', ')

      if (allUsers.length > 0) {
        return allUsers
      }

      return 'everyone'
    },
    /**
     * Calculates with who the dataset is shared
     * @param {Object} collaborators
     * @returns {String}
     */
    getSharedWith: function(collaborators) {
      const orgs = propOr(0, 'organizations', collaborators)
      const teams = propOr(0, 'teams', collaborators)
      const users = propOr(0, 'users', collaborators)
      const sum = orgs + teams + users

      let txt = 'Organization'
      if (sum === 0) {
        txt = 'Private'
      } else if (teams + users > 0) {
        if (teams + users === 1) {
          txt = '1 Collaborator'
        } else {
          txt = `${teams + users} Collaborators`
        }
      }

      return txt
    },
    /**
     * Calculates the corresponding shared icon based upon with whom the dataset is shared
     * @param {Object} collaborators
     * @returns {String}
     */
    getSharedIcon: function(collaborators) {
      const sharedWith = this.getSharedWith(collaborators)
      switch(true) {
        case sharedWith.indexOf('Private') >= 0:
          return 'icon-lock-filled'
        case sharedWith.indexOf('Collaborator') >= 0:
          return 'icon-team'
        default:
          return 'icon-organization'
      }
    }
  }
}