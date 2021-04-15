<template>
  <div class="slat-info">
    <slot />
    <div
      v-if="$slots['info']"
      class="info"
    >
      <slot name="info" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'SlatInfo'
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .slat-info {
    border-top: 1px solid $gray_2;
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    &:first-child {
      border: none
    }
  }
  .info {
    text-align: right;
  }
</style>
