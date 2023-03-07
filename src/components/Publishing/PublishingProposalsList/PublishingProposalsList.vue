<template>
  <div>
    <H4>These are dataset proposals</H4>
  </div>
</template>
<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: 'PublishingProposalsList',

  props: {
    publicationStatus: {
      type: Array,
      default: () => {
        return ['requested']
      },
    }
  },

  beforeRouteEnter: function(to, from, next) {
    next(vm => {
      vm.getInitialData()
      next()
    })
  },

  computed: {
    ...mapGetters('publishingModule', [
      'getDatasets'
    ]),

    proposals: function() {
      return this.getDatasets(this.$route.name)
    },
  },

  methods: {
    ...mapActions('publishingModule', [
      'clearSearchParams',
      'fetchDatasetProposals'
    ]),

    getInitialData: function(){
      this.clearSearchParams()
        .then(() => {
          this.fetchDatasetProposals()
        })
    },
  },
}
</script>
<style>
</style>