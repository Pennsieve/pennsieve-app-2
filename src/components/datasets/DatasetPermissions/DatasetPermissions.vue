<template>
  <bf-page class="dataset-permissions">
    <locked-banner
      slot="banner"
    />
    <bf-rafter
      slot="heading"
      title="Dataset Permissions"
    >
      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li>
          <router-link :to="{ name: 'dataset-permissions' }">
            Platform Permissions
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'embargoed-permissions' }">
            Embargoed Access
          </router-link>
        </li>
      </ul>
    </bf-rafter>
    <bf-stage
      v-loading="loadingEntities > 0"
      element-loading-background="#fff"
    >
      <h2>Platform Permissions</h2>
      <p>
        Give teams, individuals, or your entire organization access to your dataset within the Pennsieve platform.
        <a
          href="https://docs.pennsieve.io/docs/dataset-permissions"
          target="_blank"
        >
          Learn More
        </a>
      </p>
      <add-permission-form
        v-if="getPermission('manager')"
        ref="addPermissionForm"
        class="mb-24"
        :processing="processingForm"
        :collaborators="collaborators"
        @submit="setPermission"
      />
      <div class="bf-table">
        <div class="bf-table-header">
          <el-row :gutter="32">
            <el-col
              class="info"
              :sm="10"
            >
              <button
                :class="[isSorting('lastName') ? 'sort-active' : '']"
                @click="sortColumn('lastName')"
              >
                Name
                <svg-icon
                  class="sort-icon"
                  :name="sortIcon('lastName')"
                  color="currentColor"
                />
              </button>
            </el-col>
            <el-col
              align="right"
              :sm="4"
            >
              <button
                :class="[isSorting('permission') ? 'sort-active' : '']"
                @click="sortColumn('permission')"
              >
                Permissions
                <svg-icon
                  class="sort-icon"
                  :name="sortIcon('permission')"
                  color="currentColor"
                />
              </button>
            </el-col>
            <el-col
              class="menu"
              :sm="10"
            />
          </el-row>
        </div>
        <dataset-collaborator
          v-for="item in collaborators"
          :key="item.id"
          class="bf-table-row"
          :item="item"
          @remove-permission="removePermission"
          @update-role="onUpdateRole"
        />
      </div>
    </bf-stage>
  </bf-page>
</template>

