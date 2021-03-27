<template>
  <div class="search-all-data-recent-search">
    <div class="search-all-data-recent-search-content">
      <button
        class="search-all-data-recent-search-text mb-8"
        @click="$emit('click')"
      >
        Search for <strong>{{ search.model }}</strong>
        <template v-if="hasFilters">
          with filters
          <strong
            v-for="(filter, idx) in search.filters"
            :key="filter.id"
          >
            {{ filter.targetLabel }}
            {{ filter.propertyLabel }}
            {{ filter.operationLabel }}
            {{ formatValue(filter) }}<template v-if="idx+1 !== search.filters.length">
              ,
            </template>
          </strong>
        </template>
      </button>
      <p class="search-all-data-recent-search-date mb-0">
        {{ formatDate(search.date) }}
      </p>
    </div>
  </div>
</template>

<script>
import {
  compose,
  head,
  not,
  pathOr,
  propEq,
  propOr
} from 'ramda'

import FormatDate from '@/mixins/format-date/index'

/**
 * Compute if the search has a target value
 * @param {Object}
 * @returns {Boolean}
 */
const hasTargetValue = (search) => {
  return compose(
    not,
    propEq('target', ''),
    head,
    propOr([], 'filters')
  )(search)
}

export default {
  name: 'SearchAllDataRecentSearch',

  mixins: [
    FormatDate
  ],

  props: {
    search: {
      type: Object,
      default: () => {
        return {
          date: null,
          filters: [],
          modeel: ''
        }
      }
    }
  },

  computed: {
    /**
     * Compute if the search has filters
     * This is to account for searches with no filters
     * @returns {Boolean}
     */
    hasFilters: function() {
      return this.search.filters.length === 1
        ? hasTargetValue(this.search)
        : this.search.filters.length
    }
  },

  methods: {
    /**
     * Format valuee based on the property type
     * @param {Object} filter
     */
    formatValue: function(filter) {
      const type = pathOr('', ['propertyType', 'type'], filter)
      const value = propOr('', 'value', filter)

      return type === 'Date'
        ? this.formatDate(value)
        : value
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.search-all-data-recent-search {
  color: $myelin;
  display: flex;
  overflow: hidden;
}
.search-all-data-recent-search-content {
  flex: 1;
  overflow: hidden;
}
.search-all-data-recent-search-text {
  color: inherit;
  cursor: pointer;
  display: block;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  &:hover,
  &:focus {
    color: $app-primary-color;
    text-decoration: underline
  }
}
.search-all-data-recent-search-date {
  color: $glial;
}
</style>
