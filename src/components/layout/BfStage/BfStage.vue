<template>
  <div :class="['bf-stage', this.isEditing ? 'editing' : '']">
    <template v-if="this.$slots['sidebar']">
      <div class="bf-sidebar-wrap">
        <div class="bf-stage-content">
          <slot />
        </div>

        <div class="stage-sidebar">
          <slot name="sidebar" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="bf-stage-content">
        <slot />
      </div>
    </template>
  </div>
</template>

<script>
  import EventBus from '../../../utils/event-bus'
  import throttle from 'lodash/throttle'

  export default {
    name: 'BfStage',

    props: {
      isEditing: {
        type: Boolean,
        default: false
      }
    },

    mounted: function() {
    this.$el.addEventListener('scroll', this.onScroll)
    },

    beforeDestroy: function() {
      this.$el.removeEventListener('scroll', this.onScroll)
    },

    methods: {
      /**
       * Method to scroll to top of the page
       */
      scrollToTop: function(){
        this.$el.scrollTop = 0
      },
      /**
       * Fire scroll event for BfPage to listen for
       * @param {Object} evt
       */
      onScroll: throttle(
        function(evt) {
          EventBus.$emit('stage-scroll', evt)
        },
        75
      )
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .bf-stage {
    flex: 1;
    overflow: auto;
    &.editing {
      background: $gray_1;
    }
  }
  .bf-stage-content {
    box-sizing: border-box;
    min-height: 100%;
    padding: 32px;
  }
  .graph-management {
    .bf-stage-content {
      padding: 24px 32px 32px 32px;
    }
  }
  .bf-sidebar-wrap {
    background-color: $white;
    display: flex;
    min-height: 100%;
    .editing & {
      background: inherit;
    }
    .bf-stage-content {
      flex: 1;
    }
  }
  .stage-sidebar {
    border-left: 1px solid $gray_2;
    box-sizing: border-box;
    width: 360px;
    h2 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    h3 {
      font-size: 20px;
      font-weight: 400;
    }
    h2, h3 {
      color: #000;
      margin: 0 0 8px;
    }
  }
  .sidebar-component {
    border-top: 1px solid $gray_2;
    &:first-child {
      border: none;
    }
  }
</style>
