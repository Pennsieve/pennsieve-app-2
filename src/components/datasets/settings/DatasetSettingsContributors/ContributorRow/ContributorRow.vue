<template>
  <slat-info class="contributor-row">
    <div class="contributor-info-wrap">
      <div
        class="mr-8"
      >
        <svg-icon
          class="icon-orcid"
          :class="{ 'has-orcid': hasOrcidId }"
          icon="icon-orcid"
          height="32"
          width="32"
        />
      </div>
      <div class="contributor-info">
        <h3 class="mb-0 mt-0">
          {{ displayName }}
        </h3>
        <ul class="contributor-meta unstyled">
          <li>{{ contributorTypeLabel }}</li>
          <li v-if="isDatasetOwner">
            Dataset owner
            <a
              href="https://docs.pennsieve.io/docs/transfer-ownership-of-a-dataset"
              target="_blank"
            >
              What's this?
            </a>
          </li>
          <li v-if="shouldShowEmail">
            {{ contributor.email }}
          </li>
        </ul>
      </div>
    </div>
    <el-dropdown
      slot="info"
      trigger="click"
      placement="bottom-end"
      @command="onMenuSelect"
    >
      <button class="el-dropdown-link">
        <svg-icon
          name="icon-menu"
          height="20"
          width="20"
        />
      </button>
      <el-dropdown-menu
        slot="dropdown"
        class="bf-menu"
        :offset="9"
      >
        <el-dropdown-item
          :disabled="datasetLocked"
          command="edit-contributor"
        >
          Update
        </el-dropdown-item>
        <el-dropdown-item
          :disabled="datasetLocked"
          command="remove-contributor"
        >
          Delete
        </el-dropdown-item>
        <el-dropdown-item
          v-if="canMoveUp"
          :disabled="datasetLocked"
          command="move-up"
        >
          Move Up
        </el-dropdown-item>
        <el-dropdown-item
          v-if="canMoveDown"
          :disabled="datasetLocked"
          command="move-down"
        >
          Move Down
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </slat-info>
</template>

<script>
import {
  compose,
  has,
  not,
  prop,
  propOr
} from 'ramda'
import {
  mapGetters,
  mapState
} from 'vuex'

import SlatInfo from '@/components/shared/SlatInfo/SlatInfo.vue'
import { displayNameAndDegree } from '@/utils/displayNameAndDegree'

export default {
  name: 'ContributorRow',

  components: {
    SlatInfo
  },

  props: {
    contributor: {
      type: Object,
      default: function() {
        return {
          contributorId: null,
          email: '',
          firstName: '',
          lastName: '',
          orcid: '',
          userId: ''
        }
      }
    },
    canMoveUp: {
      type: Boolean,
      default: true
    },
    canMoveDown: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    ...mapState([
      'dataset'
    ]),

    ...mapGetters([
      'datasetOwner', 'datasetLocked'
    ]),

    /**
     * Compute if the contributor is the dataset's owner
     * @returns {Boolean}
     */
    isDatasetOwner: function() {
      const contributorId = this.contributor.userId
      return contributorId
        ? this.datasetOwner.intId === contributorId
        : false
    },

    /**
     * Compute the user's full name
     * @returns {String}
     */
    displayName: function() {
      return displayNameAndDegree(this.contributor)
    },

    /**
     * Compute if the contributor has ORCID id
     * @returns {Boolean}
     */
    hasOrcidId: function() {
      return Boolean(prop('orcid', this.contributor))
    },

    /**
     * Compute if the contributor is an external user
     * @returns {Boolean}
     */
    isExternal: function() {
      return compose(
        not,
        has('userId')
      )(this.contributor)
    },

    /**
     * Compute the label for the type of the contributor
     * @returns {String}
     */
    contributorTypeLabel: function() {
      return this.isExternal
        ? 'External Contributor'
        : 'Pennsieve'
    },

    /**
     * Compute whether the email should be shown
     * @returns {Boolean}
     */
    shouldShowEmail: function() {
      return this.isExternal && this.contributor.email !== ''
    }
  },

  methods: {
    /**
     * When the user selects an option from
     * the menu, emit an event
     */
    onMenuSelect: function(command) {
      this.$emit(command, this.contributor)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../../assets/_variables.scss';

.slat-info.contributor-row {
  align-items: center;
  color: $gray_6;
  padding: 16px 0;
}
.contributor-info-wrap {
  display: flex;
}
h3 {
  font-size: 14px;
  font-weight: 600;
}
.contributor-meta {
  li {
    display: inline-block;
    &:not(:first-child) {
      margin-left: 4px;
      &:before {
        content: '\2022';
        margin-right: 4px;
      }
    }
  }
}
.icon-orcid {
  fill: $gray_2;
  &.has-orcid {
    fill: #A6CE39
  }
}
</style>
