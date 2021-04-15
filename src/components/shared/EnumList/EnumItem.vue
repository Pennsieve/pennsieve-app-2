<template>
  <div class="wrapper">
    <el-row
      class="enum-item"
      type="flex"
      :gutter="32"
      align="middle"
    >
      <el-col
        :sm="17"
        class="enum-item--name"
      >
        {{ item }}
      </el-col>
      <el-col
        :sm="7"
        class="align-right"
      >
        <button
          v-if="!disabled"
          class="tools"
          @click="deleteItem($event, item)"
        >
          <svg-icon
            icon="icon-remove"
            class="remove"
            height="10"
            width="10"
          />
        </button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { propOr } from 'ramda'

  export default {
    name: 'EnumItem',

    props: {
      item: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
    },

    methods: {
      /**
       * Removes an item from the list
       * @param {Object} evt
       * @param {String} itemName
       */
      deleteItem: function(evt, itemName) {
        evt.preventDefault()
        this.$emit('remove-item-from-list', itemName)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/variables';

  .enum-item {
    padding: 4px 8px;
  }

  .enum-item--name {
    color: $gray_6;
  }

  .remove {
    color: $gray_2;
  }
</style>
