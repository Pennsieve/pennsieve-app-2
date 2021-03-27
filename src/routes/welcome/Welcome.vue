<template>
  <div class="welcome-wrapper">
    <svg-icon
      name="pennsieve-logo"
      class="welcome-logo"
    />
    <router-view name="stage" />
  </div>
</template>

<script>
import SetupProfile from '../../components/SetupProfile/SetupProfile.vue'
  export default {
    name: 'WelcomePage',
  }
</script>

<style scoped lang="scss">
  @import '../../assets/_variables.scss';

  .welcome-wrapper {
     background: $neuron;

     .welcome-logo {
      height: 20px;
      width: 28px;
      position: fixed;
      top: 20px;
      left: 20px;
     }
  }
</style>
