<template>
  <div class="bf-pill">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'BfPill'
}
</script>

<style lang="scss">
@import '../../../assets/_variables.scss';

.bf-pill {
  background: #f1f1f3;
  border-radius: 6px;
  color: $gray_6;
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  padding: 2px 11px;
  &.green {
    background: #9fe2be;
  }
  &.yellow {
    background: $status_yellow;
  }
  &.red {
    background: $red_1;
    color: #fff;
  }
  &.blue {
    background: $app-primary-color;
    color: #fff;
  }
}
</style>
