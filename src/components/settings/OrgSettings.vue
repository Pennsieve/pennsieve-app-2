<template>
  <bf-page class="bf-org-settings">
    <bf-rafter
      slot="heading"
      title="Organization Settings"
    />

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >
      <el-form
        ref="orgSettingsForm"
        label-position="top"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="updateOrg('orgSettingsForm')"
      >
        <el-form-item
          label="Organization Name"
          prop="orgName"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input
              v-model="ruleForm.orgName"
              class="org-name"
              :disabled="!hasAdminRights ? true : false"
            />
          </a11y-keys>
        </el-form-item>
        <bf-button
          v-if="hasAdminRights"
          @click="updateOrg('orgSettingsForm')"
        >
          Update
        </bf-button>
      </el-form>

      <div class="divider" />

      <div class="org-wrap">
        <h3>Dataset Statuses</h3>
        <p>Add custom statuses to new datasets based on your organization's unique workflow.</p>
        <div
          v-for="status in orgDatasetStatuses"
          :key="status.id"
          class="org-input-container"
        >
          <dataset-status-input
            :active-org-id="activeOrgId"
            :status="status"
            :created-new-status="createdNewStatus"
          />
        </div>
        <div class="buttons">
          <bf-button
            class="primary"
            :disabled="orgDatasetStatuses.length >= 20"
            @click="addStatus"
          >
            Add Status
          </bf-button>
        </div>

        <div class="divider" />

        <org-settings-data-use-agreements />

        <div class="divider" />
        <h3>Organization Data Usage</h3>
        <div class="storage-display-wrap">
          <div class="storage-display">
            <span class="number">
              {{ storageNumber }}
            </span>
            <span class="unit">
              {{ storageUnit }}
            </span>
          </div>
          <div class="storage-used">
            Storage Used
          </div>
        </div>
        <div v-if="allPeople.length > 0">
          <h3>Dataset Usage</h3>
          <div class="pagination-header mb-16">
            <pagination-page-menu
              class="mr-24"
              pagination-item-label="Results"
              :page-size="limit"
              @update-page-size="onUpdateLimit"
            />
            <el-pagination
              :page-size="limit"
              :pager-count="5"
              :current-page="offset / limit + 1"
              layout="prev, pager, next"
              :total="allPeople.length"
              @current-change="onPaginationPageChange"
            />
          </div>
          <div class="bf-table">
            <div class="bf-table-header">
              <el-row :gutter="32">
                <el-col
                  :sm="7"
                  class="info"
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
                  :sm="4"
                  class="align-right"
                >
                  <button
                    :class="[isSorting('storage') ? 'sort-active' : '']"
                    @click="sortColumn('storage')"
                  >
                    Data Usage
                    <svg-icon
                      class="sort-icon"
                      :name="sortIcon('storage')"
                      color="currentColor"
                    />
                  </button>
                </el-col>
                <el-col
                  :sm="3"
                  class="col-spacer"
                >
                  &nbsp;
                </el-col>
                <el-col :sm="4">
                  <button
                    :class="[isSorting('role') ? 'sort-active' : '']"
                    @click="sortColumn('role')"
                  >
                    Role
                    <svg-icon
                      class="sort-icon"
                      :name="sortIcon('role')"
                      color="currentColor"
                    />
                  </button>
                </el-col>
                <el-col
                  :sm="6"
                  class="col-spacer"
                >
                  &nbsp;
                </el-col>
              </el-row>
            </div>
            <org-member
              v-for="member in people"
              :key="member.id"
              class="bf-table-row"
              :has-admin-rights="false"
              :item="member"
              :show-storage="true"
            />
          </div>
        </div>
        <div
          v-if="hasDatasetTemplatesFeature"
          class="dataset-templates"
        >
          <h3>Dataset Templates</h3>
          <dataset-template-table
            @set-active-dataset-template="setActiveDatasetTemplate"
            @dataset-template-menu-click="onDatasetTemplateMenuClick"
          />
        </div>
      </div>
    </bf-stage>

    <create-dataset-template-dialog
      is-editing
      :visible.sync="isDatasetTemplateDialogVisible"
      :dataset-template="activeDatasetTemplate"
    />

    <delete-dataset-template-dialog
      :visible.sync="isDeleteDatasetTemplateDialogVisible"
      :dataset-template="activeDatasetTemplate"
    />
  </bf-page>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'

