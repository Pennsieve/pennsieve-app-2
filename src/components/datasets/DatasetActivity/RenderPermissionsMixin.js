import { mapGetters } from 'vuex'
import { pathOr } from 'ramda'
export default {
  computed: {
    ...mapGetters([
      'dataset',
      'getOrgMemberByIntId',
      'getOrganizationByIntId'
    ])
  },

  methods: {
    /**
     * Displays permissions information
     * @param {Object} event
     * @returns {String}
     */
    renderPermissionDetail: function(event) {
      const userId = pathOr('', ['detail', 'userId'], event)
      const name = userId
        ? this.userPermissionDetail(event)
        : this.organizationPermissionDetail(event)

      const newRole = pathOr('', ['detail', 'newRole'], event)
      const oldRole = pathOr('', ['detail', 'oldRole'], event)
      if (oldRole) {
        return `${name} permission changed from ${oldRole} to ${newRole}`
      }
      return `${name} was added as a dataset ${newRole}`
    },

    /**
     * Gets user information for permissions
     * @param {Object} event
     * @returns {String}
     */
    userPermissionDetail: function(event) {
      const userId = pathOr('', ['detail', 'userId'], event)
      const user = this.getOrgMemberByIntId(userId)

      return `${user.firstName} ${user.lastName}`
    },

    /**
     * Gets organization information for permissions
     * @param {Object} event
     * @returns {String}
     */
    organizationPermissionDetail: function(event) {
      const organizationId = pathOr('', ['detail', 'organizationId'], event)
      const { organization } = this.getOrganizationByIntId(organizationId)

      return organization
        ? organization.name
        : ''
    }
  }
}
