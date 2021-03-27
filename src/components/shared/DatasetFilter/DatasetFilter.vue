<template>
  <div class="dataset-filter">
    <el-input
      v-model="value"
      class="dataset-filter-input"
      :placeholder="placeholder"
      @input="updateFilterName"
    >
      <svg-icon
        slot="prefix"
        name="icon-magnifying-glass"
        dir="up"
        color="#404554"
        height="24"
        width="24"
      />
    </el-input>

    <el-dropdown
      trigger="click"
      placement="bottom-end"
      @command="$emit('update:filterOwner', $event)"
      @visible-change="datasetFilterOpen = $event"
    >
      <button class="dataset-filter-dropdown el-dropdown-link">
        <span>{{ datasetFilterCopy }}</span>
        <svg-icon
          name="icon-arrow-up"
          :dir="datasetFilterArrowDir"
          height="10"
          width="10"
        />
      </button>
      <el-dropdown-menu
        slot="dropdown"
        class="bf-menu"
        :offset="14"
        :arrow-offset="150"
      >
        <template>
          <el-dropdown-item
            class="icon-item"
            command="my-datasets"
          >
            My datasets
            <svg-icon
              v-if="filterOwner === 'my-datasets'"
              icon="icon-check"
              class="dataset-filter-icon-check"
              width="20"
              height="20"
            />
          </el-dropdown-item>
          <el-dropdown-item
            class="icon-item"
            command="all-datasets"
          >
            All datasets
            <svg-icon
              v-if="filterOwner === 'all-datasets'"
              icon="icon-check"
              class="dataset-filter-icon-check"
              width="20"
              height="20"
            />
          </el-dropdown-item>
          <template v-if="!statusFilter">
            <el-dropdown-item
              v-for="status in statusList"
              :key="status.id"
              class="status-item"
              :command="getStatusCommand(status)"
            >
              <span
                class="status-dot"
                :style="getDotColor(status)"
              />
              {{ status.displayName }}
              <svg-icon
                v-if="filterOwner === `${status.displayName}`"
                icon="icon-check"
                class="dataset-filter-status-check"
                width="20"
                height="20"
              />
            </el-dropdown-item>
          </template>
        </template>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dropdown
      trigger="click"
      placement="bottom-end"
      @command="setSort"
      @visible-change="datasetSortOpen = $event"
    >
      <button class="dataset-filter-dropdown el-dropdown-link">
        <span>{{ datasetSortCopy }}</span>
        <svg-icon
          name="icon-arrow-up"
          :dir="datasetSortArrowDir"
          height="10"
          width="10"
        />
      </button>
      <el-dropdown-menu
        slot="dropdown"
        class="bf-menu"
        :offset="14"
        :arrow-offset="170"
      >
        <el-dropdown-item
          v-for="option in sortOptions"
          :key="option.value"
          class="icon-item"
          :command="option"
        >
          {{ option.label }}
          <svg-icon
            v-if="sortBy === option.value"
            icon="icon-check"
            class="dataset-filter-icon-check"
            width="20"
            height="20"
          />
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <button
      class="button-icon small icon-sort"
      @click="$emit('set-sort', sortBy)"
    >
      <svg-icon
        name="icon-sort"
        :class="[ sortIconDirection === 'down' ? 'svg-flip' : '' ]"
        color="currentColor"
        :dir="sortIconDirection"
        height="24"
        width="24"
      />
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  defaultTo,
  compose,
  propEq,
  propOr,
  find,
  head
} from 'ramda'
import debounce from 'lodash/debounce'

