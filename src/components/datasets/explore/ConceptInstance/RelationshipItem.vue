<template>
  <div class="relationship-item">
    <div class="select">
      <el-select
        ref="menu"
        v-model="relatedFieldsModel"
        :disabled="isDisabled"
        :placeholder="isDisabled ? ' ' : 'Start typing...'"
        @change="updateRelatedFieldsValue"
        @keyup.enter.native="handleEnterKey"
      >
        <el-option
          v-for="field in relatedFields"
          :key="field.id"
          :label="field.displayName"
          :value="field.name"
          :class="field.typedValue ? 'user-created-option' : ''"
        />
      </el-select>
    </div>
    <div class="name">
      {{ conceptTitleName }}
    </div>
  </div>
</template>

<script>
import { defaultTo, propOr, pathOr, find, propEq } from 'ramda'

export default {
  name: 'RelationshipItem',

  props: {
    relatedFieldsValue: {
      type: String,
      default: ''
    },
    relatedFields: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    },
    item: {
      type: Object,
      default: () => ({})
    },
    conceptTitle: {
      type: Object,
      default: () => ({})
    },
  },

  data() {
    return {
      relatedFieldsModel: '',
      selectedValue: ''
    }
  },

  computed: {
    /**
     * Computes whether or not select field is disabled
     * @returns {Boolean}
    */
    isDisabled: function() {
      return !this.isFirst(this.index) && this.relatedFieldsValue.length === 0
    },

    /**
     * Computes the concept title display name
     * @returns {String}
    */
    conceptTitleName: function() {
      const key = propOr('', 'displayName', this.conceptTitle)
      return this.item[key]
    },
  },

  watch: {
    relatedFieldsValue: function(val) {
      this.relatedFieldsModel = val
    }
  },

  mounted() {
    this.relatedFieldsModel = defaultTo(this.relatedFieldsValue, this.selectedValue)
  },

  methods: {
    /**
     * Sets current input value to selectedValue
     * @param {Object} evt
     */
    handleEnterKey: function(evt) {
      const displayName = pathOr('', ['target', 'value'], evt)
      const relatedField = find(propEq('displayName', displayName), this.relatedFields)
      const val = propOr('', 'name', relatedField)
      this.updateRelatedFieldsValue(val)
      this.$refs.menu.visible = false
    },
    /**
     * Calculates whether or not item is first in v-for based on index
     * @param {Number} index
     * @returns {Boolean}
     */
    isFirst: function(index) {
      return index === 0
    },
    /**
     * Updates selected value and emits an event to update main model
     * @param {String} val
     */
    updateRelatedFieldsValue: function(val) {
      this.relatedFieldsModel = val
      if (this.relatedFieldsValue.length === 0) {
        return this.$emit('update-all-relationships', val)
      }
      this.$emit('update-relationship', {
        selectedValue: val,
        id: this.item.id
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/variables';

.relationship-item {
  display: flex;
  align-items: center;
  border-bottom: solid 1px $gray_2;
  height: 88px;

  .select {
    width: 356px;
    justify-content: center;
    text-align: center;
  }

  .name {
    flex: 1;
    font-weight: 600;
  }

  .delete {
    margin-right: 16px;
  }
}

.empty-list {
  margin: 16px 0;
  font-style: italic;
}

.user-created-option {
  display: flex;
  align-items: center;
  height: 24px;

  &:before {
    content: 'Create "'
  }
  &:after {
    content: '"'
  }
}
</style>