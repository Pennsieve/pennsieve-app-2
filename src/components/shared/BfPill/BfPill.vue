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
  color: $myelin;
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  padding: 2px 11px;
  &.green {
    background: #9fe2be;
  }
  &.yellow {
    background: $warning;
  }
  &.red {
    background: $synapse;
    color: #fff;
  }
  &.blue {
    background: $app-primary-color;
    color: #fff;
  }
}
</style>