import BfRafter from '../shared/bf-rafter/BfRafter.vue'
import BfButton from '../shared/bf-button/BfButton.vue'
import A11yKeys from '../shared/a11y-keys/A11yKeys.vue'
import OrgMember from '../../components/people/org-member/OrgMember.vue'
import CreateDatasetTemplateDialog from '../../components/datasets/management/GraphManagement/CreateDatasetTemplateDialog/CreateDatasetTemplateDialog.vue'
import DeleteDatasetTemplateDialog from './DeleteDatasetTemplate/DeleteDatasetTemplate.vue'
import DatasetTemplateTable from './DatasetTemplatesTable/DatasetTemplatesTable.vue'
import DatasetStatusInput from './DatasetStatusInput/DatasetStatusInput.vue'
import OrgSettingsDataUseAgreements from './OrgSettingsDataUseAgreements/OrgSettingsDataUseAgreements.vue'

import BfStorageMetricsMixin from '../../mixins/bf-storage-metrics'
import EventBus from '../../utils/event-bus'
import Sorter from '../../mixins/sorter'
import UserRoles from '../../mixins/user-roles'
import Request from '../../mixins/request'
import TableFunctions from '../../mixins/table-functions'

import { pathOr, propOr, head, last, defaultTo } from 'ramda'
import PaginationPageMenu from '../shared/PaginationPageMenu/PaginationPageMenu'

