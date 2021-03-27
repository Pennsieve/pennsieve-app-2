<template>
  <div
    class="sidebar-message"
    :class="borderClassName"
  >
    <h3>{{ title }}</h3>
    <slot name="copy" />
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'SidebarMessage',

    props: {
      borderClass: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      hasBorderBottom: {
        type: Boolean,
        default: false
      },
    },

    computed: {
      borderClassName: function() {
        const borderBottom = this.hasBorderBottom ? 'border-bottom' : ''
        const classNameList = [this.borderClass, borderBottom].filter(Boolean)
        return classNameList.length > 0 ? classNameList.join(' ') : ''
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/variables';

  .sidebar-message {
    padding: 24px 32px;

    &.border-bottom {
      border-bottom: solid 1px $cortex;
    }

    &.green {
      border-left: solid 6px #17BB62;
      padding: 24px 32px 24px 26px;
    }

    &.dark {
      border-left: solid 6px #404554;
      padding: 24px 32px 24px 26px;
    }
  }

  h3 {
    font-size: 12px;
    font-weight: 600;
    line-height: 14px;
    margin-bottom: 16px;
    text-transform: uppercase;
  }

  p {
    color: #000;
    line-height: 19px;
  }
</style>