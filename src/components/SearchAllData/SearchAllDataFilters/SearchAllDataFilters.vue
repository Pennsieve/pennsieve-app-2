<template>
  <div class="search-all-data-filters">
    <h3>
      Filters
      <el-tooltip
        placement="right"
        content="Results will match all of the filters applied."
      >
        <svg-icon
          class="icon-filters"
          icon="icon-info-small"
          height="24"
          width="24"
        />
      </el-tooltip>
    </h3>

    <div>
      <search-filter
        v-for="(filter, idx) in filters"
        :key="filter.id"
        ref="filters"
        v-model="filters[idx]"
        class="mb-16"
        :targets="targets"
        :is-loading-targets="isLoadingTargets"
        :disabled="disabled"
        @delete="$emit('delete-filter', idx)"
        @enter="$emit('enter')"
      />
    </div>
  </div>
</template>

<script>
import {
  pathOr
} from 'ramda'

import SearchFilter from '@/components/SearchAllData/SearchFilter/SearchFilter.vue'

/**
 * Transform datasets to a normalized object
 * This is used for displaying the item
 * in a list along with models
 * @param {Array} datasets
 * @returns {Array}
 */
const transformDatasets = (datasets) => datasets.map(dataset => {
  const value = pathOr('', ['content', 'id'], dataset)
  const label = pathOr('', ['content', 'name'], dataset)
  const intId = pathOr(0, ['content', 'intId'], dataset)
  return {
    value,
    label,
    intId
  }
})

export default {
  name: 'SearchAllDataFilters',

  components: {
    SearchFilter
  },

  model: {
    prop: 'filters'
  },

  props: {
    filters: {
      type: Array,
      default: () => []
    },
    datasets: {
      type: Array,
      default: () => []
    },
    isLoadingTargets: {
      type: Boolean,
      default: false
    },
    models: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    /**
     * Compute all filter items
     * @returns {Array}
     */
    targets: function() {
      return [
        {
          label: 'Models',
          type: 'model',
          items: this.models
        },
        {
          label: 'Datasets',
          type: 'dataset',
          items: transformDatasets(this.datasets)
        }
      ]
    }
  },

  methods: {
    /**
     * Focus on the last filter
     * @param {Number} idx
     */
    focusFilter: function(idx = 0) {
      const filter = this.$refs.filters[idx]

      if (filter) {
        filter.focus()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.filter-actions {
  display: flex;
  .bf-button:first-child {
    margin-right: 16px;
  }
}
h3 {
  align-items: center;
  display: flex;
}
.icon-filters {
  color: $myelin;
  margin: -6px -6px -6px 0;
}
</style>
