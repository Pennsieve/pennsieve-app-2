<template>
  <bf-page class="dataset-activity">
    <bf-rafter
      slot="heading"
      title="Dataset Activity"
    >
      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li>
          <router-link
            :to="{ name: 'activity-log' }"
          >
            Activity Log
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'upload-manifests' }"
          >
            Upload Manifests
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
import { mapActions, mapState, mapGetters } from 'vuex'
import DatasetActivityPanel from '@/components/datasets/DatasetActivity/DatasetActivityPanel/DatasetActivityPanel.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue'
import BfRafter from '@/components/shared/bf-rafter/BfRafter.vue'
import BfStage from '@/components/layout/BfStage/BfStage.vue'
import FilterMenu from '@/components/shared/FilterMenu/FilterMenu.vue'

import Request from '@/mixins/request'
import Sorter from '@/mixins/sorter'

export default {
  name: 'DatasetActivity',

  components: {
    BfButton,
    BfEmptyPageState,
    BfRafter,
    BfStage,
    FilterMenu,
    DatasetActivityPanel
  },

  mixins: [
    Request,
    Sorter
  ],

  data() {
    return {}
  },

  computed: {
    ...mapState([
      'orgMembers',
      'dataset',
      'config',
      'userToken'
    ]),

    ...mapState('datasetModule', [
      'datasetActivity',
      'datasetActivityParams',
      'isLoadingDatasetActivity'
    ]),

    ...mapGetters([
      'getOrgMembersById'
    ]),

  },

  watch: {
  },

  mounted () {
  },

  methods: {
  }
}
</script>

<style lang="scss" scoped>
.activity-list-controls {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
.activity-list-controls-menus {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  .el-dropdown {
    flex-shrink: 0
  }
}
.dataset-activity {
  background: #fff;
}

/deep/ .bf-stage-content {
  display: flex;
  flex-direction: column;
}
.dataset-activity-wrap {
  flex: 1;
}
.btn-load-more-wrap {
  display: flex;
  justify-content: center;;
  margin-top: 32px;
}
.dataset-activity-panel {
  margin-bottom: 16px;
  &:not(:first-child).date-grouped {
    margin-top: 56px;
  }
}
</style>
