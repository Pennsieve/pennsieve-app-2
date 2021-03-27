<template>
  <div class="bf-progress-bar">
    <div
      class="bar"
      :style="{ width: Math.ceil(progress) + '%' }"
    />
  </div>
</template>

<script>
  export default {
    name: 'BfProgressBar',

    props: {
      /**
       * Amount loaded
       */
      loaded: Number,
      /**
       * Total size of item
       */
      total: Number
    },

    computed: {
      /**
       * Compute progress
       * @returns {number}
       */
      progress: function () {
        return (this.loaded / this.total) * 100
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .bf-progress-bar {
    background: #EFF1F3;
    border-radius: 3px;
    display: inline-block;
    height: 8px;
    overflow: hidden;
    width: 70px;
    .bar {
      background: $nucleus;
      height: 100%;
      width: 0;
    }
  }
</style>