<script>
  import {
    mapActions,
    mapGetters,
    mapState
} from 'vuex'
  import {
    propEq,
    assoc,
    pathOr,
    propOr,
    prop,
    merge,
    findIndex,
    compose,
    head,
    defaultTo,
    flatten
  } from 'ramda'

  import BfPage from '../../layout/BfPage/BfPage.vue'
  import BfStage from '../../layout/BfStage/BfStage.vue'
  import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
  import AddPermissionForm from './AddPermissionForm/AddPermissionForm.vue'
  import DatasetCollaborator from '../collaborators/DatasetCollaborator/DatasetCollaborator.vue'

  import Sorter from '../../../mixins/sorter'
  import Request from '../../../mixins/request/index'
  import EventBus from '../../../utils/event-bus'
  import LockedBanner from '../LockedBanner/LockedBanner';

  export default {
    name: 'DatasetPermissions',

    components: {
      BfPage,
      BfStage,
      BfRafter,
      AddPermissionForm,
      DatasetCollaborator,
      LockedBanner
    },

    mixins: [
      Sorter,
      Request
    ],

    props: {
      datasetId: {
        type: String,
        default: ''
      }
    },

    data() {
      return {
        users: [],
        teams: [],
        organizations: [],
        external: [],
        sortBy: 'lastName',
        processingForm: false,
        sortDirection: 'asc',
        loadingEntities: 3
      }
    },

    computed: {
      ...mapState([
        'config',
        'userToken',
        'orgMembers',
        'dataset',
        'activeOrganization',
        'datasetRole',
        'profile'
      ]),

      ...mapGetters([
        'getOrgMember',
        'getTeam',
        'getPermission'
      ]),

      /**
       * Combine members and teams
       * Transform teams to allow sorting by `lastName`
       * Sort list
       * @returns {Array}
       */
      collaborators: function() {
        // Prevent FOUC
        if (this.orgMembers.length === 0) {
          return
        }

        const users = this.transformUsers()

        const teams = this.transformTeams()

        const organizations = this.transformOrganizations()

        const list = flatten([users, teams, organizations])
        return this.returnSort(this.sortBy, list, this.sortDirection)
      },

      /**
       * Compute collaborator users URL
       * @returns {String}
       */
      getUsersUrl: function() {
        return this.userToken
          ? `${this.config.apiUrl}/datasets/${this.datasetId}/collaborators/users?api_key=${this.userToken}`
          : ''
      },

      /**
       * Compute collaborator teams URL
       * @returns {String}
       */
      getTeamsUrl: function() {
        return this.userToken
          ? `${this.config.apiUrl}/datasets/${this.datasetId}/collaborators/teams?api_key=${this.userToken}`
          : ''
      },

      /**
       * Compute collaborator organizations URL
       * @returns {String}
       */
      getOrganizationsUrl: function() {
        return this.userToken
          ? `${this.config.apiUrl}/datasets/${this.datasetId}/collaborators/organizations?api_key=${this.userToken}`
          : ''
      },
    },

    watch: {
      getUsersUrl: {
        handler: function(val) {
          if (val) {
            this.getUsers()
          }
        },
        immediate: true
      },
      getTeamsUrl: {
        handler: function(val) {
          if (val) {
            this.getTeams()
          }
        },
        immediate: true
      },
      /**
       * @TODO wire up when GET organizations endpoint is done
       */
      getOrganizationsUrl: {
        handler: function(val) {
          if (val) {
            this.getOrganizations()
          }
        },
        immediate: true
      },

      orgMembers: {
        handler: function(val) {
          if (val) {
            this.getUsers()
          }
        },
        immediate: true
      }
    },

    methods: {
      ...mapActions([
        'setDatasetRole',
        'updateDataset'
      ]),

      /**
       * Get users added to the dataset
       */
      getUsers: function() {
        this.sendXhr(this.getUsersUrl).then(response => {
          this.users = response
          this.loadingEntities -= 1
        }).catch(this.handleXhrError.bind(this))
      },

      /**
       * Get teams added to the dataset
       */
      getTeams: function() {
        this.sendXhr(this.getTeamsUrl).then(response => {
          this.teams = response
          this.loadingEntities -= 1
        }).catch(this.handleXhrError.bind(this))
      },

      /**
       * Get organizations added to the dataset
       */
      getOrganizations: function() {
        this.sendXhr(this.getOrganizationsUrl).then(response => {
          const role = prop('role', response)
          if (role) {
            this.organizations = [response]
          }
          this.loadingEntities -= 1
        }).catch(this.handleXhrError.bind(this))
      },

      /**
       * Sort column by key
       * @param {String} key
       */
      sortColumn: function(key) {
        this.sortBy = key
        this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc'
      },

      /**
       * Send request to API to set permission
       * @param {Object} item
       * @param {Boolean} isAdding
       */
      setPermission: function(item, isAdding = true) {
        if (isAdding) {
          this.processingForm = true
        }

        const entity = pathOr('users', ['item', 'type'], item)

        const endpointType = item.role === 'owner'
          ? 'owner'
          : entity

        const url = `${this.config.apiUrl}/datasets/${this.datasetId}/collaborators/${endpointType}?api_key=${this.userToken}`

        const itemId = pathOr('', ['item', 'id'], item)
        const label = pathOr('', ['item', 'label'], item)

        // if the entity is in the organization, then itemId is the Node Id of that object
        // if the entity is external, then label is their email address
        const body = {
          id: entity === "external" ? label : itemId,
          role: item.role
        }

        // include custom invite message if one was provided
        const message = pathOr('', ['message'], item)
        if (message !== '') {
          body.message = message
        }

        this.sendXhr(url, {
          method: 'PUT',
          body
        }).then(() => {
          if (isAdding) {
            // Add to the proper list based on entity
            this[entity].push(body)

            // if the added entity is 'external' then a user was added to the organization
            // as a guest, and we need to re-fetch the organization users
            if (entity === 'external') {
              EventBus.$emit('update-organization-members', {})
            }

            // Clear form
            this.$refs.addPermissionForm.reset()

            // Reset processing
            this.processingForm = false

            EventBus.$emit('toast', {
              detail: {
                type: 'success',
                msg: 'Permission added'
              }
            })
          } else {
            // Update existing role
            const idx = findIndex(propEq('id', itemId), this[entity])
            this[entity].splice(idx, 1, body)

            EventBus.$emit('toast', {
              detail: {
                type: 'success',
                msg: 'Permission updated'
              }
            })
          }

          if (item.role === 'owner') {
            this.removeOldOwner(itemId)

            // Update dataset role
            if (this.datasetRole === 'owner') {
              this.setDatasetOwner(itemId)
            }
          }

          const isCurrentUser = itemId === this.profile.id
          if (isCurrentUser) {
            this.setDatasetRole({ role: item.role })
          }
        }).catch(() => {
          // Reset processing
          this.processingForm = false

          EventBus.$emit('toast', {
            detail: {
              type: 'error',
              msg: 'Sorry, an error has occurred'
            }
          })
        })
      },

      /**
       * Remove permission
       * @param {Object} item
       */
      removePermission: function(item) {
        const entity = propOr('', 'entity', item)
        const url = `${this.config.apiUrl}/datasets/${this.datasetId}/collaborators/${entity}?api_key=${this.userToken}`

        let id = this.getEntityId(item, entity)

        this.sendXhr(url, {
          method: 'DELETE',
          body: {
            id
          }
        }).then(() => {
          if (entity === 'organizations') {
            this.organizations = []
          } else {
            const idx = findIndex(propEq('id', id), this[entity])
            this[entity].splice(idx, 1)
          }

          EventBus.$emit('toast', {
            detail: {
              type: 'success',
              msg: 'Permission removed'
            }
          })
        }).catch(() => {
          EventBus.$emit('toast', {
            detail: {
              type: 'error',
              msg: 'Sorry, an error has occurred'
            }
          })
        })
      },

      /**
       * Update role for existing permission
       * @param {object} evt
       */
      onUpdateRole: function(evt) {
        const item = propOr({}, 'item', evt)
        const entity = pathOr('users', ['item', 'entity'], evt)
        const id = this.getEntityId(item, entity)

        this.setPermission({
          item: {
            id,
            type: entity
          },
          role: evt.role
        }, false)
      },

      /**
       * Get entity ID, due to each entity having a different struction
       * @param {Object} item
       * @param {String} entity
       */
      getEntityId: function(item, entity) {
        let id = ''
        switch (entity) {
          case 'organizations':
            id = pathOr('', ['organization', 'id'], item)
            break

          case 'teams':
            id = pathOr('', ['team', 'id'], item)
            break

          default:
            id = propOr('', 'id', item)
            break
        }
        return id
      },

      /**
       * Transform user roles response
       * @returns {Array}
       */
      transformUsers: function() {
        return this.users.map(user => {
          const userId = propOr('', 'id', user)
          if (userId) {
            const orgMember = this.getOrgMember(userId)
            const transform = {
              permission: user.role,
              entity: 'users'
            }

            return merge(orgMember, transform)
          }
        })
      },

      /**
       * Transform teams roles response
       * @returns {Array}
       */
      transformTeams: function() {
        const teams = []

        this.teams.forEach(team => {
          const teamId = propOr('', 'id', team)
          const _team = this.getTeam(teamId)
          if (Object.keys(_team).length) {
            const teamName = pathOr('', ['team', 'name'], _team)
            const transform = {
              id: teamId,
              lastName: teamName,
              permission: team.role,
              entity: 'teams'
            }

            teams.push(merge(_team, transform))
          }
        })

        return defaultTo([], teams)
      },

      /**
       * Transform organization roles response
       * This assumes that the organization added as a role
       * is the active organization. The endpoint doesn't
       * allow for any other organization to be given permission
       * @returns {Array}
       */
      transformOrganizations: function() {
        let organizations = []

        if (this.organizations.length > 0) {
          const organization = this.activeOrganization
          const organizationName = pathOr('', ['organization', 'name'], this.activeOrganization)
          const organizationId = pathOr('', ['organization', 'id'], this.activeOrganization)

          const organizationRole = compose(
            propOr('viewer', 'role'),
            head,
            defaultTo([])
          )(this.organizations)

          const transform = {
            id: organizationId,
            lastName: organizationName,
            permission: organizationRole,
            entity: 'organizations'
          }

          organizations = merge(organization, transform)
        }

        return organizations
      },

      /**
       * Remove old owner from dataset
       * @param {String} ownerId
       */
      removeOldOwner: function(ownerId) {
        const newUsers = this.users.map(user => {
          if (user.role === 'owner' && user.id != ownerId) {
            user.role = 'manager'
          }
          return user
        })

        this.users = newUsers
      },

      /**
       * Update the dataset to the new owner
       * @param {String} ownerId
       */
      setDatasetOwner: function(ownerId) {
        this.setDatasetRole({ role: 'manager' })

        const dataset = assoc('owner', ownerId, this.dataset)
        this.updateDataset(dataset)
      }
    }
  }
</script>

<style scoped lang="scss">
  .dataset-permissions {
    background: #fff;

    p {
      margin-bottom: 21px;
    }
  }
</style>
