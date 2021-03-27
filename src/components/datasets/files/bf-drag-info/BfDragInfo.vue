<template>
  <div class="bf-drag-info">
    {{ dragInfo.name }}
    <span class="count">
      {{ dragInfo.count }}
    </span>
  </div>
</template>

<script>

  export default {
    name: 'BfDragInfo',

    props: {
      dragInfo: {
        type: Object,
        default: function() {
          return {}
        }
      }
    }
  }
</script>

<style scoed lang="scss">
  @import '../../../../assets/_variables.scss';

  .bf-drag-info {
    background: $neuron;
    color: #eee;
    padding: 7px 10px;
    position: fixed;
    z-index: -1;
    margin-top: 10px;
    .count {
      background: $app-primary-color;
      border-radius: 50%;
      color: $white-matter;
      height: 20px;
      font-size: 12px;
      line-height: 20px;
      position: absolute;
      text-align: center;
      top: -7px;
      right: -10px;
      width: 20px;
    }
  }
</style>
