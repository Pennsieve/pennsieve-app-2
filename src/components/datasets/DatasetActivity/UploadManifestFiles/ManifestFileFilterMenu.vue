<template>
  <el-dropdown
    trigger="click"
    placement="bottom-start"
    @command="$emit('update-status-filter', $event)"
    @visible-change="isMenuOpen = $event"
  >
    <button class="dataset-filter-dropdown el-dropdown-link">
      <span class="el-dropdown-text-link">
        Show {{ statusLabel }}
      </span>
      <svg-icon
        class="ml-8"
        name="icon-arrow-up"
        :dir="menuArrowDir"
        height="10"
        width="10"
      />
    </button>
    <el-dropdown-menu
      slot="dropdown"
      class="bf-menu"
    >
      <el-dropdown-item
        v-for="option in statusOptions"
        :key="option"
        class="icon-item"
        :command="option"
      >
        {{ option }}
        <svg-icon
          v-if="statusFilter === option"
          icon="icon-check"
          class="item-icon-check"
          width="20"
          height="20"
        />
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'ManifestStatusMenu',

  props: {
    statusFilter: {
      type: String,
      default: "All"
    },
    statusOptions: {
      type: Array,
      default: () => {
        return [
          "All",
          "In Progress",
          "Failed",
        ]
      }
    }
  },

  data: function() {
    return {
      isMenuOpen: false
    }
  },

  computed: {
    /**
     * Compute dataset filter arrow direction
     * @returns {String}
     */
    menuArrowDir: function() {
      return this.isMenuOpen ? 'up' : 'down'
    },
    statusLabel: function() {
      switch (this.statusFilter) {
        case "All":
          return "All Files"
        default:
          return this.statusFilter
      }
      return "hello"
    }
  }
}
</script>
