<template>
  <div class="integration-item-small">

    <el-row
      type="flex"
      align="middle"
      class="info"
    >
      <el-col
        :sm="24"
      >
        <div class="integration-title">
          {{integration.displayName}}
        </div>
      </el-col>
      <el-col
        :sm="24"
        class="activeSwitch"
      >
        <ps-switch
          v-model="isActive"
          active-color="#5039F7"
          inactive-color="#CAC5BF">
        </ps-switch>
      </el-col>
    </el-row>
    <el-row>

    </el-row>
    <el-row>
      <p class="integration-description">
        {{integration.description}}

      </p>
    </el-row>

  </div>
</template>

<script>

import {
  mapActions,
} from 'vuex'
import PsSwitch from '../../../shared/PsSwitch/PsSwitch.vue'

export default {
  name: 'IntegrationListItem',

  components: {
    PsSwitch
  },

  props: {
    integration: {
      type: Object,
      default: () => ({})
    },
    /**
     * Used to reset switches to default position every time window is opened.
     */
    openIndex: {
      type: Number,
      default:-1
    }
  },

  data: function() {
    return {
      isActive: false
    }
  },

  mounted: function() {
    this.isActive = this.integration.isDefault
  },

  watch: {
    openIndex: function() {
      this.isActive = this.integration.isDefault
    },
    /**
     * When switch is toggled, send event to parent. We are not using sync because the parent
     * needs to perform additional actions.
     * @param val
     */
    isActive: function(val) {
      this.integration.isActive = val
      this.$emit('updateIsActive', this.integration)
    }
  },

  methods: {
    ...mapActions([
      'updateDataset'
    ]),
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';

.integration-menu {
  width: 24px;
}

.activeSwitch {
  width: fit-content;
}

.integration-item-small {
  border-bottom: 1px solid $gray_2;
  margin: 0 0 16px 0;
}
.integration-title {
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 500;
  color: $gray_5;
}

.intergration-type {
  color: $gray_5;
  font-weight: 500;
  font-size: 12px;
}

.integration-description {
  font-size: 14px;
  color: $gray_4;
  max-width: 500px;
}

.list-item-col-spacer {
  padding-top: 32px;
}

</style>
