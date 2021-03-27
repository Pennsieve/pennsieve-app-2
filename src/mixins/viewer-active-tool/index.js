import {
  mapState
} from 'vuex'

export default {
  computed: {
    ...mapState('viewer', [
      'viewerActiveTool'
    ])
  },

  watch: {
    viewerActiveTool: {
      handler: function (val) {
        if (val) {
          this.setActiveTool(val)
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Invoke method for tool if it exists
     * @param {String} activeTool
     */
    setActiveTool: function(activeTool) {
      if (activeTool) {
        // Set first character of tool to be capitalized to the method is camel case
        const methodName = 'set' + activeTool.charAt(0).toUpperCase() + activeTool.slice(1)

        // Check the method
        if(typeof this[methodName] === 'function') {
          this[methodName]()
        }
      }
    }
  }
}
