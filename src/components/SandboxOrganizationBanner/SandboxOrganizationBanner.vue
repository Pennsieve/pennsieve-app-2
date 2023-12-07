<template>
  <div v-if="hasFeature('sandbox_org_feature')" class="sandbox-banner">
    You are working in the Pennsieve Sandbox - Data can be removed
    periodically.&nbsp;
    <a href="https://docs.pennsieve.io/docs/pennsieve-sandbox" target="_blank">
      More Info
    </a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['hasFeature'])
  },

  methods: {}
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
