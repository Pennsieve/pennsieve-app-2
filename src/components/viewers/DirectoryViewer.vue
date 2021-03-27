<template>
  <div
    v-loading="isDirectoryLoading"
    class="directory-viewer"
  >
    <directory-explorer :directory-data="DirecoryData" />
  </div>
</template>

<script>
import { pathOr, is } from 'ramda'
import DirectoryExplorer from '@/components/shared/DirectoryExplorer/DirectoryExplorer.vue'
import StaticViewer from '@/mixins/static-viewer'
import GetFileProperty from '@/mixins/get-file-property'
import Request from '@/mixins/request'
import { transformDirectoryData } from '@/utils/data-transformers'

export default {
  name: 'DirectoryViewer',

  components: {
    DirectoryExplorer
  },

  mixins: [StaticViewer, GetFileProperty, Request],

  props: {
    pkg: {
      type: Object,
      default: () => {}
    },
    idx: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      DirecoryData: [],
      isDirectoryLoading: true
    }
  },

  computed: {
    /**
     * Compute subtype from Package DTO
     * @returns {String}
     */
    subtype: function() {
      return this.getFilePropertyVal(
        this.pkg.properties,
        'subtype'
      ).toLowerCase()
    },
    /**
     * Determines whether or not subtype is text
     * @returns {Boolean}
     */
    isText: function() {
      return this.subtype === 'text'
    }
  },

  watch: {
    getFileUrl: {
      handler: function(url) {
        if (url) {
          this.getData(url)
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Fetch file data
     * @param {String} url
     */
    getData: function(url) {
      this.isDirectoryLoading = true
      this.sendXhr(url)
        .then(data => {
          this.isDirectoryLoading = false
          this.DirecoryData = [{
            text: pathOr('root', ['content', 'name'], this.pkg),
            opened: true,
            selected: false,
            isLeaf: true,
            children: is(Array, data) ? transformDirectoryData(data) : []
          }]
        })
        .catch(err => {
          this.isDirectoryLoading = false
          this.handleXhrError(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.directory-viewer {
  /deep/ .directory-tree {
    margin-left: -25px;
  }
}
</style>
