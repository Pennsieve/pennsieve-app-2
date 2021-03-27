<template>
  <div class="dataset-activity-detail">
    <div
      v-if="eventDetail.eventType === 'CREATE_PACKAGE'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>File Name:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <router-link
          v-if="isCollection"
          class="bf-menu-item"
          :to="{
            name: 'collection-files',
            params: {
              fileId: eventDetail.detail.nodeId,
            }
          }"
        >
          {{ eventDetail.detail.name }}
        </router-link>
        <router-link
          v-else
          class="bf-menu-item"
          :to="{
            name: 'file-record',
            params: {
              instanceId: eventDetail.detail.nodeId,
              conceptId: '00000000-0000-0000-0000-000000000000'
            }
          }"
        >
          {{ eventDetail.detail.name }}
        </router-link>
        <div
          v-if="hasParent"
          class="dataset-activity-detail__parent-info"
        >
          {{ eventDetail.detail.parent.name }}
        </div>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'DELETE_PACKAGE'"
      class="dataset-activity-detail__info"
    >
      <p>File Name:</p>
      <div class="dataset-activity-detail__info-link">
        <p> {{ eventDetail.detail.name }} </p>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'RENAME_PACKAGE'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>Previous Name: </p>
        <p>New Name: </p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p>{{ eventDetail.detail.oldName }}</p>
        <router-link
          v-if="isCollection"
          class="bf-menu-item"
          :to="{
            name: 'collection-files',
            params: {
              fileId: eventDetail.detail.nodeId
            }
          }"
        >
          {{ eventDetail.detail.newName }}
        </router-link>
        <router-link
          v-else
          class="bf-menu-item"
          :to="{
            name: 'file-record',
            params: {
              instanceId: eventDetail.detail.nodeId,
              conceptId: '00000000-0000-0000-0000-000000000000'
            }
          }"
        >
          {{ eventDetail.detail.newName }}
        </router-link>
        <div
          v-if="hasParent"
          class="dataset-activity-detail__parent-info"
        >
          {{ eventDetail.detail.parent.name }}
        </div>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'MOVE_PACKAGE'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>File Name </p>
        <p>Previous Location:</p>
        <p v-if="hasNewParent">
          New Location:
        </p>
      </div>

      <div class="dataset-activity-detail__info-link">
        <router-link
          v-if="isCollection"
          class="bf-menu-item"
          :to="{
            name: 'collection-files',
            params: {
              fileId: eventDetail.detail.nodeId
            }
          }"
        >
          {{ eventDetail.detail.name }}
        </router-link>
        <router-link
          v-else
          class="bf-menu-item"
          :to="{
            name: 'file-record',
            params: {
              instanceId: eventDetail.detail.nodeId,
              conceptId: '00000000-0000-0000-0000-000000000000'
            }
          }"
        >
          {{ eventDetail.detail.name }}
        </router-link>
        <p>{{ eventDetail.detail.oldParent.name }}</p>
        <p v-if="hasNewParent">
          {{ eventDetail.detail.newParent.name }}
        </p>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'UPDATE_MODEL_PROPERTY'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p> Model Name:</p>
        <p>Property:</p>
      </div>

      <div class="dataset-activity-detail__info-link">
        <router-link
          :to="{name: 'concept-search',
                params: {
                  conceptId: eventDetail.detail.modelId,
                }}"
        >
          <p>{{ eventDetail.detail.modelName }} </p>
        </router-link>

        <p>{{ eventDetail.detail.propertyName }}</p>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'CREATE_MODEL' || eventDetail.eventType === 'UPDATE_MODEL'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p> Model Name: </p>
      </div>

      <div class="dataset-activity-detail__info-link">
        <router-link
          :to="{name: 'concept-search',
                params: {
                  conceptId: eventDetail.detail.id,
                }}"
        >
          {{ eventDetail.detail.name }}
        </router-link>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'CREATE_MODEL_PROPERTY'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p> Model Name: </p>
        <p>Property: </p>
      </div>

      <div class="dataset-activity-detail__info-link">
        <router-link
          :to="{name: 'concept-search',
                params: {
                  conceptId: eventDetail.detail.modelId,
                }}"
        >
          {{ eventDetail.detail.modelName }}
        </router-link>

        <p>{{ eventDetail.detail.propertyName }}</p>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'DELETE_MODEL'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>Model Name: </p>
      </div>

      <div class="dataset-activity-detail__info-link">
        <p>{{ eventDetail.detail.name }}</p>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'DELETE_MODEL_PROPERTY'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p> Model Name: </p>
        <p> Property: </p>
      </div>

      <div class="dataset-activity-detail__info-link">
        <router-link
          :to="{name: 'concept-search',
                params: {
                  conceptId: eventDetail.detail.modelId,
                }}"
        >
          {{ eventDetail.detail.modelName }}
        </router-link>

        <p> {{ eventDetail.detail.propertyName }}</p>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'UPDATE_PERMISSION' && !parentPanel"
      class="dataset-activity-detail__info"
    >
      {{ renderPermissionDetail(eventDetail) }}
    </div>
    <div
      v-if="eventDetail.eventType === 'CREATE_RECORD'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p> Record Name: </p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <router-link
          :to="{name: 'concept-instance',
                params: {
                  conceptId: eventDetail.detail.modelId,
                  instanceId: eventDetail.detail.id
                }}"
        >
          {{ eventDetail.detail.name }}
        </router-link>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'DELETE_RECORD'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>Record Name: </p>
      </div>

      <div class="dataset-activity-detail__info-link">
        <p>{{ eventDetail.detail.name }} </p>
      </div>
    </div>
    <div
      v-if="eventDetail.eventType === 'UPDATE_RECORD'"
    >
      <div
        v-for="prop in eventDetail.detail.properties"
        :key="`${prop.name}-${prop.newValue}`"
        class="dataset-activity-detail__info"
      >
        <div class="info-title-update-record">
          <p>Record Name: </p>
          <p>Previous {{ prop.name }}: </p>
          <p>New {{ prop.name }}:</p>
          <p />
        </div>

        <div class="dataset-activity-detail__info-link">
          <router-link
            :to="{name: 'concept-instance',
                  params: {
                    conceptId: eventDetail.detail.modelId,
                    instanceId: eventDetail.detail.id
                  }}"
          >
            {{ eventDetail.detail.name }}
          </router-link>
          <p> {{ formatActivityValueForRecords(prop, prop.oldValue) }}</p>
          <p> {{ formatActivityValueForRecords(prop, prop.newValue) }}</p>
        </div>
      </div>
    </div>

    <!-- Dataset meta changes -->
    <div
      v-if="eventDetail.eventType === 'UPDATE_NAME'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>Previous Name:</p>
        <p>New Name:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p>{{ eventDetail.detail.oldName }}</p>
        <p>{{ eventDetail.detail.newName }}</p>
      </div>
    </div>

    <div
      v-if="eventDetail.eventType === 'UPDATE_DESCRIPTION'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p v-if="eventDetail.detail.oldDescription">
          Previous Subtitle:
        </p>
        <p>New Subtitle:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p v-if="eventDetail.detail.oldDescription">
          {{ eventDetail.detail.oldDescription }}
        </p>
        <p>{{ eventDetail.detail.newDescription }}</p>
      </div>
    </div>

    <div
      v-if="eventDetail.eventType === 'UPDATE_LICENSE'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p v-if="eventDetail.detail.oldLicense">
          Previous License:
        </p>
        <p>New License:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p v-if="eventDetail.detail.oldLicense">
          {{ eventDetail.detail.oldLicense }}
        </p>
        <p>{{ eventDetail.detail.newLicense }}</p>
      </div>
    </div>

    <div
      v-if="eventDetail.eventType === 'ADD_COLLECTION' || eventDetail.eventType === 'REMOVE_COLLECTION'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>Collection:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p>{{ eventDetail.detail.name }}</p>
      </div>
    </div>

    <div
      v-if="eventDetail.eventType === 'ADD_TAG' || eventDetail.eventType === 'REMOVE_TAG'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>Tag:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p>{{ eventDetail.detail.name }}</p>
      </div>
    </div>

    <dataset-activity-description-dialog
      v-if="eventDetail.eventType === 'UPDATE_README'"
      class="event-details-wrap"
      :description="eventDetail.detail.newReadme"
    />

    <div
      v-if="eventDetail.eventType === 'ADD_EXTERNAL_PUBLICATION' || eventDetail.eventType === 'REMOVE_EXTERNAL_PUBLICATION'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p>Type:</p>
        <p>Reference:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p>{{ getReferenceType(eventDetail.detail.relationshipType) }}</p>
        <dataset-reference :doi="eventDetail.detail.doi" />
      </div>
    </div>

    <div
      v-if="eventDetail.eventType === 'UPDATE_STATUS'"
      class="dataset-activity-detail__info"
    >
      <div class="info-title">
        <p v-if="eventDetail.detail.oldStatus">
          Previous Status:
        </p>
        <p>New Status:</p>
      </div>
      <div class="dataset-activity-detail__info-link">
        <p v-if="eventDetail.detail.oldStatus">
          {{ eventDetail.detail.oldStatus.displayName }}
        </p>
        <p>{{ eventDetail.detail.newStatus.displayName }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import FormatDisplayValue from '@/components/datasets/explore/ConceptInstance/format-display-value.js'
import DatasetActivityDescriptionDialog from '@/components/datasets/DatasetActivity/DatasetActivityDescriptionDialog/DatasetActivityDescriptionDialog.vue'

import DatasetReference from '@/components/shared/DatasetReference/DatasetReference.vue'

import RenderPermissionsMixin from '../RenderPermissionsMixin'
import { referenceTypeOptions } from '@/utils/constants'

  export default {
    name: 'DatasetActivityDetail',
    components: {
      DatasetActivityDescriptionDialog,
      DatasetReference
    },
    mixins: [
      FormatDisplayValue,
      RenderPermissionsMixin
    ],
    props: {
      eventDetail: {
        type: Object,
        default: () => {}
      },
      parentPanel: {
        type: Boolean,
        default: false
      },
    },
    computed: {
      /**
       * Is type collection
       * @returns {Boolean}
       */
      isCollection: function() {
        return this.eventDetail.detail.nodeId.includes('collection')
      },

      /**
       * Has parent folder
       * @returns {Boolean}
       */
      hasParent: function() {
        return this.eventDetail.detail.hasOwnProperty('parent')
      },

      /**
       * Has new parent folder
       * @returns {Boolean}
       */
      hasNewParent: function() {
        return this.eventDetail.detail.hasOwnProperty('newParent')
      }
    },

    methods: {
      /**
       * Get reference type
       * @param {String} type
       * @returns {String}
       */
      getReferenceType: function(type) {
        const { label } = referenceTypeOptions.find(item => item.value === type)
        return label || ''
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
.dataset-activity-detail {
   p {
    margin-bottom: -2px;
    font-size: 14px;
    line-height: 24px;
    color: $myelin;
   }
  &__parent-info {
    font-size: 12px;
    color: $myelin;
    font-weight: 400;
  }
  &__info {
    display: flex;
    flex-direction: row;
  }

  &__info-link {
    margin-top: 2px;
    margin-left: 52px;
    font-weight: 500;
  }

  .info-title-update-record {
    width: 25%;
  }

  .info-title {
    flex-shrink: 0;
    width: 130px;
  }

}

</style>