export default {
  name: 'OrgSettings',

  components: {
    BfRafter,
    BfButton,
    A11yKeys,
    OrgMember,
    CreateDatasetTemplateDialog,
    DeleteDatasetTemplateDialog,
    DatasetTemplateTable,
    DatasetStatusInput,
    PaginationPageMenu,
    OrgSettingsDataUseAgreements
  },

  mixins: [BfStorageMetricsMixin, Sorter, UserRoles, Request, TableFunctions],

  data() {
    return {
      allPeople: [],
      offset: 0,
      limit: 25,
      storageNumber: 0,
      storageUnit: 'B',
      ruleForm: {
        orgName: ''
      },
      rules: {
        orgName: [
          { required: true, message: 'Please provide a name', trigger: 'false' }
        ]
      },
      activeDatasetTemplate: {},
      isDatasetTemplateDialogVisible: false,
      isDeleteDatasetTemplateDialogVisible: false,
      createdNewStatus: false
    }
  },

  computed: {
    ...mapState([
      'activeOrganization',
      'userToken',
      'config',
      'orgMembers',
      'datasets',
      'orgDatasetStatuses'
    ]),

    ...mapGetters(['hasFeature']),

    /**
     * the displayed subset of allPeople based on which page in the paginated list we are on
     * @returns {Array}
     */
    people: function() {
      return this.allPeople.slice(this.offset, this.offset + this.limit)
    },

    /**
     * Active organization id
     * @returns {String}
     */
    activeOrgId: function() {
      return pathOr('', ['organization', 'id'], this.activeOrganization)
    },

    /**
     * Get all status options for organization url
     * @returns {String}
     */
    getDatasetStatusUrl: function() {
      return `${this.config.apiUrl}/organizations/${this.activeOrgId}/dataset-status?api_key=${this.userToken}`
    },


    hasAdminRights: function() {
      if (this.activeOrganization) {
        const isAdmin = propOr(false, 'isAdmin', this.activeOrganization)
        const isOwner = propOr(false, 'isOwner', this.activeOrganization)
        return isAdmin || isOwner
      }

      return ''
    },

    /**
     * Compute if org has dataset templates feature
     * @returns {Boolean}
     */
    hasDatasetTemplatesFeature: function() {
      return this.hasFeature('dataset_templates_feature')
    }
  },

  // needed for direct load
  watch: {
    activeOrganization: function(activeOrg) {
      this.handleGetOrg(activeOrg)
    },
    orgMembers: function(orgMembers) {
      this.getUsers(orgMembers)
    },

    /**
     * Watches url to get all statuses for organization
     */
    getDatasetStatusUrl: {
      handler: function(val) {
        if (val && this.activeOrgId && this.userToken) {
          this.getAllDatasetStatuses()
        }
      },
      immediate: true
    }
  },

  // needed for switching routes
  mounted() {
    this.handleGetOrg(this.activeOrganization)
    this.getUsers(this.orgMembers)
  },

  methods: {
    ...mapActions(['updateOrgMembers', 'updateOrgDatasetStatuses']),


    /**
     * Get all dataset status options for organization
     */
    getAllDatasetStatuses: function() {
      this.sendXhr(this.getDatasetStatusUrl).then(response => {
        this.updateOrgDatasetStatuses(response)
      })
      .catch(this.handleXhrError.bind(this))
    },

    /**
     * Adds a new status to the list and updates list in vuex
     */
    addStatus: function() {
      const status = {
        displayName: '',
        color: '#71747C',
        placeholder: 'Enter status name...',
        isNew: true
      }
      this.updateOrgDatasetStatuses([...this.orgDatasetStatuses, status])
      this.createdNewStatus = true
    },

    /**
     * Successful organization update callback
     * @param {Object} org
     */
    handleGetOrg: function(org) {
      const storage = pathOr(0, ['organization', 'storage'], org)
      let formattedStorage = this.formatMetric(storage).split(' ')
      if (!head(formattedStorage).match(/\d/)) {
        formattedStorage = [0, 'B']
      }
      this.storageNumber = defaultTo(0, head(formattedStorage))
      this.storageUnit = defaultTo('B', last(formattedStorage))

      const orgName = pathOr('', ['organization', 'name'], org)
      this.ruleForm.orgName = orgName
    },
    /**
     * Handles key-pressed event
     */
    onHandleKeyPressed: function() {
      this.updateOrg('orgSettingsForm')
    },
    /**
     * Updates the organization
     * @param {String} formName
     */
    updateOrg: function(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) {
          return
        }
        this.updateOrgRequest()
      })
    },
    /**
     * Generates org data GET url
     */
    orgUrl: function() {
      if (!this.activeOrganization.organization || !this.userToken) {
        return ''
      }
      return `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}?api_key=${this.userToken}`
    },
    /**
     * Update organization request
     */
    updateOrgRequest: function() {
      const url = this.orgUrl()
      this.sendXhr(url, {
        method: 'PUT',
        body: {
          name: this.ruleForm.orgName
        }
      })
        .then(() => {
          EventBus.$emit('toast', {
            detail: {
              type: 'MESSAGE',
              msg: `${this.ruleForm.orgName} updated`
            }
          })
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Makes call to resort table by column
     * @param {String} key
     */
    sortColumn: function(key) {
      this.offset = 0
      this.allPeople = this.returnSort(key, this.allPeople)
    },
    /**
     * Creates XHR calls to get invited users and current organization members
     * @param {Array} orgMembers
     */
    getUsers: function(orgMembers) {
      const members = this.updateCurrentMembers(orgMembers)
      this.allPeople = this.returnSort('lastName', members, 'asc')
      this.$nextTick(() => {
        this.isLoading = false
      })
    },
    /**
     * Updates current users object with any missing fields required for sorting
     * @param {Array} users
     * @returns {Array}
     */
    updateCurrentMembers: function(users) {
      return users.map(member => {
        const role = this.getOrgRole(member, this.activeOrganization)
        let newFields = { role }
        if (!member.storage) {
          newFields = {
            storage: 0,
            role
          }
        }
        return Object.assign({}, newFields, member)
      })
    },
    /**
     * Sets the active dataset template for the menu clicked
     * @param {Object} row
     */
    setActiveDatasetTemplate: function(row) {
      this.activeDatasetTemplate = row
    },
    /**
     * Handler for file menu click
     * @param {String} name
     */
    onDatasetTemplateMenuClick: function(name) {
      const options = {
        update: this.onUpdateDatasetTemplate,
        delete: this.onDeleteDatasetTemplate
      }

      const handler = options[name]

      if (typeof handler === 'function') {
        handler()
      }
    },

    /**
     * Update dataset template
     */
    onUpdateDatasetTemplate: function() {
      this.isDatasetTemplateDialogVisible = true
    },

    /**
     * Delete dataset template
     */
    onDeleteDatasetTemplate: function() {
      this.isDeleteDatasetTemplateDialogVisible = true
    },

    /**
     * handle changing the page of results
     * @param {Number} page
     */
    onPaginationPageChange: function(page) {
      this.offset = (page - 1) * this.limit
    },

    /**
     * handle changing the number of results per page
     * @param {Number} limit
     */
    onUpdateLimit: function(limit) {
      this.offset = 0
      this.limit = limit
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/variables.scss';

.org-name {
  max-width: 330px;
}

.org-wrap {
  p {
    margin-bottom: 28px;
  }
}

.buttons {
  margin-top: 32px;

  .primary {
    margin-right: 16px;
  }
}

::placeholder {
  font-style: italic;
}

.bf-menu {
  width: 202px;
  height: 99px;
  font-size: 14px;
  font-weight: normal;
  line-height: 32px;
  color: #000000;
  padding-top: 0;
}

.divider {
  background: $cortex;
  height: 1px;
  margin: 50px 1px 40px 1px;
}
.storage-used {
  color: $glial;
  font-size: 12px;
  line-height: 14px;
}
.storage-display {
  line-height: 24px;
}
.storage-display .number {
  font-size: 28px;
}
.storage-display .unit {
  font-size: 12px;
  text-transform: uppercase;
}
.storage-display-wrap {
  padding: 16px;
  background: $white-matter;
  border: solid 1px $cortex;
  border-radius: 5px;
  width: 296px;
  margin-bottom: 50px;
}
.col-spacer {
  height: 17px;
}
.dataset-templates {
  margin-top: 50px;
}
p {
  color: $myelin;
  font-size: 14px;
  font-weight: normal;
  line-height: 18px;
}
.pagination-header {
  display: flex;
  justify-content: space-between
}
</style>
