<template>
  <div
    class="data-card"
    :class="[
      padding ? 'padding' : '',
      isExpandable ? 'expandable' : '',
      isExpanded ? '' : 'not-expanded'
    ]"
  >
    <div class="title">
      <template v-if="$slots['title']">
        <slot name="title" />
      </template>
      <h2 v-else>
        {{ title }}
      </h2>

      <div
        v-if="$slots['title-aux']"
        class="title-aux"
      >
        <slot name="title-aux" />
      </div>
    </div>
    <div
      ref="body"
      class="body"
      :style="expandableStyles"
    >
      <slot />
    </div>

    <button
      v-if="isExpandable && isExpanded === false"
      class="expand-arrow"
      title="Expand content"
      @click="isExpanded = true"
    >
      <svg-icon
        name="icon-arrow-up"
        color="#404554"
        dir="down"
        height="16"
        width="16"
      />
    </button>
  </div>
</template>

<script>
  export default {
    name: 'DataCard',

    props: {
      title: {
        type: String,
        default: ''
      },
      padding: {
        type: Boolean,
        default: true
      },
      isExpandable: {
        type: Boolean,
        default: false
      },
      maxHeight: {
        type: Number,
        default: 250
      }
    },

    data: function() {
      return {
        isExpanded: false
      }
    },

    computed: {
      /**
       * Compute expandable styles based on maxHeight
       * @returns {String}
       */
      expandableStyles: function() {
        return this.isExpandable && this.isExpanded === false
          ? `max-height: ${this.maxHeight}px`
          : ''
      }
    },

    mounted: function() {
      if (this.isExpandable) {
        this.$nextTick(() => {
          this.checkExpandedHeight()
        })
      }
    },

    methods: {
      /**
       * Check the height to see if it needs
       * to be set to isExpanded by default
       */
      checkExpandedHeight: function() {
        const bodyHeight = this.$refs.body.offsetHeight
        this.isExpanded = bodyHeight <= this.maxHeight
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .data-card {
    background: #fff;
    border: 1px solid $gray_2;
    &.dark {
      border: none;
    }
  }
  .body {
    .padding & {
      padding: 16px;
    }
    .flex-body & {
      display: flex;
    }
    .expandable.not-expanded & {
      overflow: hidden;
    }
    .round & {
      border-radius: 0 0 2px 2px;
    }
    .dark & {
      border: 1px solid $gray_2;
      border-top: none;
    }
    .scrollable & {
      max-height: 300px;
      overflow: hidden;
      overflow-y: scroll;
    }
  }
  .title {
    align-items: center;
    border-bottom: 1px solid $gray_2;
    display: flex;
    justify-content: space-between;
    padding: 16px;
    .dark & {
      background: $gray_6;
      border-radius: 2px 2px 0 0;
      color: #fff;
    }
    .compact & {
      padding: 8px 16px
    }
    .grey & {
      background: #f9f9f9;
    }
    .purple & {
      background: $purple_tint;
    }
  }
  h2 {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
  }
  .expand-arrow {
    align-items: center;
    background: #f9f9f9;
    border-top: 1px solid $gray_2;
    display: flex;
    justify-content: center;
    padding: 12px 0;
    width: 100%;
    &:hover, &:focus {
      background: $gray_2;
    }
  }
</style>
