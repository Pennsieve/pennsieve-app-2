<template>
  <div class="records-overview">
    <most-used-models class="mb-16" />
    <models-list />
  </div>
</template>

<script>
  import MostUsedModels from '../MostUsedModels/MostUsedModels.vue'
  import ModelsList from '../ModelsList/ModelsList.vue'

  export default {
    name: 'RecordsOverview',

    components: {
      MostUsedModels,
      ModelsList
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';
</style>
