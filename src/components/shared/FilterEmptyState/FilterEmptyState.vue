<template>
  <div class="filter-empty-state">
    <img
      src="/static/images/illustrations/illo-search.svg"
      alt="No results found illustration"
      height="80"
      width="101"
    >
    <!-- <h3>{{ heading }}</h3>
    <p>{{ copy }}</p> -->
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'FilterEmptyState',

    props: ['heading', 'copy']
  }
</script>

<style scoped lang="scss">
  .filter-empty-state {
    padding: 64px 56px;
    text-align: center;
  }
  img {
    display: block;
    margin: 0 auto 16px;
  }
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px;
  }
  p {
    margin: 0;
  }
</style>
