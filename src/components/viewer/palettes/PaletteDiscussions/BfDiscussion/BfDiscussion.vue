<template>
  <div
    class="bf-discussion"
    :class="{ 'hovering': isHovering }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div
      v-if="hasAnnotation"
      class="annotation"
    >
      <ul class="dot-list">
        <li>
          <button
            class="grey-link"
            @click="jumpToAnnotation"
          >
            Jump to annotation
          </button>
        </li>
        <li>
          <button
            class="grey-link"
            @click="viewAnnotation"
          >
            View details
          </button>
        </li>
      </ul>
    </div>

    <div>
      <discussion-comment
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :is-hovering="isHovering"
        @reply-click="setReplying"
      />
    </div>

    <discussion-add-comment
      v-if="isReplying"
      ref="addComment"
      :discussion="discussion"
      @reset="isReplying = false"
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

  import DiscussionComment from '../DiscussionComment/DiscussionComment.vue'
  import DiscussionAddComment from '../DiscussionAddComment/DiscussionAddComment.vue'

  import EventBus from '../../../../../utils/event-bus'

  export default {
    name: 'BfDiscussion',

    components: {
      DiscussionComment,
      DiscussionAddComment
    },

    mixins: [
    ],

    props: {
      discussion: {
        type: Object,
        default: function() {
          return {
            package_id: 0,
            createdAt: '',
            updatedAt: '',
            id: 0
          }
        }
      },
      comments: {
        type: Array,
        default: function() {
          return []
        }
      }
    },

    data() {
      return {
        isHovering: false,
        isReplying: false
      }
    },

    computed: {
      /**
       * Compute if the discussion is about an annotation
       * @return {Boolean}
       */
      hasAnnotation: function() {
        return Boolean(this.discussion.annotation_id)
      },
    },

    methods: {
      /**
       * Set replying mode and focus on add comment input
       */
      setReplying: function() {
        this.isReplying = true
        this.$nextTick(() => {
          this.$refs.addComment.focus()
        })
      },

      /**
       * Jump to the annotation in the viewer the discussion is about
       */
      jumpToAnnotation: function() {
        const annotationId = propOr('', 'annotation_id', this.discussion)
        EventBus.$emit('active-viewer-action', {
          method: 'focusAnnotation',
          payload: annotationId
        })
      },

      /**
       * Emit event to view annotation in the annotations palette
       */
      viewAnnotation: function() {
        const annotationId = propOr('', 'annotation_id', this.discussion)
        EventBus.$emit('view-annotation', annotationId)
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../../../assets/_variables.scss';
  .bf-discussion {
    border-bottom: 1px solid $gray_2;
    padding-top: 32px;
    &.hovering {
      background: #fff;
    }
  }
  .annotation {
    align-items: center;
    color: $gray_4;
    display: flex;
    font-size: 12px;
    margin-bottom: 20px;
    padding: 0 15px 0 13px;
    position: relative;
  }
  .dot-list {
    margin: 0;
  }
</style>

<style lang="scss">
  @import '../../../../../assets/_variables.scss';
</style>
