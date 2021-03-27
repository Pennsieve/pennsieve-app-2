<template>
  <slat-info class="data-use-agreement">
    <div>
      <button
        class="linked"
        type="button"
        @click="isDialogVisible = true"
      >
        <span
          v-if="dataUseAgreement.isDefault"
          class="default-dot"
        />
        {{ dataUseAgreement.name }}
      </button>
      <p>{{ dataUseAgreement.description }}</p>
    </div>
    <el-dropdown
      v-if="!dataUseAgreement.isDefault"
      slot="info"
      class="ml-16"
      trigger="click"
      placement="bottom-end"
      @command="onMenuSelect"
    >
      <button class="el-dropdown-link">
        <svg-icon
          name="icon-menu"
          height="20"
          width="20"
        />
      </button>
      <el-dropdown-menu
        slot="dropdown"
        class="bf-menu"
        :offset="9"
      >
        <el-dropdown-item command="make-default">
          Make Default
        </el-dropdown-item>
        <el-dropdown-item command="edit">
          Edit
        </el-dropdown-item>
        <el-dropdown-item command="delete">
          Delete
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <data-use-agreement-dialog
      :visible.sync="isDialogVisible"
      :data-use-agreement="dataUseAgreement"
    />
  </slat-info>
</template>

<script>
import SlatInfo from '@/components/shared/SlatInfo/SlatInfo.vue'
import DataUseAgreementDialog from '@/components/shared/DataUseAgreementDialog/DataUseAgreementDialog.vue'

export default {
  name: 'DataUseAgreementListItem',

  components: {
    DataUseAgreementDialog,
    SlatInfo
  },

  props: {
    dataUseAgreement: {
      type: Object,
      default: () => {
        return {
          name: '',
          description: '',
          body: '',
          id: '',
          isDefault: false
        }
      }
    }
  },

  data() {
    return {
      isDialogVisible: false
    }
  },

  methods: {
    /**
     * When the user selects an option from
     * the menu, emit an event
     */
    onMenuSelect: function(command) {
      this.$emit(command, this.dataUseAgreement)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

p {
  color: $glial;
}
button {
  align-items: center;
  display: flex;
}
.slat-info.data-use-agreement {
  align-items: center;
  padding: 16px 0;
}
.default-dot {
  background: $nucleus;
  border-radius: 50%;
  height: 8px;
  margin-right: 4px;
  width: 8px;
}
</style>
