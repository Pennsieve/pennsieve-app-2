<template>
  <div class="sidebar-empty-state">
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'SidebarEmptyState'
  }
</script>

<style scoped lang="scss">
  .sidebar-empty-state {
    padding: 0 20px;
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
</style>
