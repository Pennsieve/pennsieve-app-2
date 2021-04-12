<template>
  <div
    id="inputAddContributor"
    class="dataset-settings-contributors"
  >
    <h4>Contributors</h4>
    <p class="mb-16">
      A list of the people who have helped create this dataset. Contributors will appear in Pennsieve Discover if your dataset is published.
    </p>

    <div class="contributor-input-wrap mb-16">
      <el-select
        ref="select"
        v-model="selectedContributor"
        class="mr-16 add-contributor bf-menu"
        required
        filterable
        :default-first-option="true"
        value-key="email"
        placeholder="Find and Add Existing People"
        popper-class="add-contributor-dropdown"
        no-match-text="We couldn’t find anyone with that name. You can add more people to your organization or Create an External Contributor."
        :disabled="datasetLocked"
        @change="onSelectContributor"
      >
        <svg-icon
          slot="prefix"
          icon="icon-magnifying-glass"
          class="search-icon"
          height="24"
          width="24"
        />

        <el-option-group
          v-if="filteredMembers.length > 0"
          class="bf-menu"
          :label="organizationLabel"
        >
          <el-option
            v-for="item in filteredMembers"
            :key="item.id"
            :label="displayName(item)"
            :value="item"
          >
            <!-- eslint-disable-next-line --><!-- highlight sanitizes -->
            <div v-html="highlight(searchText, displayName(item))" />
          </el-option>
        </el-option-group>

        <el-option-group
          v-if="filteredOrgContributors.length > 0"
          class="bf-menu"
          label="External Contributors"
        >
          <el-option
            v-for="item in filteredOrgContributors"
            :key="item.contributorId"
            :label="displayName(item)"
            :value="item"
          >
            <!-- eslint-disable-next-line --><!-- highlight sanitizes -->
            <div v-html="highlight(searchText, displayName(item))" />
          </el-option>
        </el-option-group>
      </el-select>

      <bf-button
        :disabled="datasetLocked"
        @click="isContributorDialogVisible = true"
      >
        Create Contributor
      </bf-button>
    </div>

    <div v-loading="isLoadingDatasetContributors">
      <contributor-row
        v-for="(contributor, idx) in datasetContributors"
        :key="contributor.id"
        :contributor="contributor"
        :can-move-up="idx > 0"
        :can-move-down="idx < datasetContributors.length - 1"
        @remove-contributor="removeContributor"
        @edit-contributor="onEditContributorClick"
        @move-up="moveContributor('up', $event)"
        @move-down="moveContributor('down', $event)"
      />

      <contributor-dialog
        :visible.sync="isContributorDialogVisible"
        :contributor.sync="editingContributor"
        :org-contributors="orgContributors"
        @add-contributor="createContributor"
        @edit-contributor="editContributor"
      />
    </div>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapState
} from 'vuex'
import {
  clone,
  compose,
  merge,
  pathOr,
  pick,
  find,
  findIndex,
  pathEq,
  prop,
  propEq,
  propOr
} from 'ramda'

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import ContributorRow from './ContributorRow/ContributorRow.vue'
import ContributorDialog from './ContributorDialog/ContributorDialog.vue'

import HighlightText from '@/mixins/highlight-text'
import Sorter from '@/mixins/sorter'
import Request from '@/mixins/request'
import EventBus from '@/utils/event-bus'
import { displayNameAndDegree } from '@/utils/displayNameAndDegree'

/**
 * Transform member to contributor
 * @param {Object} member
 * @returns {Object}
 */
const transformMemberToContributor = (member = {}) => {
  const userId = propOr(null, 'intId', member)
  const orcid = pathOr('', ['orcid', 'orcid'], member)

  return compose(
    merge({ orcid, userId }),
    pick(['firstName', 'lastName', 'email'])
  )(member)
}

