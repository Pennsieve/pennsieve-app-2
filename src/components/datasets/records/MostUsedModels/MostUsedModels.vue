<template>
  <div
    v-if="isLoadingConcepts || mostUsedModels.length > 0 && concepts.length > 5"
    class="top-models"
  >
    <h2>Most Used Models</h2>
    <div
      v-loading="isLoadingConcepts"
      element-loading-background="#fff"
      class="most-used-wrap"
    >
      <most-used-model-card
        v-for="model in mostUsedModels"
        :key="model.id"
        :model="model"
      />
    </div>
  </div>
</template>

<script>
  import {
    mapGetters,
    mapState
  } from 'vuex'

  import MostUsedModelCard from '../MostUsedModelCard/MostUsedModelCard.vue'

  export default {
    name: 'MostUsedModels',

    components: {
      MostUsedModelCard
    },

    computed: {
      ...mapGetters([
        'getMostUsedModels',
        'concepts'
      ]),

      ...mapState([
        'isLoadingConcepts'
      ]),

      /**
       * Get top five models
       * @returns {Array}
       */
      mostUsedModels: function() {
        return this.getMostUsedModels()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';

  .most-used-wrap {
    display: flex;
    flex-wrap: wrap;
    min-height: 60px;
  }
</style>
