<template>
  <div
    v-if="hasFeature('sandbox_org_feature')"
    class="sandbox-banner"
  >
    You are in a Sandbox organization with restricted access. Contact us to request your own organization with full access&nbsp;
    <a href="#" @click.prevent="showIntercom">
        here
    </a>
    .
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    computed: {
      ...mapGetters(['hasFeature'])
    },
    
    methods: {
      /**
      * Show intercom window
      */
      showIntercom: function() {
        window.Intercom('show')
      },
    }
  }
</script>

<style scoped lang="scss">
  @import '../../assets/_variables';

  .sandbox-banner {
    background-color: $status_yellow;
    padding: 18px 0 21px 0;
    color: white;
    display: flex;
    justify-content: center;
    font-weight: bold;
    a {
      color: white;
      text-decoration: underline;
    }
  }
</style>
