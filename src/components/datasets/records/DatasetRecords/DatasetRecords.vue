<template>
  <bf-page class="dataset-records">
    <locked-banner
      slot="banner"
    />
    <bf-rafter slot="heading">
      <h1
        slot="heading"
        class="flex-heading"
      >
        <svg-icon
          v-if="datasetLocked"
          class="mr-8"
          color="#71747C"
          name="icon-lock-filled"
          height="24"
          width="24"
        />
        Records
      </h1>

      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li>
          <router-link :to="{ name: 'metadata' }">
            Records
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'models' }">
            Models
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'relationship-types' }">
            Relationships
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'graph-browser' }">
            Graph Browser
          </router-link>
        </li>
      </ul>

      <template slot="stats">
        <stat-block
          class="mr-32"
          :stat="totalRecords"
          label="Unique Records"
        />
        <stat-block
          class="mr-32"
          :stat="totalModels"
          label="Graph Models"
        />
      </template>
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

  import BfRafter from '../../../shared/bf-rafter/BfRafter.vue'
  import LockedBanner from '../../LockedBanner/LockedBanner';
  import StatBlock from '../../../shared/StatBlock/StatBlock.vue'

  const formatNumber = (number) => new Intl.NumberFormat('en-EN').format(number)

  export default {
    name: 'DatasetRecords',

    components: {
      BfRafter,
      StatBlock,
      LockedBanner
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
