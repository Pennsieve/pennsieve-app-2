<template>
  <div
    class="dataset-activity-panel"
    :class="{'date-grouped': dateGroupHeading }"
  >
    <h3 v-if="dateGroupHeading">
      {{ dateGroupHeading }}
    </h3>
    <div
      class="dataset-activity-panel-item"
    >
      <div class="dataset-activity-panel-item__info">
        <div class="dataset-activity-panel-item__info__label-wrap">
          <div class="dataset-activity-panel-item__info__label-activity">
            <span
              v-if="isPublishingChange(event.eventType)"
              class="label-publishing"
            >
              Publishing
            </span>


            <dataset-activity-metadata-label
              v-if="isMetadataUpdate"
              :event="event"
            />

            <span v-else>
              {{ renderActivityType(event.eventType) }}
            </span>

            <a
              v-if="event.eventType === 'ACCEPT_PUBLICATION' || event.eventType === 'RELEASE_EMBARGO'"
              target="_blank"
              :href="discoverLink"
              :class="[!wasPublished ? 'disabled': '']"
            >
              View on Discover
            </a>
          </div>

          <dataset-activity-detail
            v-if="totalCount === 1 && !isPublishingChange(event.eventType) && !hideMetadataDetails(event.eventType)"
            :parent-panel="true"
            :event-detail="event.event"
          />
        </div>

        <div class="dataset-activity-panel-item__info--meta">
          <div class="user-wrap">
            <div
              v-for="userId in event.userIds.slice(0,3)"
              :key="userId"
              class="user-avatar-list"
            >
              <div class="user-avatar">
                <avatar
                  :user="getOrgMemberByIntId(userId)"
                  :tooltip="true"
                />
              </div>
            </div>

            <div
              v-if="event.userIds.length > 3"
              class="truncate-user-tooltip"
            >
              <el-tooltip
                ref="tooltip"
                placement="top-start"
                :content="populateUserList"
              >
                <div class="test">
                  + {{ (event.userIds.length - 3) }}
                </div>
              </el-tooltip>
            </div>
          </div>
          <p class="info-date">
            {{ formatDateRange(event.timeRange.start, event.timeRange.end) }}
          </p>
        </div>
      </div>

      <dataset-activity-panel-dropdown
        v-if="totalCount > 1 && !isPublishingChange(event.eventType) && event.eventType !== 'UPDATE_IGNORE_FILES' && event.eventType !== 'UPDATE_BANNER_IMAGE'"
        class="event-details-wrap"
        :event="event"
        :total-count="totalCount"
        :dataset="dataset"
      />

      <dataset-activity-description-dialog
        v-if="event.eventType === 'UPDATE_README' && event.totalCount === 1"
        class="event-details-wrap"
        :description="event.event.detail.newReadme"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { pathOr } from 'ramda'
import moment from 'moment'

import DatasetActivityPanelDropdown from '@/components/datasets/DatasetActivity/DatasetActivityPanelDropdown/DatasetActivityPanelDropdown.vue'
import DatasetActivityDetail from '@/components/datasets/DatasetActivity/DatasetActivityDetail/DatasetActivityDetail.vue'
import DatasetActivityMetadataLabel from '@/components/datasets/DatasetActivity/DatasetActivityMetadataLabel/DatasetActivityMetadataLabel.vue'
import DatasetActivityDescriptionDialog from '@/components/datasets/DatasetActivity/DatasetActivityDescriptionDialog/DatasetActivityDescriptionDialog.vue'
import Avatar from '@/components/shared/avatar/Avatar.vue'

import formatDateRange from '@/mixins/format-date/index'
import Request from '@/mixins/request/index'
import RenderPermissionsMixin from '../RenderPermissionsMixin'

