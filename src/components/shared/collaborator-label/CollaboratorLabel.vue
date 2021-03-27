<template>
  <div class="collaborator-label">
    <user
      v-if="isUser"
      :user="item"
      :show-email="false"
    />
    <team-label
      v-if="isTeam"
      :item="item"
      :show-members="false"
    />
    <organization-label
      v-if="isOrganization"
      :item="item"
    />
  </div>
</template>

<script>
import User from '../user/User.vue'
import TeamLabel from '../team-label/TeamLabel.vue'
import OrganizationLabel from '../OrganizationLabel/OrganizationLabel.vue'
import { path, prop } from 'ramda'

export default {
  name: 'CollaboratorLabel',

  components: {
    User,
    TeamLabel,
    OrganizationLabel
  },

  props: {
    item: {
      type: Object
    }
  },

  computed: {
    /**
     * Compute if the collaborator is a user
     * @returns {Boolean}
     */
    isUser: function() {
      const team = prop('email', this.item)
      return Boolean(team)
    },

    /**
     * Compute if the collaborator is a team
     * @returns {Boolean}
     */
    isTeam: function() {
      const team = path(['team', 'name'], this.item)
      return Boolean(team)
    },

    /**
     * Compute if the collaborator is an organization
     * @returns {Boolean}
     */
    isOrganization: function() {
      const organization = path(['organization', 'name'], this.item)
      return Boolean(organization)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
