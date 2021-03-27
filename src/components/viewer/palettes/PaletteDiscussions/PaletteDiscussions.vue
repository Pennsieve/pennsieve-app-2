<template>
  <div
    v-loading="isLoading"
    class="palette-discussions"
  >
    <discussion-add-comment
      ref="addComment"
      :annotation-id.sync="annotationId"
      :start-discussion="true"
    />

    <div
      v-if="hasDiscussions"
      class="discussions-wrap"
    >
      <bf-discussion
        v-for="item in sortedDiscussions"
        :id="item.id"
        :key="item.id"
        :discussion="item"
        :comments="getComments(item.id)"
      />
    </div>

    <viewer-side-panel-empty-state v-if="showEmptyState">
      <img
        slot="illustration"
        src="/static/images/illustrations/illo-sharing.svg"
        alt="illustration of two people interacting"
      >
      <p>Add a comment to start a discussion. @mention a team member to send an them an invitation to comment.</p>
    </viewer-side-panel-empty-state>

    <div
      v-if="overlayIsVisible"
      class="mentions-overlay"
      @click="overlayIsVisible = false"
    />
  </div>
</template>

<script>
  import {
    mapState,
    mapActions
  } from 'vuex'
  import {
    pathOr,
    propOr,
    defaultTo
  } from 'ramda'

  import BfDiscussion from './BfDiscussion/BfDiscussion.vue'
  import DiscussionAddComment from './DiscussionAddComment/DiscussionAddComment.vue'
  import ViewerSidePanelEmptyState from '../../BfViewerSidePanel/ViewerSidePanelEmptyState/ViewerSidePanelEmptyState.vue'

  import Request from '../../../../mixins/request'
  import ImportHref from '../../../../mixins/import-href'
  import Sorter from '../../../../mixins/sorter'

  export default {
    name: 'PaletteDiscussions',

    components: {
      BfDiscussion,
      DiscussionAddComment,
      ViewerSidePanelEmptyState
    },

    mixins: [
      ImportHref,
      Request,
      Sorter
    ],

    data() {
      return {
        overlayIsVisible: false,
        annotationId: null
      }
    },

    computed: {
      ...mapState('viewer', ['activeViewer', 'viewerSidePanelView', 'viewerDiscussions']),
      ...mapState(['config', 'userToken']),

      /**
       * Compute URL for getting discussions
       * @returns {String}
       */
      getDiscussionsUrl: function() {
        const packageId = pathOr('', ['content', 'id'], this.activeViewer)
        const apiUrl = propOr('', 'apiUrl', this.config)

        if (packageId && apiUrl && this.viewerSidePanelView === 'discussion') {
          return `${apiUrl}/discussions/package/${packageId}?api_key=${this.userToken}`
        }

        return null
      },

      /**
       * Compute URL for creating discussions
       * @returns {String}
       */
      createDiscussionsUrl: function() {
        const apiUrl = propOr('', 'apiUrl', this.config)

        if (apiUrl) {
          return `${apiUrl}/discussions?api_key=${this.userToken}`
        }

        return null
      },

      /**
       * Compute if the package has discussions
       * @returns {Boolean}
       */
      hasDiscussions: function() {
        const discussions = propOr([], 'discussions', this.viewerDiscussions)
        return discussions.length > 0
      },

      /**
       * Sort discussions by updatedAt
       * @returns {Array}
       */
      sortedDiscussions: function() {
        return this.returnSort('updatedAt', this.viewerDiscussions.discussions, 'desc')
      },

      /**
       * Show empty state if there are no discussions and it is not loading
       * @returns {Boolean}
       */
      showEmptyState: function() {
        return this.hasDiscussions === false && this.isLoading === false
      }
    },

    watch: {
      /**
       * Watch discussions URL changes and get discussions
       */
      getDiscussionsUrl: {
        handler: function(val) {
          if (val) {
            this.getDiscussions()
          }
        },
        immediate: true
      }
    },

    methods: {
      ...mapActions('viewer', ['setDiscussions', 'removeDiscussion']),

      /**
       * Get discussions and set state
       */
      getDiscussions: function() {
        this.sendXhr(this.getDiscussionsUrl).then(response => {
          const discussions = defaultTo([], response)
          this.setDiscussions(discussions)
        })
        .catch(this.handleXhrError.bind(this))
      },

      /**
       * Start discussion from annotation
       * @param {String} annotationId
       */
      startDiscussion: function(annotationId) {
        this.annotationId = annotationId
        this.$refs.addComment.focus()
      },

      /**
       * Get comments by discussion ID
       * @param {String}
       * @returns {Array}
       */
      getComments: function(id) {
        return pathOr([], ['comments', id], this.viewerDiscussions)
      }
    }
  }
</script>

<style scoped>
  .palette-discussions {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }
  .discussions-wrap {
    flex: 1;
    overflow: scroll;
  }
  .mentions-overlay {
    background-color: #4A4A4A;
    display: block;
    height: 100%;
    left: 0;
    opacity: .51;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 99;
  }
</style>
