<template>
  <div class="viewer-pane">
    <div
      v-if="showPolymerViewer"
      ref="viewerWrap"
      class="viewer-wrap"
    />

    <component
      :is="cmpViewer"
      ref="viewer"
      :idx="0"
      :pkg="pkg"
    />

    <polymer-helper ref="polymerHelper" />
  </div>
</template>

<script>
  import { mapActions, mapState, mapGetters } from 'vuex'
  import { propOr, pathOr, path, isNil, compose, find, propEq } from 'ramda'

  import ImportHref from '../../../mixins/import-href'

  import FileTypeMapper from '../../../mixins/FileTypeMapper'
  import GetFileProperty from '../../../mixins/get-file-property'

  export default {
    name: 'ViewerPane',

    components: {
      'slide-viewer': () => import('@/components/viewers/SlideViewer/SlideViewer.vue'),
      'image-viewer': () => import('@/components/viewers/ImageViewer.vue'),
      'pdf-viewer': () => import('@/components/viewers/PDFViewer/PDFViewer.vue'),
      'text-viewer': () => import('@/components/viewers/TextViewer.vue'),
      'unknown-viewer': () => import('@/components/viewers/UnknownViewer.vue'),
      'video-viewer': () => import('@/components/viewers/VideoViewer.vue'),
      'timeseries-viewer': () => import('@/components/viewers/TSViewer/TSViewer.vue')
    },

    mixins: [
      FileTypeMapper,
      GetFileProperty,
      ImportHref
    ],

    props: {
      pkg: {
        type: Object,
        default: () => {}
      }
    },

    data: function() {
      return {
        cmpViewer: '',
        showPolymerViewer: false
      }
    },

    watch: {
      pkg: {
        handler: function(pkg) {
          if (Object.keys(pkg).length > 0 ) {
            this.loadViewer()
          }
        },
        immediate: true
      }
    },

    methods: {
      /**
       * Invoke method on viewer
       * Event emitted from palettes
       * @param {Object} evt
       */
      activeViewerAction: function(evt) {
        const method = propOr('', 'method', evt)
        const payload = propOr('', 'payload', evt)
        const viewer = this.cmpViewer !== '' ?
          this.$refs.viewer :
          this.$el.querySelector('#viewer')
        // Check the method
        if(viewer && typeof viewer[method] === 'function') {
          viewer[method](payload)
        }
      },

      /**
       * loads appropriate viewer based on package type
       */
      loadViewer: function() {
        const packageState = path(['content', 'state'], this.pkg)
        const packageType = pathOr('unknown', ['content', 'packageType'], this.pkg)
        const packageProperties = propOr([], 'properties', this.pkg)
        let component = packageType.toLowerCase()
        if (isNil(this.typeMapper[packageType]) || packageState === 'ERROR') {
          component = 'unknown';
        }

        // NOTE: temporary logic to handle "Unsupported" packageType value for text files
        const subtype = this.getFilePropertyVal(packageProperties, 'subtype').toLowerCase()
        if (this.whitelist.indexOf(subtype) >= 0) {
          component = 'text'
        }

        // Reset viewers
        this.cmpViewer = ''
        const viewerWrap = this.$refs.viewerWrap
        if (viewerWrap) {
          viewerWrap.innerHTML = ''
        }

        const vueViewers = ['image', 'pdf', 'text', 'unknown', 'video', 'slide','timeseries']
        if (vueViewers.indexOf(component) >= 0) {
          component += '-viewer'
          this.loadVueViewer(component)
        } else {
          this.loadPolymerViewer(component)
        }
      },

      /**
       * Notify the polymer viewer of a resize
       */
      notifyResize: function() {
        const viewer = this.$el.querySelector('#viewer')
        if (viewer && this.showPolymerViewer && typeof viewer['notifyResize'] === 'function') {
          viewer.notifyResize()
        }
      },

      /**
       * Load Vue viewer
       * @param {String} component
       */
      loadVueViewer: function(component) {
        this.cmpViewer = component
      },

      /**
       * Load Polymer viewer
       * @param {String} component
       */
      loadPolymerViewer: function(component) {
        const subtype = this.pkg.subtype ? this.pkg.subtype.toLowerCase() : null
        this.showPolymerViewer = true

        // Set directory of viewers based on viewer version
        let elName = `bf-viewer-${component}`;

        const polymerHelper = this.$refs.polymerHelper

        if (!polymerHelper) {
          return
        }

        this.importHref(`/web-components/src/components/blackfynn/viewers2/${component}/viewer.html`,
          () => {
            // post load, create the element based off new component
            // note the order you assign parameters is super important
            // be sure to pass in api, user, active organization, and
            // data first. callbacks depend on them!!

            const viewer = polymerHelper.create(elName, {
              id: 'viewer',
              data: this.pkg.content,
              props: this.pkg.properties,
              activeTool: this.activeTool,
              viewerIndex: 0,
              bfDataset: this.dataset,
              pkg: this.pkg,
              subtype,
            });

            // Set up watcher to notify resize
            this.$store.watch(state => state.viewer.viewerSidePanelOpen, this.notifyResize.bind(this))

            // set parentId
            const parentId = pathOr(pathOr('', ['content', 'datasetId'], this.pkg), ['parent', 'content', 'id'])(this.pkg)
            this.parentId = parentId

            // append new element to local DOM
            this.$nextTick(() => {
              const viewerWrap = this.$refs.viewerWrap
              if (viewerWrap) {
                viewerWrap.innerHTML = ''
                viewerWrap.appendChild(viewer)
              }
            });
          },
        true)
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .viewer-pane, .viewer-wrap {
    background: #dedede;
    display: flex;
    flex: 1;
    flex-direction: column;
    position: relative;
  }
</style>
