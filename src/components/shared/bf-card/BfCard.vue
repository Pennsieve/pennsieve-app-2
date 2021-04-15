<template>
  <div
    :class="classNames"
    @click="sendEvent($event)"
  >
    <el-checkbox
      v-if="isSelectable"
      v-model="checked"
      class="bf-card--checkbox"
    />

    <div
      v-if="hasIcon"
      class="bf-card--icon"
    >
      <slot name="icon" />
    </div>

    <h2 class="bf-card--title">
      {{ title }}
    </h2>

    <div class="bf-card--copy">
      <span v-if="cardCopy">
        {{ formattedCopy }}
      </span>
      <slot />
    </div>

    <div
      v-if="hasFooter"
      class="bf-card--footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BfCard',

  props: {
    item: {
      type: Object,
      default: function() {
        return {}
      }
    },
    title: {
      type: String,
      default: ''
    },
    isModelCard: {
      type: Boolean,
      default: false
    },
    isSelectable: {
      type: Boolean,
      default: false
    },
    cardCopy: {
      type: String,
      default: ''
    },
    checked: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
  },

  computed: {
    /**
     * Returns CSS classnames for bf-card component
     * @returns {String}
     */
    classNames: function() {
      const baseName = 'bf-card'
      const modelCardClass = this.isModelCard ? ' model-card' : ''
      const selectedClass = this.checked ? ' active' : ''
      const isDisabled = this.isDisabled ? ' is-disabled' : ''
      return baseName + modelCardClass + selectedClass + isDisabled
    },
    /**
     * Returns Boolean whether icon slot exists
     * @returns {Boolean}
     */
    hasIcon: function() {
      return !!this.$slots['icon']
    },
    /**
     * Returns Boolean whether footer slot exists
     * @returns {Boolean}
     */
    hasFooter: function() {
      return !!this.$slots['footer']
    },
    /**
     * Returns Boolean whether property slot exists
     * @returns {Boolean}
     */
    formattedCopy: function() {
      const copy = this.cardCopy
      const maxLength = 185
      if (copy.length > maxLength) {
        return `${copy.substr(0, maxLength)}...`
      }
      return copy
    },
  },

  methods: {
    /**
     * Toggles selected local property and emits an event if selectable
     */
    sendEvent: function(evt) {
      if (!this.isSelectable || this.isDisabled) {
        return
      }
      evt.preventDefault()
      const isChecked = !this.checked
      const evtName = isChecked ? 'card-checked' : 'card-unchecked'
      this.$emit(evtName, this.item)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../assets/variables';

.bf-card {
  align-items: center;
  background: #fff;
  border: solid 1px $gray_2;
  border-radius: 3px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 250px;
  justify-content: center;
  margin: 0 16px 16px 0;
  overflow: hidden;
  padding: 24px;
  position: relative;
  text-align: center;
  width: 276px;

  &:not(.disabled):hover {
    background: $gray_1;
    cursor: pointer;
  }

  .bf-card--checkbox {
    left: 16px;
    position: absolute;
    top: 16px;
  }

  .bf-card--icon {
    height: 48px;
    margin-bottom: 16px;
  }

  .bf-card--title {
    font-size: 14px;
    line-height: 16px;
    margin: 0 0 8px;
    padding: 0;
    text-decoration: none;
  }

  .bf-card--copy {
    font-size: 12px;
    flex: 1 auto;
    line-height: 16px;
    text-decoration: none;
  }

  .bf-card--footer {
    font-size: 12px;
    margin-top: 24px;
  }

  &.model-card {
    flex-direction: column;
    height: 250px;
    justify-content: center;
    margin: 0 16px 16px 0;
    overflow: hidden;
    padding: 24px;
    text-align: center;
    min-width: 250px;
    width: 25%;
    max-width: calc(25% - 16px);
    flex: 1 auto;

    .bf-card--checkbox {
      display: none;
    }

    .bf-card--icon {
      height: 40px;
    }

    &:hover {
      .bf-card--checkbox {
        display: block;
      }
    }

    &.active {
      border: solid 1px $purple_1;

      .bf-card--checkbox {
        display: block;
      }
    }

    &.is-disabled {
      background: $gray_1;
      color: $gray_4;
      cursor: default;

      .bf-card--title {
        color: $gray_4;
      }

      &:hover {
        cursor: default;

        .bf-card--checkbox {
          display: none;
        }
      }
    }
  }
}
</style>
