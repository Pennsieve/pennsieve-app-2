<template>
  <router-view
    name="stage"
    :integrations="integrations"
  />
</template>

<script>
  import {mapState} from "vuex";

  export default {
    name: 'Integrations',
    computed: {
      ...mapState('integrationsModule', [
        'integrations'
      ]),
    }
  }
</script>
