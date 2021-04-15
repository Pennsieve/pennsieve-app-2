<template>
  <div
    class="row-block"
    :class="[
      collapsable ? 'collapsable' : '',
      open ? 'open' : ''
    ]"
  >
    <div
      class="row-block-header"
      @click="$emit('header-click')"
    >
      <div class="row-block-copy-wrap">
        <div class="support-image">
          <slot name="support-image" />
        </div>

        <div class="row-block-copy">
          <slot name="title" />
          <div class="row-block-subtext">
            <slot name="subtext" />
          </div>
        </div>
      </div>

      <div class="row-block-cta">
        <slot name="cta" />
      </div>
    </div>

    <div
      v-show="open"
      class="row-block-collapse-content"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'RowBlock',

    props: {
      collapsable: {
        type: Boolean,
        default: false
      },
      open: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .row-block {
    border: 1px solid $gray_2;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    &.open {
      background: $gray_1;
    }
  }
  .row-block-header {
    align-items: center;
    flex-shrink: 0;
    display: flex;
    padding: 24px;
    .collapsable &:hover {
      background: $gray_1;
      cursor: pointer;
    }

    .support-image {
      margin-right: 16px;
      z-index: 1;
    }
  }
  .row-block-copy-wrap {
    align-items: center;
    display: flex;
    flex: 1;
  }
  .row-block-copy {
    flex: 1;
    padding-right: 24px;
    h2 {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }
  }
  .row-block-subtext {
    align-items: center;
    color: $gray_4;
    display: flex;
    font-size: 13px;
    line-height: 1.1;
  }
  .row-block-collapse-content {
    border-top: 1px solid $gray_2;
    padding: 24px;
  }
  .row-block-cta {
    display: flex;
    .bf-button {
      margin-left: 8px;
      &:first-child {
        margin: 0;
      }
    }
  }

  .condensed {
    .row-block-header, .row-block-collapse-content {
      padding: 16px;
    }
    .row-block-copy h2 {
      font-size: 14px;
      margin-bottom: 2px;
    }
  }
</style>
