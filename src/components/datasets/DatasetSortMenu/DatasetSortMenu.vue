<template>
  <el-dropdown
    trigger="click"
    placement="bottom-start"
    @command="$emit('select', $event)"
    @visible-change="isMenuOpen = $event"
  >
    <button class="dataset-filter-dropdown el-dropdown-link">
      <span class="el-dropdown-text-link">
        {{ selectedLabel }}
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
        v-for="option in options"
        :key="option.value"
        class="icon-item"
        :command="option"
      >
        {{ option.name }}
        <svg-icon
          v-if="orderBy === option.value"
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
import {
  compose,
  find,
  propEq,
  propOr
} from 'ramda'

export default {
  name: 'DatasetSortMenu',

  props: {
    orderBy: {
      type: String,
      default: ''
    }
  },

  data: function() {
    return {
      isMenuOpen: false,
      options: [
        {
          value: 'IntId',
          name: 'Sort by Accession Number'
        },
        {
          value: 'Name',
          name: 'Sort by Name'
        },
        {
          value: 'UpdatedAt',
          name: 'Sort by Last Updated'
        }
      ]
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

    /**
     * Compute selected label
     * @returns {String}
     */
    selectedLabel: function() {
      return compose(
        propOr('', 'name'),
        find(propEq('value', this.orderBy))
      )(this.options)
    }
  }
}
</script>