import { ChangelogMessage, PublicationStatus } from '@/utils/constants'

  export default {
    name: 'DatasetActivityPanel',
    components: {
      Avatar,
      DatasetActivityPanelDropdown,
      DatasetActivityDetail,
      DatasetActivityMetadataLabel,
      DatasetActivityDescriptionDialog
    },
    mixins: [
      formatDateRange,
      Request,
      RenderPermissionsMixin
    ],
    props: {
      event: {
        type: Object,
        default: () => {}
      },
      previousEvent: {
        type: Object,
        default: () => {}
      },
    },
    data() {
      return {
        ChangelogMessage,
        PublicationStatus,
        detailsVal: 'Show details'
      }
    },
     computed: {
      ...mapGetters(['getOrgMemberByIntId']),
      ...mapState(['config', 'userToken', 'dataset']),

      /**
       * Checks if dataset has publication link and was successfully
       * published to Discover
       */
      wasPublished: function() {
        return this.dataset.publication && this.dataset.publication.status !== this.PublicationStatus.FAILED
      },

      /**
       * Returns discover link
       * @returns {String}
       */
       discoverLink: function() {
         if (!this.wasPublished) {
           return ''
         }
         return this.config.environment === 'prod' ? `https://discover.blackfynn.com/datasets/${this.publishedId}` : `https://discover.blackfynn.net/datasets/${this.publishedId}`
       },

      /**
       * Get dataset int id
       * @returns {Number}
       */
      publishedId: function() {
        return pathOr(0, ['publication', 'publishedDataset', 'id'], this.dataset)
      },

      /**
       * Date group heading
       * @returns {String}
       */
      dateGroupHeading: function() {
        const startDate = moment(this.event.timeRange.start)
        const previousDate = pathOr('', ['timeRange', 'start'], this.previousEvent)

        return startDate.isSame(previousDate, 'month')
           ? ''
           : startDate.format('MMMM YYYY')
      },

      /**
       * Checks if changelog item is a metadata update so as not to
       * render the dropdown
       * @returns {Boolean}
       */
      isMetadataUpdate: function() {
        const metaEvents = Object.keys(ChangelogMessage.METADATA_UPDATE)
        return metaEvents.includes(this.event.eventType)
      },

      /**
       * Populates list of names for tooltip if userlist exceeds three users
       * for a particular changelog item
       * @returns {String}
       */
      populateUserList: function() {
        let userList = []
        if (this.event.userIds.length > 3) {
          this.event.userIds.slice(3, this.event.userIds.length).forEach(idx => {
            userList.push(this.fullName(idx))
          })
        }
        if (userList.length > 1) {
          return userList.toString()
        }
        return userList.join(', ')
      },

      /**
       * Grabs the total count of event items
       * @returns {Number}
       */
      totalCount: function() {
        return this.event.totalCount
      },

      /**
       * Count to be displayed next to changelog item
       * @TODO will be used when generating count and plural/singular descriptions
       * @returns {Number}
       */
      displayCount: function() {
        return this.totalCount > 1 ? this.totalCount : ''
      }
    },

    methods: {
      renderPermissionsActivity: function() {
        return this.totalCount > 1
          ? 'Permissions changed'
          : this.renderPermissionDetail(this.event.event)
      },

      /**
       * Renders activity based on event type
       * @param {String} eventType
       * @returns {String}
       */
      renderActivityType: function(eventType) {
        if (this.ChangelogMessage.PUBLISHING.hasOwnProperty(eventType)) {
          const publishing = this.ChangelogMessage.PUBLISHING
          return publishing[eventType]
        } else if (typeof this.ChangelogMessage[eventType] === 'object' && this.ChangelogMessage[eventType] !== null) {
          return this.totalCount > 1
            ? `${this.totalCount} ${this.ChangelogMessage[this.event.eventType].plural}`
            : this.ChangelogMessage[this.event.eventType].singular
        } else {
          // user permissions
          return this.renderPermissionsActivity()
        }
      },

      /**
       * Indicator label for publishing changlog items
       * @param {String} eventType
       * @returns {Boolean}
       */
      isPublishingChange: function(eventType) {
        const publishing = this.ChangelogMessage.PUBLISHING
        return publishing.hasOwnProperty(eventType)
      },

      /**
       * Grabs the full name of a user
       * @param {Number} id
       * @returns {String}
       */
      fullName: function(id) {
        const user = this.getOrgMemberByIntId(id)
        return `${user.firstName} ${user.lastName}`
      },

      /**
       * Should show metadata changes if specific
       * metadata changes
       * @param {String} eventType
       * @returns {Boolean}
       */
      hideMetadataDetails: function(eventType) {
        const metadataChanges = ['ADD_TAG', 'REMOVE_TAGS', 'UPDATE_LICENSE', 'UPDATE_README']
        return metadataChanges.includes(eventType)
      }
    }
    }
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
.dataset-activity-panel {
  p {
    color: $gray_6;
  }

  .dataset-activity-panel-item {
    border: solid 1px $gray_2;
    padding: 16px 12px;
    @media (min-width: 1025px) {
      padding: 16px 24px;
    }
    &__info {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      p {
        font-size: 16px;
        color: #000;
      }
      &__label-activity {
        align-items: flex-start;
        flex-direction: column;
        display: flex;
        margin-top: 10px;
        a {
          margin-left: 10px;
        }
        .disabled {
          color: $purple_tint;
          opacity: 0.5;
          text-decoration: none;
        }
        @media (min-width: 1025px) {
          align-items: center;
          font-size: 16px;
          flex-direction: row;
          margin-bottom: 4px;
        }
      }

      &--meta {
        align-items: flex-end;
        display: flex;
        flex-direction: column;

        @media (min-width: 1025px) {
          align-items: center;
          flex-direction: row;
          justify-content: space-between;
        }

        p {
          color: $gray_6;
          margin: 0 0 8px 0;
          width: 160px;
          display: flex;
          justify-content: flex-end;

          @media (min-width: 1025px) {
            margin: 0 0 0 40px;
          }
        }

        .truncate-user-tooltip {
          color: $gray_6;
          font-size: 14px;
          font-weight: normal;
          line-height: 16px;
          margin: 0 0 0 8px;
          cursor: pointer;

          @media (min-width: 1025px) {
            margin: 0 -27px 0 8px;
          }
        }

        .info-date {
          font-size: 14px;
        }

        .user-wrap {
          align-items: center;
          display: flex;
          order: 2;
          z-index: 1;

          @media (min-width: 1025px) {
            order: unset;
          }
        }

        .user-avatar-list {
          position: relative;
          margin-left: -6px;

          &:first-child {
            margin-left: 0;
            z-index: 100;
          }

          &:nth-child(2) {
            z-index: 10;
          }

          &:nth-child(3) {
            z-index: 0;
          }

        }
      }
    }

    &__dropdown {
      width: 100%;
    }

    &__block {
      display: flex;
      flex-direction: row;
      p {
        margin-left: 56px;
      }
    }
  }

  /deep/ .avatar-circle {
    border: solid 2px white;
    font-size: 12.2px;

  }
}
.label-publishing {
  border: solid 1px $purple_1;
  border-radius: 15px;
  background-color: $purple_1;
  padding: 5px 13px;
  margin: 0 0 13px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  @media (min-width: 1025px) {
    margin: 0 16px 0 0;
  }
}
.event-details-wrap {
  position: relative;
  top: -20px;
  @media (min-width: 1025px) {
    position: static;
    top: auto;
  }
}
</style>
