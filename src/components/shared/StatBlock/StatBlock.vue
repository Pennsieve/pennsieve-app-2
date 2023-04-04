<template>
  <div class="stat-block">
    <div class="stat">
      {{ stat }}
    </div>
    <span class="label">
      {{ label }}
    </span>
  </div>
</template>
<script>
  export default {
    name: 'StatBlock',
    props: [
      'stat',
      'label'
    ]
  }
</script>
<style lang="scss" scoped>
  .stat {
    color: white;
    font-weight: 500;
    font-size: 64px;
    margin: 0 0 16px;
    line-height: 1
  }
  .label {
    font-size: 13px;
  }
</style>