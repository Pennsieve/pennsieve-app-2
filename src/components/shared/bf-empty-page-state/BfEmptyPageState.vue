<template>
  <div class="bf-empty-page-state">
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'BfEmptyPageState'
  }
</script>

<style scoped lang="scss">
  .bf-empty-page-state {
    font-size: 14px;
    line-height: 24px;
    margin: 0 auto;
    max-width: 720px;
    width: 100%;
    padding-top: 48px;
    text-align: center;
    color: #71747C;
    display: flex;
    flex-direction: column;
  }
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px;
  }
  img {
    display: inline-block;
    height: 73px;
    margin-bottom: 10px;
    width: auto;
  }
</style>
