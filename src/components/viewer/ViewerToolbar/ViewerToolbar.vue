<template>
  <div class="viewer-toolbar">
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'ViewerToolbar',


  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .viewer-toolbar {
    align-items: center;
    background: #F7F7F7;
    display: flex;
    flex-direction: column;
    padding: 10px;
    width: 20px;
    &.left {
      border-right: 2px solid $light-gray;
    }
    &.right {
      border-left: 2px solid $light-gray;
    }
  }
</style>
