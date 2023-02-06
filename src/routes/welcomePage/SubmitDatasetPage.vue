<template>
  <router-view
    name="stage"
    :datasetProposals="datasetProposals"/>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "SubmitDatasetPage",
  computed: {
    ...mapState('repositoryModule', [
      'datasetProposals'
    ]),
  },
}
</script>