<template>
  <div>
    <el-input
      v-model="newItem"
      class="enum-input"
      placeholder="Add some values to your list"
      auto-complete="off"
      :type="dataType"
      @input="validateInput"
      @key.enter.native="addItem($event)"
    >
      <i
        slot="suffix"
        class="icon-wrapper"
      >
        <button
          class="icon-button"
          @click="addItem($event)"
        >
          <svg-icon
            name="icon-plus"
            height="32"
            width="32"
            color="#fff"
          />
        </button>
      </i>
    </el-input>
    <!-- displays error message per input -->
    <transition name="el-zoom-in-top">
      <div
        v-if="error"
        class="el-form-item__error"
      >
        {{ errorMessage }}
      </div>
    </transition>
    <div class="list-items">
      <enum-item
        v-for="item in itemList"
        :key="item"
        :disabled="disabled"
        :item="item.toString()"
        @remove-item-from-list="onRemoveItemFromList"
      />
    </div>
  </div>
</template>

<script>
  import AsyncValidator from 'async-validator'
  import EnumItem from './EnumItem.vue'
  import DataType from '../../../mixins/data-type'
  import { sortBy, compose, toLower, prop, find, propEq, propOr } from 'ramda'

  export default {
    name: 'EnumList',

    components: {
      EnumItem,
    },

    mixins: [
      DataType,
    ],

    props: {
      savedList: {
        type: Array,
        default: () => []
      },
      disabled: {
        type: Boolean,
        default: false
      },
      property: {
        type: Object,
        default: () => {}
      },
    },

    data: function() {
      return {
        error: false,
        newItem: '',
        itemList: [],
      }
    },

    computed: {
      /**
       * Computes property data type
       * @returns {String}
       */
      dataType: function() {
        const rawDataType = this.getRawDataType(this.property)
        if (rawDataType === 'Double' || rawDataType === 'Long') {
          return 'number'
        }
        return 'text'
      },

      /**
       * Compute error message based on type
       */
      errorMessage: function() {
        let type = toLower(this.getRawDataType(this.property))

        if (type === 'long') {
          type = 'numerical'
        }

        return `Please provide data in ${type} format`
      },
    },

    watch: {
      savedList: {
        handler: function(val) {
          this.itemList = val
        },
        immediate: true
      },
    },

    methods: {
      /**
       * Adds new item to values list
       * @param {Object} evt
       */
      addItem: function(evt) {
        evt.preventDefault()

        // short circuit if there is no value entered
        if (this.newItem === '') {
          return
        }

        // prevent duplicates
        const exists = this.itemList.indexOf(this.newItem) >= 0
        if (exists) {
          return this.newItem = ''
        }

        const newList = [...this.itemList, this.newItem]
        this.itemList = newList.sort()
        this.newItem = ''
        this.$emit('enum-list-updated', this.itemList)
      },

      /**
       * Removes item from list
       * @param {String} itemName
       */
      onRemoveItemFromList: function(itemName) {
        this.itemList = this.itemList.filter(item => item !== itemName)
        this.$emit('enum-list-updated', this.itemList)
      },

      /**
       * Get descriptor for validation based off of pattern and type
       * @param {String} pattern
       * @returns {Object}
       */
      getDescriptor: function(pattern) {
        const required = propOr(false, 'default', this.property)
        const descriptor = {
          value: {
            pattern,
            required
          }
        }
        return descriptor
      },

      /**
       * Validate input
       */
      validateInput: function() {
        let type = toLower(this.getRawDataType(this.property))
        let pattern = '.*'

        switch (type) {
          case 'long':
            pattern = /^\d+$/
            break;

          case 'double':
            pattern = /^(?=.)([+-]?([0-9]*)(\.([0-9]+))?)$/
            break;

          default:
            pattern = '.*'
            break;
        }

        const descriptor = this.getDescriptor(pattern)

        const validator = new AsyncValidator(descriptor)
        const propertyValue = this.newItem

        validator.validate({value: propertyValue}, (errors, fields) => {
          this.error = errors ? true : false
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/variables';

  .enum-input {
    max-width: calc(100% - 36px);
  }

  .list-items {
    border: solid 1px #c0c4cc;
    border-radius: 3px;
    max-height: 168px;
    margin-top: 8px;
    min-height: 90px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 4px 0;

    &.disabled {
      background: #f5f7fa;
    }
  }

  .icon-wrapper {
    background: $purple_1;
    border: solid 1px transparent;
    border-radius: 0 2px 2px 0;
    cursor: pointer;
    width: 38px;
    height: 38px;
    line-height: 34px;
    text-align: center;
    position: absolute;

    .icon-button {
      height: 100%;
      width: 100%;
    }

    &:hover {
      background: $purple_3;
    }
  }
</style>
