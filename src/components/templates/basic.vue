<template>
  <div class="basic-component" />
</template>

<script>
  // 3rd party libraries
  // import { propOr } from 'ramda'

  // Pennsieve components
  // import BfPage from 'path/to/file'

  // Pennsieve mixins
  // import Request from 'path/to/mixins/request'

  // Pennsieve utils
  // import EventBus from 'path/to/utils/event-bus'

  export default {
    // Global Awareness (requires knowledge beyond the component)
    name: 'BasicComponent',

    // Template Dependencies (assets used in the template)
    components: {},

    // Composition (merges properties into the options)
    mixins: [],

    // Interface (the interface to the component)
    props: {
      employees: {
        type: Array,
        default: function() {
          return ['Cameron', 'Maha', 'Daniel']
        }
      }
    },

    // Local State (local reactive properties)
    data() {
      return {}
    },

    computed: {},

    // Events (callbacks triggered by reactive events e.g. watch, lifecycle methods)
    watch: {
      employees: {
        handler(val, oldVal) {

        }
      }
    },

    created() {},

    mounted() {},

    beforeDestroy() {},

    // Non-Reactive Properties (instance properties independent of the reactivity system)
    methods: {}
  }
</script>

<style lang="scss" scoped>
  .basic-component {

  }
</style>