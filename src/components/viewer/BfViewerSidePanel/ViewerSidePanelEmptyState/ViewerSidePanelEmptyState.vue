<template>
  <div class="viewer-side-panel-empty-state">
    <div
      v-if="$slots.illustration.length"
      class="illustration"
    >
      <slot name="illustration" />
    </div>

    <slot />
  </div>
</template>

<script>
  export default {
    name: 'ViewerSidePanelEmptyState'
  }
</script>

<style scoped lang="scss">
  .viewer-side-panel-empty-state {
    display: flex;
    flex-direction: column;
    padding: 0 35px;
    position: absolute;
    text-align: center;
    top: 242px;
  }
  .illustration {
    margin-bottom: 13px;
  }
  p {
    margin: 0;
  }
</style>
