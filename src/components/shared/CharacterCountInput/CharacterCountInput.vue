<template>
  <div>
    <el-input
      ref="input"
      v-model="userInput"
      type="textarea"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handlesInput"
    />
    <div
      v-if="showWarning"
      class="warning"
    >
      {{ warningMessage }}
    </div>
  </div>
</template>

<script>
import { defaultTo } from 'ramda'
export default {
  name: 'CharacterCountInput',

  props: {
    rows: {
      type: Number,
      default: 8
    },
    maxlength: {
      type: Number,
      default: 255
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    showWarning: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      userInput: ''
    }
  },

  computed: {
    /**
     * Displays remaining characters
     * @returns {String}
     */
    warningMessage: function() {
      const str = defaultTo('', this.userInput)
      const totalCharacters = this.maxlength - str.length
      const plural = totalCharacters === 1 ? '' : 's'
      const copy = `${totalCharacters} character${plural} left`
      return copy
    }
  },

  watch: {
    value: {
      handler: function(val) {
        this.userInput = val
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Handles syncing user input with v-model passed to component
     */
    handlesInput: function() {
      this.$emit('input', this.userInput)
    },

    /**
     * Focus on input
     */
    focus: function() {
      this.$refs.input.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.warning {
  font-size: 12px;
  color: $gray_4;
  margin-top: -6px;
}
</style>