export default {
  name: 'DatasetSettingsContributors',

  components: {
    BfButton,
    ContributorDialog,
    ContributorRow
  },

  mixins: [
    HighlightText,
    Sorter,
    Request
  ],

  data: function() {
    return {
      searchText: '',
      selectedContributor: {},
      editingContributor: {},
      isContributorDialogVisible: false
    }
  },

  computed: {
    ...mapState([
      'config',
      'orgMembers',
      'userToken',
      'dataset',
      'activeOrganization',
      'datasetContributors',
      'isLoadingDatasetContributors',
      'orgContributors'
    ]),

    ...mapGetters([
      'datasetOwner',
      'datasetLocked'
    ]),

    /**
     * Compute organization label
     * @returns {String}
     */
    organizationLabel: function() {
      const name = pathOr('Your Organization', ['organization', 'name'], this.activeOrganization)

      return `People at ${name}`
    },

    /**
     * Compute members list without users who have already been added
     * @returns {Array}
     */
    filteredMembers: function() {
      return this.filterAndSort(['email'], this.orgMembers, 'lastName')
    },

    /**
     * Compute organization contributors list
     * without users who have already been added
     * @returns {Array}
     */
    filteredOrgContributors: function() {
      const dedupedContributors = this.orgContributors.filter(item => {
        return findIndex(propEq('email', item.email), this.orgMembers) < 0
      })

      return this.filterAndSort(['email'], dedupedContributors, 'lastName')
    },

    /**
     * Compute create contributors URL
     * @returns {String}
     */
    contributorsUrl: function() {
      return `${this.config.apiUrl}/contributors?api_key=${this.userToken}`
    },

    /**
     * Compute contributors URL
     * @returns {String}
     */
    datasetContributorsUrl: function() {
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      return this.userToken
        ? `${this.config.apiUrl}/datasets/${datasetId}/contributors?api_key=${this.userToken}`
        : ''
    }
  },

  methods: {
    ...mapActions([
      'addOrgContributor',
      'updateDatasetContributor'
    ]),

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
      this.datasetContributors.forEach(item => {
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
     * Builds the user's full name
     * @param {Object} member
     */
    displayName: function(member) {
      return displayNameAndDegree(member)
    },

    /**
     * Select member callback
     * @params {Object} contributor
     */
    onSelectContributor: function(contributor) {
      const id = propOr('', 'id', contributor)

      if (typeof id === 'string') {
        this.selectMember(contributor)
      } else {
        this.addContributor(contributor)
      }
      this.selectedContributor = {}
    },

    selectMember: function(member) {
      const contributor = find(propEq('email', member.email), this.orgContributors)

      if (contributor) {
        this.addContributor(contributor)
      } else {
        const transformedMember = transformMemberToContributor(member)
        this.createContributor(transformedMember)
      }
    },

    /**
     * Create contributor for dataset
     * @param {Object} contributor
     */
    createContributor: function(contributor) {
      this.sendXhr(this.contributorsUrl, {
        method: 'POST',
        body: contributor
      })
        .then(response => {
          this.addContributor(response)
          this.addOrgContributor(response)
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Send API request to add contributor
     * @param {Object} contributor
     */
    addContributor: function(contributor) {
      const contributorId = propOr(0, 'id', contributor)

      this.sendXhr(this.datasetContributorsUrl, {
        method: 'PUT',
        body: {
          contributorId
        }
      })
        .then(response => {
          this.$store.dispatch('addContributor', response)
            .then(() => {
              this.isContributorDialogVisible = false
            })
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Remove contributor from dataset
     * @param {Object} contributor
     */
    removeContributor: function(contributor) {
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const contributorId = propOr(0, 'id', contributor)
      const url = `${this.config.apiUrl}/datasets/${datasetId}/contributors/${contributorId}?api_key=${this.userToken}`

      this.sendXhr(url, {
        method: 'DELETE'
      })
        .then(() => {
          this.$store.dispatch('removeContributor', contributorId)
        })
        .catch(this.handleXhrError.bind(this))
    },

    onEditContributorClick: function(contributor) {
      this.editingContributor = contributor
      this.isContributorDialogVisible = true
    },

    /**
     * Edit contributor for dataset
     * @param {Object} contributor
     */
    editContributor: function(contributor) {
      const url =  `${this.config.apiUrl}/contributors/${contributor.id}?api_key=${this.userToken}`

      this.sendXhr(url, {
        method: 'PUT',
        body: contributor
      })
        .then(response => {
          this.updateDatasetContributor(response)

          EventBus.$emit('toast', {
            detail: {
              type: 'success',
              msg: `${response.firstName} ${response.lastName} has been updated.`
            }
          })

          this.isContributorDialogVisible = false
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Move order of the contributor
     * @param {String} dir
     * @param {Object} contributor
     */
    moveContributor: function(dir, contributor) {
      const id = contributor.id
      const contributorIdx = this.datasetContributors.findIndex(contributor => contributor.id === id)

      const otherContributorIdx = dir === 'down'
        ? contributorIdx + 1
        : contributorIdx - 1

      const otherContributor = this.datasetContributors[otherContributorIdx]
      const datasetId = this.dataset.content.id

      if (otherContributor && datasetId) {

        const url =  `${this.config.apiUrl}/datasets/${datasetId}/contributors/switch?api_key=${this.userToken}`
        this.sendXhr(url, {
          method: 'POST',
          body: {
            contributorId: id,
            otherContributorId: otherContributor.id
          }
        })
          .then(() => {
            EventBus.$emit('get-dataset-contributors', datasetId)
          })
          .catch(this.handleXhrError.bind(this))
      } else {
        EventBus.$emit('toast', {
          detail: {
            type: 'error',
            msg: `An error has occurred. Please try again.`
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.contributor-input-wrap {
  display: flex;
  justify-content: space-between;
}
.add-contributor {
  flex: 1;
  max-width: 475px;
  /deep/ .el-input__prefix {
    display: flex;
    .svg-icon {
      align-self: center;
    }
  }
}
</style>
<style lang="scss">
@import '../../../../assets/_variables.scss';
.add-contributor-dropdown {
  .el-select-group__title {
    color: $gray_4;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    padding: 8px 16px;
  }
  .el-select-dropdown__empty {
    box-sizing: border-box;
    max-width: 474px;
  }
}
</style>
