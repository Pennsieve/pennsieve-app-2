<template>
  <router-view
    name="stage"
    :repositories="repositories"/>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "WelcomePage",
  computed: {
    ...mapState('repositoryModule', [
      'repositories',
      'requestModalVisible'

    ]),
  },
  mounted () {
    this.fetchRepositories()
    this.fetchProposals()
  },

  methods: {
    ...mapActions('repositoryModule', ['fetchRepositories','fetchProposals']),
  }
}
</script>