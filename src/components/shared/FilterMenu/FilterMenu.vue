<template>
  <div>
    <el-popover
      ref="menu"
      v-model="isMenuOpen"
      popper-class="no-padding"
      placement="bottom-start"
      width="200"
      trigger="click"
      transition=""
      :visible-arrow="false"
    >
      <div class="bf-menu scroll-menu">
        <ul>
          <li
            v-for="item in options"
            :key="item.value"
          >
            <a
              href="#"
              class="bf-menu-item"
              :data-menu-item="`option-${item.value}`"
              @click.prevent="onMenuSelect(item)"
            >
              {{ item.label }}
              <svg-icon
                v-if="selectedOption.value === item.value"
                icon="icon-check"
                class="item-icon-check"
                width="20"
                height="20"
              />
            </a>
          </li>
        </ul>
      </div>
    </el-popover>

    <button
      v-popover:menu
      class="dataset-filter-dropdown el-dropdown-link"
    >
      <span
        class="el-dropdown-text-link"
        data-selected-label
      >
        Show {{ selectedOption.label }}
      </span>
      <svg-icon
        class="ml-8 arrow-style"
        name="icon-arrow-up"
        :dir="menuArrowDir"
        height="10"
        width="10"
      />
    </button>
  </div>
</template>

<script>
export default {
  name: 'FilterMenu',

  props: {
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    selectedOption: {
      type: Object,
      default: () => {
        return {}
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
    }
  },

  methods: {
    /**
     * On menu select, emit select event
     * and hide the menu
     * @param {Object} item
     */
    onMenuSelect: function(item) {
      this.$emit('select', item)
      this.isMenuOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.bf-menu hr {
  margin: 8px 0
}

.el-dropdown-text-link {
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  margin-top: 4px;
}

.arrow-style {
  margin-top: -7px;
}
</style>
