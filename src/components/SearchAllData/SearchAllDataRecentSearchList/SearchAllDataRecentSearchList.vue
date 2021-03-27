<template>
  <div class="search-all-data-recent-search-list">
    <template v-if="recentSearches.length">
      <h2>Recent Searches</h2>
      <search-all-data-recent-search
        v-for="search in recentSearches"
        :key="search.id"
        class="mb-24"
        :search="search"
        @click="$emit('load-search', search)"
      />
    </template>
  </div>
</template>

<script>
import SearchAllDataRecentSearch from './SearchAllDataRecentSearch.vue'

export default {
  name: 'SearchAllDataRecentSearchList',

  components: {
    SearchAllDataRecentSearch
  },

  props: {
    recentSearches: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
}
</style>
