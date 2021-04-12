<template>
  <form class="add-permission-form">
    <el-select
      ref="select"
      v-model="permissionForm.item"
      class="mr-16 select-member"
      required
      filterable
      :default-first-option="true"
      value-key="id"
      placeholder="Find individuals, teams, or everyone..."
      popper-class="add-permission-form-dropdown"
      :no-match-text="`Can't find '${searchText}'`"
      @visible-change="setDisplayValue"
      @change="onChange"
    >
      <svg-icon
        slot="prefix"
        icon="icon-magnifying-glass"
        class="search-icon"
        height="24"
        width="24"
      />

      <el-option-group label="Organization">
        <el-option
          class="add-permission-form-option"
          :label="`Everyone at ${organizationName}`"
          :value="{
            type: 'organizations',
            id: organizationId,
            label: `Everyone at ${organizationName}`
          }"
        >
          <div class="name">
            <!-- eslint-disable-next-line --><!-- highlight sanitizes -->
            <span v-html="highlight(searchText, `Everyone at ${organizationName}`)" />
          </div>
        </el-option>
      </el-option-group>

      <el-option-group label="People">
        <el-option
          v-for="item in filteredUsers"
          :key="item.id"
          class="add-permission-form-option"
          :label="`${fullName(item)} ${item.email}`"
          :value="{
            type: 'users',
            id: item.id,
            label: fullName(item)
          }"
        >
          <div class="name">
            <!-- eslint-disable-next-line --><!-- highlight sanitizes -->
            <span v-html="highlight(searchText, fullName(item))" />
          </div>
          <div class="email">
            <!-- eslint-disable-next-line --><!-- highlight sanitizes -->
            <span v-html="highlight(searchText, item.email)" />
          </div>
        </el-option>
      </el-option-group>

      <el-option-group label="Teams">
        <el-option
          v-for="item in filteredTeams"
          :key="item.team.id"
          class="add-permission-form-option"
          :label="item.team.name"
          :value="{
            type: 'teams',
            id: item.team.id,
            label: item.team.name
          }"
        >
          <div class="name">
            <!-- eslint-disable-next-line --><!-- highlight sanitizes -->
            <span v-html="highlight(searchText, item.team.name)" />
          </div>
        </el-option>
      </el-option-group>
    </el-select>

    <el-select
      ref="permissionSelect"
      v-model="permissionForm.role"
      class="mr-16"
      placeholder="Select Permission"
      required
    >
      <el-option
        v-for="role in roles"
        :key="role.value"
        :label="role.label"
        :value="role.value"
      />
    </el-select>

    <bf-button
      :disabled="isFormInvalid"
      :processing="processing"
      @click="submit"
    >
      Add
    </bf-button>

    <confirm-role-dialog
      :visible.sync="confirmDialogVisible"
      :role="permissionForm.role"
      @confirm="addPermission"
    />
  </form>
</template>



