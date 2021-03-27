import { compose, pathOr, indexOf, prop, concat, propOr, reject, propEq, findIndex } from 'ramda'
import { mapState, mapGetters } from 'vuex'
import { viewerToolTypes } from '@/utils/constants'

/**
 * Check package type
 * @param {String} packageType
 * @param {Array} item
 */
const checkPackageType = (packageType, item) => compose(
  indexOf(packageType),
  prop('packages')
)(item)

export default {

  data: function() {
    return {
      activeTool: 'pointer',
      tools: [
        {
          eventName: viewerToolTypes.PAN,
          packages: [
            'Slide', 'TimeSeries'
          ],
          icon: 'icon-hand',
          tooltip: 'Pan'
        },
        {
          eventName: viewerToolTypes.ANNOTATION_SHAPE,
          packages: [
            'Slide'
          ],
          icon: 'icon-dashed-annotation',
          tooltip: 'Annotate Area'
        },
        {
          eventName: viewerToolTypes.ANNOTATION_DRAW,
          packages: [
            'Slide'
          ],
          icon: 'icon-pencil',
          tooltip: 'Annotate Free Form'
        },
        {
          eventName: viewerToolTypes.MEASURE,
          packages: [
            'Slide'
          ],
          icon: 'icon-ruler',
          tooltip: 'Measure'
        },
        {
          eventName: viewerToolTypes.ANNOTATE,
          packages: [
            'TimeSeries'
          ],
          icon: 'icon-dashed-annotation',
          tooltip: 'Annotate'
        }
      ],

      /**
       * Tools that are default to every viewer
       */
      defaultTools: [
        {
          eventName: viewerToolTypes.POINTER,
          icon: 'icon-mouse-cursor',
          tooltip: 'Select'
        }
      ],

      /**
       * Palettes available for viewers to use
       */
      palettes: [
        {
          eventName: 'annotations',
          packages: [
            'Slide', 'TimeSeries'
          ],
          icon: 'icon-annotation',
          tooltip: 'Annotations'
        },
        {
          eventName: 'navigator',
          packages: [
            'Slide'
          ],
          icon: 'icon-compass',
          tooltip: 'Navigator'
        },
        {
          eventName: 'channels',
          packages: [
            'TimeSeries'
          ],
          icon: 'icon-channel',
          tooltip: 'Channels'
        }
      ],
      /**
       * Palettes that are default to every viewer
       */
      defaultPalettes: [
        {
          eventName: 'infoPanel',
          icon: 'icon-info',
          tooltip: 'Info Panel'
        },
        {
          eventName: 'discussion',
          icon: 'icon-discussion',
          tooltip: 'Discussions'
        },
        {
          eventName: 'fileBrowser',
          icon: 'icon-file-explorer',
          tooltip: 'File Explorer'
        }
      ],
      isMppVisible: false
    }
  },

  computed: {
    ...mapGetters('viewer', [
      'viewerMpp'
    ]),

    ...mapState('viewer', [
      'activeViewer',
      'viewerSlideInfo'
  ]),

    ...mapGetters([
      'getPermission'
    ]),

    /**
     * Compute available tools based on the active viewer
     * @returns {Array}
     */
    availableTools: function() {
      if (Object.keys(this.activeViewer).length <= 0 ) {
        return
      }

      let tools = this.getAvailable(this.activeViewer, this.tools, this.defaultTools)

      // Check if the viewer has MPP
      const hasMpp = this.viewerMpp !== ''
      if (hasMpp === false) {
        tools = reject(propEq('eventName', 'measure'), tools)
      }

      return tools
    },

    /**
     * Compute available palettes based on the active viewer
     * @returns {Array}
     */
    availablePalettes: function() {
      if (Object.keys(this.activeViewer).length <= 0 ) {
        return
      }

      return this.getAvailable(this.activeViewer, this.palettes, this.defaultPalettes)
    }
  },

  methods: {
    /**
     * Create list of available tools based off of active viewer's package type and default tools
     * @param {Object} viewer
     * @param {Array} list
     * @param {Array} defaultList
     * @return {Array}
     */
    getAvailable: function(viewer, list, defaultList) {
      let type = pathOr('', ['content', 'packageType'], viewer)
      const packageState = pathOr('', ['content', 'state'], viewer)

      if (packageState === 'ERROR') {
        type = 'unknown'
      }
      const available = concat(defaultList, list.filter(item => checkPackageType(type, item) > -1))

      // Remove tools if the user does not have permission
      const disallowedTools = ['annotationShape', 'annotationDraw', 'annotate']

      const hasPermission = this.getPermission('editor')

      if (!hasPermission) {
        disallowedTools.forEach(item => {
          const idx = findIndex(propEq('eventName', item), available)
          if (idx >= 0) {
            available.splice(idx, 1)
          }
        })
      }

      return available
    }
  }
}
