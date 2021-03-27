<template>
  <button
    class="bf-button"
    :disabled="disabled || processing"
    :autofocus="autofocus"
    :type="type"
    :class="[
      type ? 'bf-button--' + type : ''
    ]"
    @click="handleClick"
  >
    <span
      v-if="hasPrefixSlot"
      class="prefix"
    >
      <slot name="prefix" />
    </span>

    <template v-if="processing">
      <el-spinner
        class="button-spinner"
        :radius="40"
      />
      <template v-if="processingText">
        {{ processingText }}
      </template>

      <template v-else>
        <slot />
      </template>
    </template>

    <template v-if="!processing">
      <slot />
    </template>

    <span
      v-if="hasSuffixSlot"
      class="suffix"
    >
      <slot name="suffix" />
    </span>
  </button>
</template>

<script>
  export default {
    name: 'BfButton',

    props: {
      type: {
        type: String,
        default: 'button'
      },
      autofocus: Boolean,
      disabled: Boolean,
      processing: {
        type: Boolean,
        default: false
      },
      processingText: {
        type: String,
        default: ''
      }
    },

    computed: {
      hasPrefixSlot: function () {
        return !!this.$slots['prefix']
      },
      hasSuffixSlot: function () {
        return !!this.$slots['suffix']
      }
    },

    methods: {
      /**
       * On click
       * @param {Object} evt
       */
      handleClick(evt) {
        this.$emit('click', evt)
      }
    }
  }

</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .bf-button {
    align-items: center;
    background: $app-primary-color;
    border: 1px solid transparent;
    border-radius: 3px;
    color: $white-matter;
    cursor: pointer;
    display: inline-flex;
    flex-direction: row;
    font-size: 14px;
    justify-content: center;
    line-height: 1;
    margin: 0;
    min-width: 112px;
    outline: none;
    padding: 12px 16px;
    text-transform: none;
    &[disabled] {
      opacity: .6;
      cursor: default;
    }
    &:not([disabled]) {
      &:hover, &:focus {
        background: $dopamine-dark
      }
      &:hover {
        box-shadow: 2px 2px 4px rgba(0,0,0,.25);
      }
      &:active {
        box-shadow: none;
      }
    }
    &.small {
      font-size: 10px;
      color: #FFFFFF;
      text-align: left;
      line-height: 12px;
      padding: 8px 16px;
      margin-bottom: -10px;
      margin-top: -4px;
    }
    &.compact {
      padding: 8px 16px;
    }
    &.icon {
      padding: 11px 11px;
      min-width: 0
    }
    &.secondary {
      background: $dendrite;
      border-color: #D3D5DA;
      color: $text-color;
      &:not([disabled]) {
        &:hover, &:focus {
          background: $dendrite-dark
        }
      }
      &.ghost {
        border-color: $cortex;
        color: $text-color;
        &:not([disabled]) {
          &:active, &:focus {
            background: #F9F9F9;
            color: $text-color;
          }
        }
      }
    }
    &.green {
      background: $nucleus;
      &:not([disabled]) {
        &:hover, &:focus {
          background: $nucleus-dark
        }
      }
      &.ghost {
        border-color: $nucleus;
        color: $nucleus;
        &:not([disabled]) {
          &:active, &:focus {
            background: $nucleus;
            color: white;
          }
        }
      }
    }
    &.red {
      background: $synapse;
      &:not([disabled]) {
        &:hover, &:focus {
          background: $synapse-dark
        }
      }
      &.ghost {
        border-color: $synapse;
        color: $synapse;
        &:not([disabled]) {
          &:active, &:focus {
            background: $synapse;
            color: white;
          }
        }
      }
    }
    &.ghost {
      background: transparent;
      border-color: $app-primary-color;
      color: $app-primary-color;
      font-weight: 500;
      &:not([disabled]) {
        &:hover {
          background: white;
        }
        &:active, &:focus {
          background: $app-primary-color;
          color: white;
        }
      }
    }
    &.dashed {
      background: #f9f9f9;
      border: 1px dashed $light-gray;
      color: $dark-gray;
      &:not([disabled]) {
        &:hover, &:active, &:focus {
          background: #f9f9f9;
          color: $dark-gray;
        }
      }
    }
    & iron-icon {
      margin-right: 5px;
    }
  }
  .button-spinner {
    height: 20px;
    margin: -3px 8px -3px 0;
    width: 20px;
  }
  .prefix, .suffix {
    display: inline-flex;
  }
  .prefix {
    margin-right: 16px;
    .compact & {
      margin-right: 8px;
    }
  }
  .suffix {
    margin-left: 16px;
    .compact & {
      margin-left: 8px;
    }
  }
</style>
