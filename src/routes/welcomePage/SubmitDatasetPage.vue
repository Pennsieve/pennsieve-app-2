<template>
  <router-view
    name="stage"
    :datasetProposals="datasetProposals"/>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "SubmitDatasetPage",
  computed: {
    ...mapState('repositoryModule', [
      'datasetProposals'
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