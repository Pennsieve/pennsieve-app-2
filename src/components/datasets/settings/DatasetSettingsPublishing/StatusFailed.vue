<template>
  <div class="sharing-status mb-8 mt-16">
    <svg-icon
      class="icon-status"
      name="icon-warning-circle"
      height="24"
      width="24"
      color="#e94b4b"
    />
    <strong class="mr-0">
      We encountered an issue trying to publish your dataset.
    </strong>
    <p>
      Please contact a
      <router-link
        :to="publisherTeamRoute"
      >
        publisher
      </router-link>
      to retry or cancel the publishing process.
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters(['publisherTeam']),
    publisherTeamRoute: function() {
      if (!this.$route.params || !this.publisherTeam) return ''
      return `/${this.$route.params.orgId}/teams/${this.publisherTeam.id}`
    }
  }
}
</script>