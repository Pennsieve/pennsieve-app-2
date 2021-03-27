<template>
  <bf-page class="bf-dataset-collaborators">
    <bf-rafter
      slot="heading"
      title="Collaborators"
    >
      <div
        slot="description"
        class="description"
      >
        {{ collaboratorMsg }}
      </div>
      <div
        slot="buttons"
        class="buttons"
      >
        <span
          v-if="hasAdminRights"
          class="inline-flex"
        >
          <el-popover
            ref="sharingMenu"
            popper-class="zero-padding overflow-hidden small-margin"
            placement="bottom-end"
            width="350"
            trigger="click"
            transition=""
            :visible-arrow="false"
          >
            <sharing-menu />
          </el-popover>
          <bf-button
            v-popover:sharingMenu
            :disabled="datasetLocked"
          >
            <svg-icon
              class="share-button-icon"
              :icon="shareButtonIcon"
              height="16"
              width="16"
            />
            {{ shareButtonText }}
            <svg-icon
              class="share-button-arrow"
              icon="icon-arrow-up"
              height="10"
              width="10"
            />
          </bf-button>
          <bf-button
            :disabled="datasetLocked"
            @click="openAddCollaborators"
          >
            Invite
          </bf-button>
        </span>
      </div>
    </bf-rafter>

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >
      <div
        v-if="!isSharedWithOrg && collaborators.length > 0"
        class="bf-table"
      >
        <div class="bf-table-header">
          <el-row :gutter="32">
            <el-col
              :sm="10"
              class="info"
            >
              <button
                :class="[isSorting('lastName') ? 'sort-active' : '']"
                @click="sortColumn('lastName')"
              >
                Name<svg-icon
                  class="sort-icon"
                  :name="sortIcon('lastName')"
                  color="currentColor"
                />
              </button>
            </el-col>
            <el-col :sm="4">
              <button
                :class="[isSorting('role') ? 'sort-active' : '']"
                @click="sortColumn('role')"
              >
                Role<svg-icon
                  class="sort-icon"
                  :name="sortIcon('role')"
                  color="currentColor"
                />
              </button>
            </el-col>
            <el-col
              :sm="10"
              class="menu"
            />
          </el-row>
        </div>
        <dataset-collaborator
          v-for="member in collaborators"
          :key="member.id"
          class="bf-table-row"
          :item="member"
          :has-admin-rights="hasAdminRights"
        />
      </div>

      <bf-empty-page-state
        v-if="isSharedWithOrg"
        class="empty-state"
      >
        <img
          src="/static/images/illustrations/illo-collaboration.svg"
          height="240"
          width="247"
          alt="Shared with organization illustration"
        >
        <h2>Shared with {{ orgName }}</h2>
        <p>{{ datasetName }} has been shared with your entire organization.</p>
      </bf-empty-page-state>

      <private-dataset
        :collaborators="collaborators"
        @update-dataset-sharing="updateDatasetSharing"
      />

      <organization-dataset
        :collaborators="collaborators"
        @update-dataset-sharing="updateDatasetSharing"
      />

      <remove-collaborator
        ref="removeCollaborator"
        @collaborator-removed-from-dataset="onCollaboratorRemoved"
      />

      <add-collaborators
        ref="addCollaborators"
        :collaborators="collaborators"
        @collaborators-added-to-dataset="onCollaboratorsAdded"
      />
    </bf-stage>
  </bf-page>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions, mapState } from 'vuex'

import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'
import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import DatasetCollaborator from './DatasetCollaborator/DatasetCollaborator.vue'
import SharingMenu from './sharing-menu/SharingMenu.vue'
import RemoveCollaborator from './windows/RemoveCollaborator.vue'
import AddCollaborators from './windows/AddCollaborators.vue'
import PrivateDataset from './windows/PrivateDataset.vue'
import OrganizationDataset from './windows/OrganizationDataset.vue'

import EventBus from '../../../utils/event-bus'
import addPropsToTeams from '../../../utils/addPropsToTeams'
import UserRoles from '../../../mixins/user-roles'
import Sharing from '../../../mixins/sharing'
import Sorter from '../../../mixins/sorter'
import Request from '../../../mixins/request'

import { pathOr, path, propOr, prop, pluck, assoc, find, pathEq } from 'ramda'

