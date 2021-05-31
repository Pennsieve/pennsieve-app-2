<template>
  <div
    class="bf-page"
    :class="[condensed ? 'condensed' : '']"
  >
    <sandbox-organization-banner />
    <slot name="banner" />
    <slot name="heading" />
    <slot name="stage" />
    <slot />
  </div>
</template>

<script>
  import { pathOr } from 'ramda'
  import EventBus from '../../../utils/event-bus'
  import SandboxOrganizationBanner from '@/components/SandboxOrganizationBanner/SandboxOrganizationBanner.vue'

  export default {
    name: 'BfPage',

    components: {
      SandboxOrganizationBanner
    },

    data: function() {
      return {
        condensed: false
      }
    },

    mounted: function() {
      EventBus.$on('stage-scroll', this.onScroll.bind(this))
    },

    beforeDestroy: function() {
      EventBus.$off('stage-scroll', this.onScroll.bind(this))
    },

    methods: {
      /**
       * Set condensed if the user has scrolled down the view
       * @param {Object} evt
       */
      onScroll: function(evt) {
        const scrollTop = pathOr(0, ['target', 'scrollTop'], evt)
        this.condensed = scrollTop > 0
      }
    }
  }
</script>

<style lang="scss">
  .bf-page {
    display: flex;
    flex-direction: column;
  }
</style>
