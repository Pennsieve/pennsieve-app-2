<template>
  <svg
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
    class="bf-icon-waiting"
  >
    <circle
      ref="icon"
      cx="9"
      cy="9"
      r="8"
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      opacity=".65"
    />
  </svg>
</template>

<script>
  import anime from 'animejs';

  export default {
    name: 'BfIconWaiting',

    computed: {
      /**
       * Waiting animation
       * @returns {Object}
       */
      animation: function() {
        const icon = this.$refs.icon;

        return anime.timeline({
          easing: 'linear',
          loop: true
        })
        // Breath in
        .add({
          targets: icon,
          strokeWidth: 6,
          opacity: 1,
          r: 6,
          delay: 1000,
          duration: 1000
        })
        // Breath out (back to default)
        .add({
          targets: icon,
          strokeWidth: 2,
          opacity: .65,
          r: 8,
          delay: 500,
          duration: 500
        });
      }
    },

    mounted: function() {
      this.animation.play()
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .bf-icon-waiting {
    color: $app-primary-color;
    display: inline-block;
    height: 18px;
    width: 18px;
  }
</style>
