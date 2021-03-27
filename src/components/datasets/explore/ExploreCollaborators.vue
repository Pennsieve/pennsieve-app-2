<template>
  <div
    v-loading="isLoading"
    class="explore-collaborators"
    element-loading-background="transparent"
  >
    <h2>Collaborators</h2>

    <div v-if="!isLoading && sharedWith !== 'Private' && sharedWith !== 'Organization'">
      <h3>{{ numCollaborators }} Collaborators</h3>
      <user
        :user="datasetOwner"
        :is-owner="true"
        :show-email="false"
      />
      <collaborator-label
        v-for="member in collaborators"
        :key="member.id"
        :item="member"
      />
      <router-link
        v-if="numCollaborators > maxCollaborators"
        class="collaborators-link"
        :to="{ name: 'dataset-collaborators' }"
      >
        Show all collaborators
      </router-link>
    </div>

    <div v-if="!isLoading && sharedWith === 'Organization'">
      <h3 class="row">
        <svg-icon
          class="share-with-org-icon"
          icon="icon-organization"
          height="16"
          width="16"
        />All Organization Members
      </h3>
      <div
        v-if="isDatasetOwner"
        class="row"
      >
        <circle-icon
          class="team-avatar"
          icon="icon-collaborators"
        />
        <div>
          <span>Update</span> <router-link :to="{name: 'dataset-collaborators'}">
            Collaborator Settings
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && sharedWith === 'Private'">
      <h3 class="row">
        <svg-icon
          class="share-with-org-icon"
          icon="icon-lock-filled"
          height="16"
          width="16"
        />Private
      </h3>
      <user
        :user="datasetOwner"
        :is-owner="true"
        :show-email="false"
      />
      <div
        v-if="isDatasetOwner"
        class="row"
      >
        <circle-icon
          class="team-avatar"
          icon="icon-collaborators"
        />
        <div>
          <span>Update</span> <router-link :to="{name: 'dataset-collaborators'}">
            Collaborator Settings
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import User from '../../shared/user/User.vue'
import CircleIcon from '../../shared/circle-icon/CircleIcon.vue'
import CollaboratorLabel from '../../shared/collaborator-label/CollaboratorLabel.vue'
import UserRoles from '../../../mixins/user-roles'
import Sharing from '../../../mixins/sharing'
import Sorter from '../../../mixins/sorter'
import Request from '../../../mixins/request'
import addPropsToTeams from '../../../utils/addPropsToTeams'

import { prop, pathOr, propOr, find, propEq, pathEq, defaultTo, assoc, take } from 'ramda'

export default {
  name: 'ExploreCollaborators',

  components: {
    User,
    CircleIcon,
    CollaboratorLabel
  },

  mixins: [
    Sharing,
    Request,
    UserRoles,
    Sorter,
  ],

  data() {
    return {
      collaborators: [],
      numCollaborators: 0,
      maxCollaborators: 4
    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'orgMembers',
      'dataset',
      'config',
      'userToken',
      'isDatasetOwner',
      'teams'
    ]),
    sharedWith: function() {
      const collaborators = prop('collaboratorCounts', this.dataset)
      if (!collaborators) {
        return
      }
      return this.getSharedWith(collaborators)
    },
    datasetOwner: function() {
      const ownerId = propOr(0, 'owner', this.dataset)
      const owner = find(propEq('id', ownerId), this.orgMembers)
      return defaultTo({}, owner)
    }
  },

  watch: {
    // needed for direct load
    dataset: function() {
      const whiteList = ['Private', 'Organization']
      if (whiteList.indexOf(this.sharedWith) < 0 && this.collaborators.length === 0) {
        return this.getCollaborators()
      }
      this.isLoading = false
    }
  },

  mounted() {
    // needed when switching routes
    if (this.activeOrganization) {
      this.getCollaborators()
    }
  },

  methods: {
    /**
     * Generates dataset collaborators GET url
     * @returns {String}
     */
    getCollaboratorsUrl: function() {
      const datasetId = pathOr('', ['content', 'id'], this.dataset)
      if (!this.userToken || !datasetId) {
        return
      }
      return `${this.config.apiUrl}/datasets/${datasetId}/collaborators?api_key=${this.userToken}`
    },
    /**
     * Returns list of collaborators
     */
    getCollaborators: function() {
      const collaboratorsUrl = this.getCollaboratorsUrl()
      if (!collaboratorsUrl) {
        return
      }
      this.sendXhr(collaboratorsUrl)
        .then(collaborators => {
          const matchedTeams = collaborators.teams.map(cTeam => {
            return find(pathEq(['team', 'id'], cTeam.id), this.teams)
          })
          const allTeams = addPropsToTeams(matchedTeams)

          const people = collaborators.users.map(user => {
            const role = this.getOrgRole(user, this.activeOrganization)
            return assoc('role', role, user)
          })
          const allPeople = [this.datasetOwner].concat(people)

          const allCollaborators = allPeople.concat(allTeams).filter(all => all !== this.datasetOwner)

          this.collaborators = this.returnSort('lastName', allCollaborators, 'asc')
          this.numCollaborators = this.collaborators.length
          this.collaborators = take(this.maxCollaborators, this.collaborators)
        })
        .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>

<style lang="scss" scoped>
.explore-collaborators {
  padding: 24px;
  min-height: 100px;
}

.collaborator-label {
  margin: 16px 0;
}

h3 {
  margin: 0 0 16px;
}

.share-with-org-icon {
  margin-right: 8px;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    display: inline-block;
  }
}

.circle-icon {
  margin-right: 8px;
}

.user {
  margin: 16px 0;
}

.collaborators-link {
  color: #404554;
  text-decoration: underline;

  &:hover, &:focus {
    text-decoration: none;
  }
}
</style>
