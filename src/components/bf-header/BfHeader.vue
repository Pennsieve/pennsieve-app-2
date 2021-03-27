<template>
  <div class="bf-header">
    <div class="bf-header-left">
      <button
        id="btn-close-viewer"
        class="button-icon"
        @click="closeViewer"
      >
        <svg-icon
          name="icon-remove"
          width="16"
          height="16"
        />
      </button>
    </div>

    <div class="package-name">
      {{ packageName }}
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { pathOr, pick } from 'ramda'

  export default {
    name: 'BfHeader',

    props: {
      hasChanges: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      ...mapState('viewer', ['activeViewer']),
      ...mapState([
        'dataset',
        'lastRoute',
      ]),

      ...mapGetters([
        'hasFeature'
      ]),

      /**
       * Compute active viewer's name
       * @returns {String}
       */
      packageName: function() {
        return pathOr('', ['content', 'name'], this.activeViewer)
      }
    },

    methods: {
      /**
       * Close the viewer and send user to their last route, or dataset files
       */
      closeViewer: function() {
        let route = {}

        if (this.lastRoute) {
          route = pick(['name', 'params'], this.lastRoute)
        } else {
          // Send to files route for dataset the file is in
          const datasetId = pathOr('', ['content', 'id'], this.dataset)
          route = {
            name: 'dataset-files',
            params: {
              datasetId
            }
          }
        }

        this.$router.push(route)

        // short circuit if viewer has changes
        if (this.hasChanges) {
          return
        }

        this.$store.dispatch('viewer/closeViewer')
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../assets/_variables.scss';

  .bf-header {
    align-items: center;
    background: $app-primary-color;
    box-sizing: border-box;
    color: #fff;
    display: flex;
    height: 50px;
    padding: 16px 16px 12px;
    position: relative;
    width: 100%;
  }
  #btn-close-viewer {
    color: #fff;
    height: 32px;
    margin: -4px 0 0 -8px;
    width: 32px;
    &:hover, &:focus {
      color: $neuron;
    }
  }
  .package-name {
    left: 50%;
    position: absolute;
    transform: translateX(-50%)
  }
</style>
