<template>
  <slat-info class="contributor-row">
    <div class="contributor-info-wrap">
      <div
        class="mr-8"
      >
      </div>
      <div class="contributor-info">
        <h3 class="mb-0 mt-0">
          {{ displayName }}
        </h3>
        <ul class="contributor-meta unstyled">
          <li v-if="shouldShowEmail">
            {{ contributor.emailAddress }}
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
      <button class="el-dropdown-link" @click.prevent="">
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
          :disabled="proposalLocked"
          command="edit-contributor"
        >
          Update
        </el-dropdown-item>
        <el-dropdown-item
          :disabled="proposalLocked"
          command="remove-contributor"
        >
          Remove
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
  name: 'ProposalContributor',

  components: {
    SlatInfo
  },

  props: {
    id: {
      type: String,
      required: true
    },
    contributor: {
      type: Object,
      default: function() {
        return {
          contributorId: null,
          emailAddress: '',
          firstName: '',
          lastName: '',
          orcid: '',
          userId: ''
        }
      }
    },
  },

  computed: {
    ...mapState([
    ]),

    ...mapGetters([
    ]),

    /**
     * Compute the user's full name
     * @returns {String}
     */
    displayName: function() {
      return displayNameAndDegree(this.contributor)
    },

    /**
     * Compute whether the email should be shown
     * @returns {Boolean}
     */
    shouldShowEmail: function() {
      return this.contributor.emailAddress !== ''
    },

    proposalLocked: function() {
      return false
    },
  },

  methods: {
    /**
     * When the user selects an option from
     * the menu, emit an event
     */
    onMenuSelect: function(command) {
      this.$emit(command, {id: this.id, contributor: this.contributor})
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

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
