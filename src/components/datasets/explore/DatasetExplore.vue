<template>
  <bf-page class="bf-dataset-explore">
    <bf-stage slot="stage">
      <h1>Explore Your Data</h1>
      <concepts-list />
      <data-model-graph />

      <template slot="sidebar">
        <dataset-file-types class="sidebar-component" />
        <dataset-storage-metrics class="sidebar-component" />
      </template>
    </bf-stage>
  </bf-page>
</template>

<script>
import { mapGetters } from 'vuex'

import DatasetFileTypes from './DatasetFileTypes/DatasetFileTypes.vue'
import DatasetStorageMetrics from './DatasetStorageMetrics/DatasetStorageMetrics.vue'
import ConceptsList from './ConceptsList/ConceptsList.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'
import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import DataModelGraph from './DataModelGraph.vue'

export default {
  name: 'DatasetExplore',

  components: {
    BfRafter,
    BfEmptyPageState,
    DatasetFileTypes,
    DatasetStorageMetrics,
    ConceptsList,
    BfEmptyPageState,
    DataModelGraph
  },

  computed: {
    ...mapGetters([
      'concepts',
      'activeOrganization'
    ])
  }
}
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .bf-dataset-explore {
    h1{
      font-size: 20px;
    }
  }

  .bf-dataset-explore .data-model-graph .chart {
    border: 1px solid $cortex;
  }
</style>
