<template>
  <bf-page class="dataset-records">
    <locked-banner
      slot="banner"
    />
    <bf-rafter
      slot="heading"
      title="Metadata Records"
    >
      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li>
          <router-link :to="{ name: 'records' }">
            Records
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'models' }">
            Models
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'relationships' }">
            Relationships
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'graph' }">
            Graph Browser
          </router-link>
        </li>
      </ul>
    </bf-rafter>

    <bf-stage
      slot="stage"
      :fullscreen="true"
    >
      <router-view name="stage" />
    </bf-stage>
  </bf-page>


</template>

<script>
  import {
    mapState,
    mapGetters
  } from 'vuex'

  import {
    pathOr
  } from 'ramda'

  import LockedBanner from '../../LockedBanner/LockedBanner';
  import StatBlock from '../../../shared/StatBlock/StatBlock.vue'
  import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue'
  import BfRafter from '@/components/shared/bf-rafter/BfRafter.vue'
  import BfStage from '@/components/layout/BfStage/BfStage.vue'

  const formatNumber = (number) => new Intl.NumberFormat('en-EN').format(number)

  export default {
    name: 'DatasetRecords',

    components: {
      BfRafter,
      StatBlock,
      LockedBanner,
      BfEmptyPageState,
      BfRafter,
      BfStage,
    },

    data() {
      return {
      }
    },

    computed: {
      ...mapState([
        'dataset'
      ]),

      ...mapGetters([
        'modelsCount',
        'totalRecordsCount',
        'datasetLocked'

      ]),

      /**
       * Compute dataset name
       * @returns {String}
       */
      datasetName: function() {
        return pathOr('', ['content', 'name'], this.dataset)
      },

      /**
       * Compute and format total models
       * @returns {String}
       */
      totalModels: function() {
        return formatNumber(this.modelsCount)
      },

      /**
       * Compute and format total records
       * @returns {String}
       */
      totalRecords: function() {
        return formatNumber(this.totalRecordsCount)
      }
    },

    methods: {
    }
  }
</script>

<style lang="scss">
  @import '../../../../assets/_variables.scss';

  .dataset-records {
    background: #fff;
    h2 {
      font-size: 20px;
      margin-bottom: 8px;
      line-height: 32px;
    }
    .stat-block {
      color: white;
      text-align: center;
      .stat {
        font-size: 16px;
        font-weight: 600;
        line-height: 22px;
        margin: 0;
      }
      .label {
        font-size: 12px;
      }
    }
  }
</style>
