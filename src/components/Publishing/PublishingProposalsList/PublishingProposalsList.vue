<template>
  <div>
    <H4>These are dataset proposals</H4>
  </div>
</template>
<script>
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
}
</script>
<style>
</style>