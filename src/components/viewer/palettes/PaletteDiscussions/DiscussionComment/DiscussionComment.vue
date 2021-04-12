<template>
  <div class="discussion-comment">
    <div class="user-info mb-8">
      <avatar
        class="mr-8"
        :profile="owner"
      />
      <span class="user-name">
        {{ ownerName }}
      </span>
      <span class="timestamp">
        {{ timestamp.date }} &#8226; {{ timestamp.time }}
      </span>
    </div>

    <div class="comment-body">
      <div
        class="message"
        v-html="message"
      />
      <ul
        class="dot-list"
        :class="{ 'visible': isHovering }"
      >
        <li>
          <button @click="$emit('reply-click')">
            Reply
          </button>
        </li>
        <li v-if="userIsOwner">
          <button @click="onRemoveComment">
            Remove
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import {
    mapGetters,
    mapState,
    mapActions
  } from 'vuex'
  import {
    propOr,
    compose,
    replace,
    last,
    head
  } from 'ramda'

  import moment from 'moment'

  import Avatar from '../../../../shared/avatar/Avatar.vue'

  import Request from '../../../../../mixins/request'

  const getName = compose(replace('[', ''), head)
  const getId = compose(replace(')', ''), last)

  /**
   * Find mentions and convert them to HTML
   * @param {String} comment
   * @returns {Object}
   */
  const transformMentions = (comment) => {
    const transform = comment.map( (mention) => {
      const parts = mention.split('](');

      const transformed = parts.length > 0 ? `<span class="mention" id="${getId(parts)}">${getName(parts)}</span>` : '';

      return {
        raw: mention,
        transformed
      }
    });

    return transform;
  }

  /**
   * Transform comment to replace mentions with styled usernames
   * @param {String} comment
   * @param {Object} mentions
   * @returns {String}
   */
  const transformComment = (comment, mentions) => {
    mentions.forEach( ( mention) => {
      comment = comment.replace(mention.raw, mention.transformed);
    });

    return comment;
  }

  export default {
    name: 'DiscussionComment',

    components: {
      Avatar
    },

    mixins: [
      Request
    ],

    props: {
      isHovering: {
        type: Boolean,
        default: false
      },
      comment: {
        type: Object,
        default: function() {
          return {
            package_id: 0,
            createdAt: '',
            updatedAt: '',
            id: 0
          }
        }
      }
    },

    computed: {
      ...mapState([
        'config',
        'profile',
        'userToken'
      ]),

      ...mapGetters([
        'getOrgMember'
      ]),

      /**
       * Compute owner of the comment
       * @return {Object}
       */
      owner: function() {
        return this.getOrgMember(this.comment.creator_id)
      },

      /**
       * Compute if the user is the owner of the comment
       * @return {Boolean}
       */
      userIsOwner: function() {
        return this.owner.id === this.profile.id
      },

      /**
       * Compute the owner's full name
       * @return {String}
       */
      ownerName: function() {
        const firstName = propOr('', 'firstName', this.owner)
        const lastName = propOr('', 'lastName', this.owner)

        return `${firstName} ${lastName}`
      },

      /**
       * Compute timestamp
       * Objects with separate properties to display HTML in betwen values
       * @return {Object}
       */
      timestamp: function() {
        const timestamp = propOr('', 'updatedAt', this.comment)
        const day = 86400000;
        const now = Date.now();
        const timeDiff = now - timestamp;
        const time = moment(timestamp).utc().format('h:mm A');

        let date = '';

        if(timeDiff < day) {
          date = 'Today';
        } else if(timeDiff > day && timeDiff < day * 2) {
          date = 'Yesterday'
        } else {
          date = moment(timestamp).utc().format('MMMM D, YYYY');
        }
        return {
          date,
          time
        }
      },

      /**
       * Compute message by transforming the mentions to spans for rendering
       * @returns {String}
       */
      message: function() {
        let message = propOr('', 'message', this.comment)
        const filteredMentions = message.match(/\[(.*?)\]\((.*?)\)/g)

        if(filteredMentions) {
          const mentions = transformMentions(filteredMentions)

          const transformedComment = transformComment(message, mentions)

          message = transformedComment
        }

        return this.$sanitize(message, ['span'])
      }
    },

    methods: {
      ...mapActions('viewer', ['removeComment']),

      /**
       * Remove comment from discussion
       */
      onRemoveComment: function() {
        const discussionId = propOr(0, 'discussion_id', this.comment)
        const commentId = propOr(0, 'id', this.comment)

        // build url
        const url = `${this.config.apiUrl}/discussions/${discussionId}/comment/${commentId}?api_key=${this.userToken}`

        this.sendXhr(url, {
          method: 'DELETE'
        }).then(() => {
            this.removeComment(this.comment)
        })
        .catch(this.handleXhrError.bind(this))
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../../../assets/_variables.scss';

  .discussion-comment {
    font-size: 13px;
    padding: 0 16px 8px 8px;
    position: relative;
    &:not(:last-child) {
      .comment-body:before {
        background: $gray_2;
        content: '';
        display: block;
        height: calc(100% + 20px);
        left: 15px;
        position: absolute;
        top: -10px;
        width: 2px;
      }
    }
  }
  .avatar-circle {
    position: relative;
    z-index: 1;
  }
  .annotation {
    align-items: center;
    display: flex;
    font-size: 12px;
    margin-bottom: 20px;
    padding: 0 15px 0 13px;
    position: relative;
  }
  .user-name {
    font-weight: 500;
    margin-right: 5px;
  }
  .timestamp {
    color: $gray_4;
    font-size: 12px;
  }
  ul.dot-list {
    opacity: 0;
    &.visible {
      opacity: 1;
    }
  }
  .comment-body {
    padding-left: 43px;
    position: relative;
  }
</style>
<style lang="scss">
  @import '../../../../../assets/_variables.scss';

  .discussion-comment {
    .mention {
      color: $app-primary-color;
    }
  }
</style>
