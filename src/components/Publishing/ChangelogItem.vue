<template>
    <div class="changelog-component">>
      <button
        class="linked"
        type="button"
        @click="isDialogVisible = true"
      >
        <span
          v-if="changelogComponent.isDefault"
          class="default-dot"
        />
        {{ changelogComponent.name }}
      </button>
      <p>{{ changelogComponent.description }}</p>
    </div>
    <el-dropdown
      v-if="!changelogComponent.isDefault"
      slot="info"
      class="ml-16"
      trigger="click"
      placement="bottom-end"
      @command="onMenuSelect"
    >

    <changelog-dialog
      :visible.sync="isDialogVisible"
      :changelogComponent="changelogComponent"
    />
</template>

<script>
import ChangelogDialog from '@/components/Publishing/ChangelogDialog.vue'

export default {
  name: 'ChangelogItem',

  components: {
    ChangelogDialog
  },

  props: {
    changelogComponent: {
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
      this.$emit(command, this.changelogComponent)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

p {
  color: $gray_4;
}
button {
  align-items: center;
  display: flex;
}
.default-dot {
  background: $green_1;
  border-radius: 50%;
  height: 8px;
  margin-right: 4px;
  width: 8px;
}
</script>