export default {
  name: 'BfDatasetCollaborators',

  components: {
    BfRafter,
    BfButton,
    DatasetCollaborator,
    BfEmptyPageState,
    RemoveCollaborator,
    AddCollaborators,
    SharingMenu,
    PrivateDataset,
    OrganizationDataset
  },

  mixins: [
    UserRoles,
    Sorter,
    Request,
    Sharing
  ],

  props: {
    datasets: {
      type: Array,
      default: []
    }
  },

  computed: {
    ...mapState([
      'dataset',
    ]),

    ...mapGetters([
      'activeOrganization',
      'profile',
      'orgMembers',
      'userToken',
      'config',
      'teams',
      'datasetLocked'
    ]),
    hasAdminRights: function() {
      if (this.owner && this.profile) {
        return this.owner.id === this.profile.id
      }
    },
    collaboratorMsg: function() {
      const orgName = pathOr('', ['organization', 'name'], this.activeOrganization)
      const datasetName = pathOr('', ['content', 'name'], this.dataset)
      if (!orgName || !datasetName) {
        return ''
      }
      const collaborators = propOr({}, 'collaboratorCounts', this.dataset)
      const peopleShared = this.peopleShared(collaborators)
      switch(peopleShared) {
        case 'no one':
          return `Keep your dataset private or share with members of ${orgName}.`
        case 'everyone':
          return `${datasetName} is shared with everyone in ${orgName}.`
        default:
          return `Make your dataset private, share with individual members, or share with your entire organization.`
      }
    },
    shareButtonText: function() {
      const collaborators = prop('collaboratorCounts', this.dataset)
      if (!collaborators) {
        return
      }
      return this.getSharedWith(collaborators)
    },
    shareButtonIcon: function() {
      if (!this.dataset) {
        return
      }
      const collaborators = propOr({}, 'collaboratorCounts', this.dataset)
      return this.getSharedIcon(collaborators)
    },
    isSharedWithOrg: function() {
      return this.shareButtonText === 'Organization'
    },
    owner: function() {
      if (this.dataset && this.orgMembers) {
        const ownerId = propOr(0, 'owner', this.dataset)
        return this.getOrgOwner(ownerId, this.orgMembers)
      }
    },
    datasetName: function() {
      if (this.dataset) {
        return pathOr('', ['content', 'name'], this.dataset)
      }
    },
    orgName: function() {
      if (this.activeOrganization) {
        return pathOr('', ['organization', 'name'], this.activeOrganization)
      }
    }
  },

  watch: {
    // needed for direct load
    dataset: function(dataset) {
      const ownerId = prop('owner', dataset)
      if (ownerId && this.collaborators.length === 0) {
        this.getCollaborators()
      }
    }
  },

  mounted() {
    EventBus.$on('open-add-collaborators', this.openAddCollaborators.bind(this))

    // needed when switching routes
    if (this.activeOrganization) {
      this.getCollaborators()
    }
  },

  beforeDestroy() {
    EventBus.$off('open-add-collaborators', this.openAddCollaborators.bind(this))
  },

  data() {
    return {
      collaborators: []
    }
  },

  methods: {
    ...mapActions([
      'updateDataset'
    ]),
    /**
     * Updates the collaborators list
     * @param {Array} list
     */
    onCollaboratorsAdded: function(list) {
      // need to dynamically generate appropriate role for user or team
      const updatedList = list.map(user => {
        const role = this.getOrgRole(user, this.activeOrganization)
        return assoc('role', role, user)
      })
      const combinedList = this.collaborators.concat(updatedList)
      this.collaborators = this.returnSort('lastName', combinedList, 'asc')
    },
    /**
     * Removes collaborator from the list
     * @param {Number} collaboratorId
     */
    onCollaboratorRemoved: function(collaboratorId) {
      this.collaborators = this.collaborators.filter(col => {
        return col.id !== collaboratorId
      })
    },
    /**
     * Makes call to resort table by column
     * @param {String} key
     */
    sortColumn: function(key) {
      this.collaborators = this.returnSort(key, this.collaborators)
    },
    /**
     * Generates dataset collaborators GET url
     * @returns {String}
     */
    getCollaboratorsUrl: function() {
      if (!this.userToken) {
        return
      }
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
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
            if (!this.activeOrganization) {
              return people
            }
            const role = this.getOrgRole(user, this.activeOrganization)
            return assoc('role', role, user)
          })
          const allPeople = [this.owner].concat(people)

          const allCollaborators = allPeople.concat(allTeams)
          this.collaborators = this.returnSort('lastName', allCollaborators, 'asc')
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Toggles sharing with organization and private
     * @param {Number} orgCount
     */
    updateDatasetSharing: function(orgCount) {
      const newCollaboratorCounts = {
        collaboratorCounts: {
          organizations: orgCount,
          teams: 0,
          users: 0
        }
      }
      const updatedDataset = Object.assign({}, this.dataset, newCollaboratorCounts)
      this.updateDataset(updatedDataset)
        .then(() => {
          this.collaborators = [this.owner]
        })
    },
    /**
     * Opens the add collaborators dialog window
     */
    openAddCollaborators: function() {
      if (this.$refs.addCollaborators) {
        this.$refs.addCollaborators.dialogVisible = true
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../../assets/variables.scss';

.bf-dataset-collaborators {
  background: #fff;
  .share-button-icon {
    margin-right: 8px;
  }
  .share-button-arrow {
    margin-left: 16px;
    transform: rotate(180deg)
  }
  .inline-flex {
    display: inline-flex;
  }
  .empty-state {
    h2 {
      margin: 0 0 16px !important;
    }
    p {
      display: inline-block;
      margin: -2px 0;
      font-size: 18px;
      line-height: 1;
    }
  }
}
</style>