export default {
  name: 'DatasetFilter',

  props: {
    filterName: {
      type: String,
      default: ''
    },
    filterOwner: {
      type: String,
      default: ''
    },
    sortBy: {
      type: String,
      default: ''
    },
    sortDirection: {
      type: String,
      default: ''
    },
    sortOptions: {
      type: Array,
      default: () => []
    },
    statusFilter: {
      type: Boolean,
      default: false
    },
    statusList: {
      type: Array,
      default: () => []
    }
  },

  data: function() {
    return {
      value: '',
      datasetFilterOpen: false,
      datasetSortOpen: false,
      datasetSortCopy: '',
    }
  },

   computed: {
     ...mapState([
       'datasetFilters'
     ]),

    /**
     * Compute dataset filter dropdown copy
     * @returns {String}
     */
    datasetFilterCopy: function() {
        if (this.filterOwner === 'all-datasets') {
          return 'Show All datasets'
        } else if (this.filterOwner === 'my-datasets') {
          return 'Show My datasets'
        } else {
          return `Show ${this.filterOwner}`
        }
    },

    /**
     * Compute placeholder value
     */
    placeholder: function() {
      return 'Find a dataset by name...'
    },

    /**
     * Compute dataset filter arrow direction
     * @returns {String}
     */
    datasetFilterArrowDir: function() {
      return this.datasetFilterOpen ? 'up' : 'down'
    },

    /**
     * Compute dataset sort arrow direction
     * @returns {String}
     */
    datasetSortArrowDir: function() {
      return this.datasetSortOpen ? 'up' : 'down'
    },

    /**
     * Compute dataset icon sort direction
     * @returns {String}
     */
    sortIconDirection: function() {
      return this.sortDirection === 'asc' ? 'up' : 'down'
    }
  },

  mounted: function() {
    if (this.isWorkspaceList) {
      this.datasetSortCopy = compose(
        propOr('Sort by Name', 'label'),
        defaultTo({}),
        head(),
        defaultTo([])
      )(this.sortOptions)
    } else {
      // Set filter name based off of stored value
      const filterName = propOr('', 'filterName', this.datasetFilters)
      this.value = filterName
      this.$emit('update:filterName', filterName)

      const sortBy = propOr('', 'sortBy', this.datasetFilters)
      this.datasetSortCopy = compose(
        propOr('Sort by Name', 'label'),
        find(propEq('value', sortBy)),
        defaultTo([])
      )(this.sortOptions)
    }
  },

  methods: {

    /**
     * Returns dataset status displayName based on dropdown selection
     * @returns {String}
     */
    getStatusCommand: function(status) {
      return status.displayName
    },

    /**
     * Returns status dot styling based on status color
     * @returns {Object}
     */
    getDotColor: function(status) {
      const obj = {
        backgroundColor: `${status.color}`
      }

      return obj
    },

    setSort: function(evt) {
      this.datasetSortCopy = evt.label
      this.$emit('update:sortBy', evt.value)
    },

    /**
     * Update the filter name by emitting
     * event for parent to pick up
     */
    updateFilterName: debounce(
      function(val) {
        this.$emit('update:filterName', val)
      },
      200
    )
  }
}
</script>

<style lang="scss">
@import '../../../assets/_variables.scss';
@import '../../../assets/components/_dataset-status.scss';

.dataset-filter {
  align-items: center;
  display: flex;
  flex: 1;

  .dataset-filter-input {
    max-width: 400px;
    .el-input__prefix {
      align-items: center;
      display: flex;
      left: 8px;
    }
    &.el-input--prefix .el-input__inner {
      border: 1px solid $cortex;
      padding-left: 40px;
    }
  }
  .dataset-filter-dropdown {
    align-items: center;
    color: $dark-gray;
    display: inline-flex;
    margin-left: 24px;
    font-size: inherit;
    &:hover,
    &:focus {
      color: $app-primary-color;
    }
    .svg-icon {
      margin-left: 8px;
    }
  }
  .icon-sort {
    color: $glial;
    margin-left: 8px;
  }
}

.bf-menu {
  .el-dropdown-menu__item--divided {
    margin-top: 0;
    &:before {
      content: none;
    }
  }
}

.status-item {
  text-indent: 23px;
}

.dot {
  height: 10px;
  width: 10px;
  margin-right: 4px;
  border-radius: 50%;
  display: inline-block;
}

.no-status-item {
  .dot {
    background-color: #d2d2d2;
  }
}

.wip-item {
  .dot {
    background-color: $dopamine;
  }
}

.in-review-item {
  .dot {
    background-color: #FFB000;
  }
}

.completed-item {
  .dot {
    background-color: #17BB62;
  }
}

.dataset-filter-icon-check {
  margin: -2px 0;
}

.dataset-filter-status-check {
  margin: -2px 0;
  float: right;
}
</style>
