import { propOr, find, propEq, assoc, curryN } from 'ramda'

/**
 * Determines if user is an org's permission list
 * @param {Object} member
 * @param {Object} activeOrganization
 * @param {String} listName
 * @returns {Boolean}
 */
const _isInList = function(member, activeOrganization, listName) {
  const profileId = propOr(0, 'id', member)
  const list = propOr([], listName, activeOrganization)
  const inList =  find(propEq('id', profileId), list)
  return Boolean(inList)
}

/**
 * Curried version of _isInList
 * @returns {Function}
 */
const isInList = curryN(3, _isInList)

// Default user role
const DEFAULT_ROLE = 'Viewer'

export default {
  methods: {
    /**
     * Determines user role with the org
     * @param {Object} member
     * @param {Object} activeOrganization
     * @returns {String}
     */
    getOrgRole: function(member, activeOrganization) {
      const checkList = isInList(member, activeOrganization)
      switch(true) {
        case checkList('administrators'):
          return 'Administrator'
        case checkList('owners'):
          return 'Owner'
        default:
          return 'Collaborator'
      }
    },

    /**
     * Retrieve owner from organization members matching ownerId against orgMember.id
     * @param {String} ownerId
     * @param {Array} orgMembers
     * @returns {Object}
     */
    getOrgOwner: function(ownerId, orgMembers) {
      const owner = find(propEq('id', ownerId), orgMembers)
      return owner ? assoc('role', 'Owner', owner) : {}
    },

    /**
     * Returns the current user's highest level permission for a dataset
     * @param {Object}
     * @returns {String}
     */
    getDatasetRole: propOr(DEFAULT_ROLE, 'role'),

    /**
     * Returns a given user's highest level permission for a dataset
     * @param {String} userId
     * @param {Array} list
     * @returns {String}
     */
    getUserDatasetRole: function(userId, list) {
      const user = find(propEq('id', userId), list)
      return propOr(DEFAULT_ROLE, 'role', user)
    },

    /**
     * Returns the list of users having a specific role for a given dataset
     * @param {String} role
     * @param {Array} list
     * @returns {Array}
     */
    filterDatasetRoles: (role, list) => list.filter(propEq('role', role)),
  }
}