<script>
  import {
    mapState,
    mapGetters
  } from 'vuex'
  import {
    propOr,
    pathOr,
    clone,
    findIndex,
    pathEq,
    propEq
  } from 'ramda'

  import BfButton from '@/components/shared/bf-button/BfButton.vue'
  import ConfirmRoleDialog from '../../collaborators/ConfirmRoleDialog/ConfirmRoleDialog.vue'

  import HighlightText from '@/mixins/highlight-text'
  import Sorter from '@/mixins/sorter'

  const defaultForm = {
    item: {
      id: '',
      label: '',
      type: ''
    },
    role: ''
  }

  export default {
    name: 'AddPermissionForm',

    components: {
      BfButton,
      ConfirmRoleDialog
    },

    mixins: [
      HighlightText,
      Sorter
    ],

    props: {
      processing: {
        type: Boolean,
        default: false
      },
      collaborators: {
        type: Array,
        default: function() {
          return []
        }
      }
    },

    data() {
      return {
        permissionForm: Object.assign({}, defaultForm),
        searchText: '',
        roles: [
          {
            label: 'Can Manage',
            value: 'manager'
          },
          {
            label: 'Can Edit',
            value: 'editor'
          },
          {
            label: 'Can View',
            value: 'viewer'
          }
        ],
        confirmDialogVisible: false
      }
    },

    computed: {
      ...mapState([
        'orgMembers',
        'teams',
        'activeOrganization'
      ]),

      ...mapGetters([
        'hasFeature'
      ]),

      /**
       * Compute if the form is in an invalid state
       * @returns {Boolean}
       */
      isFormInvalid: function() {
        const id = pathOr('', ['item', 'id'], this.permissionForm)
        const role = propOr('', 'role', this.permissionForm)

        return id === '' || role === ''
      },

      /**
       * Compute users list without users who have already been added
       * @returns {Array}
       */
      filteredUsers: function() {
        return this.filterAndSort(['id'], this.orgMembers, 'lastName')
      },

      /**
       * Compute teams list without users who have already been added
       * @returns {Array}
       */
      filteredTeams: function() {
        return this.filterAndSort(['team', 'id'], this.teams, 'team.name').filter(t => !t.team.systemTeamType)
      },

      /**
       * Compute organization's name
       * @returns {String}
       */
      organizationName: function() {
        return pathOr('Organization', ['organization', 'name'], this.activeOrganization)
      },

      /**
       * Compute organization's ID
       * @returns {String}
       */
      organizationId: function() {
        return pathOr('', ['organization', 'id'], this.activeOrganization)
      }
    },

    watch: {
      /**
       * Watch label and set it as the display value
       */
      'permissionForm.item.label': function() {
        this.setDisplayValue()
      }
    },

    mounted: function() {
      // Set up watcher for select query
      this.$watch(
        () => {
          return this.$refs.select.query
        }, (val) => {
          this.searchText = val
        }
      )

      if (this.hasFeature('clinical_management_feature')){
        this.roles.push({
            label: 'Can Review',
            value: 'blind_reviewer'
          })
      }
    },

    methods: {
      /**
       * Filter and sort a list based on another list
       * Used for filtering teams or users from roles that have already been added
       * @param {Array} path
       * @param {Array} list
       * @param {String} sortBy
       * @returns {Array}
       */
      filterAndSort: function(path = [], list = [], sortBy = '') {
        let newList = clone(list)
        // Go through all collaborators and remove them from the orgMembers list
        this.collaborators.forEach(item => {
          const id = pathOr('', path, item)
          const idx = findIndex(pathEq(path, id), newList)
          if (idx >= 0) {
            newList.splice(idx, 1)
          }
        })

        // Sort filtered list
        return this.returnSort(sortBy, newList, 'asc')
      },

      /**
       * Format display name for relationship and set it as the `selectedLabel`
       */
      setDisplayValue: function() {
        this.$nextTick(() => {
          const label = pathOr('', ['item', 'label'], this.permissionForm)
          this.$refs.select.selectedLabel = label
        })
      },
      /**
       * Builds the user's full name
       * @param {Object} member
       */
      fullName: function(member) {
        const firstName = propOr('', 'firstName', member)
        const lastName = propOr('', 'lastName', member)
        return `${firstName} ${lastName}`
      },

      /**
       * Emit an event with the form's info
       */
      submit: function() {
        const role = propOr('', 'role', this.permissionForm)

        if (role !== 'viewer') {
          this.confirmDialogVisible = true
          return
        }

        this.addPermission()
      },

      /**
       * Reset form
       */
      reset: function() {
        this.permissionForm = Object.assign({}, defaultForm)
      },

      /**
       * Emit event to add permission
       */
      addPermission: function() {
        this.$emit('submit', this.permissionForm)
        this.confirmDialogVisible = false
      },

      /**
       * Change callback for the select input
       * @param {Object} item
       */
      onChange: function(item) {
        this.$nextTick(() => {
          this.$refs.permissionSelect.focus()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';

  .select-member {
    flex: 1;
  }

</style>

<style lang="scss">
  @import '../../../../assets/_variables.scss';
  .add-permission-form {
    display: flex;
    .el-input__prefix {
      display: flex !important;
      .svg-icon {
        align-self: center;
      }
    }
  }

  .add-permission-form-dropdown {
    .el-select-group__title {
      color: #000;
      font-size: 12px;
      font-weight: 700;
      line-height: inherit;
      padding: 8px 16px;
      text-transform: none;
    }

    .add-permission-form-option {
      color: #000;
      font-size: 12px;
      padding: 8px 16px;
      &.hover, &.selected {
        cursor: pointer;
        color: $white;
        background: $purple_1;

        .email {
          color: $white;
        }
      }
      .email {
        color: $gray_6
      }
    }
  }
</style>
