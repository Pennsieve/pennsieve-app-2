<template>
  <div class="breadcrumb-navigation">
    <template v-if="!ancestors || !fileId">
      Files
    </template>
    <template v-else>
      <el-dropdown
        trigger="click"
        placement="bottom-start"
        :class="isLightBackground && 'dark-text'"
        @command="breadcrumbNavigate"
      >
        <span class="el-dropdown-link button-icon">
          <svg-icon name="icon-menu" height="20" width="20" />
        </span>
        <el-dropdown-menu
          slot="dropdown"
          class="breadcrumb-menu bf-menu"
          :arrow-offset="0"
        >
          <el-dropdown-item
            v-for="breadcrumb in breadcrumbs"
            :key="breadcrumb.content.id"
            :command="breadcrumb.content.id"
          >
            {{ breadcrumb.content.name }}
          </el-dropdown-item>
          <el-dropdown-item>Files</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <svg-icon
        class="breadcrumb-caret"
        name="icon-arrow-up"
        dir="right"
        height="12"
        width="12"
      />

      <span class="collection-name" :class="isLightBackground && 'dark-text'">
        {{ file.content.name }}
      </span>
    </template>
  </div>
</template>

<script>
import { defaultTo } from 'ramda'

export default {
  name: 'BreadcrumbNavigation',

  props: {
    isLightBackground: {
      type: Boolean,
      default: false
    },
    fileId: {
      type: String,
      default: ''
    },
    ancestors: {
      type: Array,
      default: () => []
    },
    file: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    /**
     * Reverse ancestors to show in correct order
     * @returns {Array}
     */
    breadcrumbs: function() {
      return defaultTo([], this.ancestors).reverse()
    }
  },

  methods: {
    /**
     * Handler for breadcrumb overflow navigation
     * @param {String} id
     */
    breadcrumbNavigate: function(id = '') {
      if (id) {
        return this.$emit('navigate-breadcrumb', id)
      }
      this.$emit('navigate-breadcrumb')
    }
  }
}
</script>

<style lang="scss">
@import '../../../../assets/_variables.scss';

.breadcrumb-navigation {
  align-items: center;
  display: flex;
  font-size: 16px;
  font-weight: 600;
  line-height: 40px;
  margin: 0;
  white-space: nowrap;

  .el-dropdown {
    color: $white;
    display: inline-flex;
  }

  .breadcrumb-menu {
    max-width: 256px;
    .el-dropdown-menu__item {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .breadcrumb-caret {
    flex-shrink: 0;
    margin: 0 8px;
  }
  .collection-name {
    align-items: center;
    color: $white;
    outline: none;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dark-text {
    color: $black;
  }
}
</style>
