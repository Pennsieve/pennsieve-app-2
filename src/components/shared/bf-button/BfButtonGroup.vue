<template>
  <div class="button-group">
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'BfButtonGroup'
  }
</script>

<style scoped lang="scss">

  .button-group {
    display: flex;
    margin-left: 45px;
    margin-top: -3px;
  }

</style>