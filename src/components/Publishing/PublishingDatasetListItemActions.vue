<template>
  <div class="button-wrapper">
    <template
      v-if="PublicationTabsStatuses[PublicationTabs.REVIEW].includes(datasetPublicationStatus)"
    >
      <!-- If user is a publisher -->
      <template v-if="isUserPublisher && !isPublishedTab">
        <template v-if="datasetPublicationType === PublicationType.REMOVAL">
          <a
            class="red"
            :disabled="!!inFlightStatus"
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.REMOVAL)"
          >
            Unpublish Dataset
          </a>
        </template>
        <template v-else-if="datasetPublicationType === PublicationType.REVISION">
          <a
            :disabled="!!inFlightStatus"
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.REVISION)"
          >
            Accept Revision
          </a>
        </template>
        <template v-else-if="datasetPublicationType === PublicationType.EMBARGO">
          <a
            :disabled="!!inFlightStatus || datasetPublicationStatus === PublicationStatus.ACCEPTED"
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.EMBARGO)"
          >
            <template v-if="datasetPublicationStatus === PublicationStatus.FAILED">
              Try Again
            </template>
            <template v-else>
              Publish Dataset
            </template>
          </a>
        </template>
        <template v-else-if="datasetPublicationType === PublicationType.RELEASE">
          <a
            :disabled="!!inFlightStatus || datasetPublicationStatus === PublicationStatus.ACCEPTED"
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.RELEASE)"
          >
            <template v-if="datasetPublicationStatus === PublicationStatus.FAILED">
              Try Again
            </template>
            <template v-else>
              Release Now
            </template>
          </a>
        </template>
        <template v-else>
          <a
            :disabled="!!inFlightStatus || datasetPublicationStatus === PublicationStatus.ACCEPTED"
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.PUBLICATION)"
          >
            <template v-if="datasetPublicationStatus === PublicationStatus.FAILED">
              Try Again
            </template>
            <template v-else>
              Publish Dataset
            </template>
          </a>
        </template>
        <a
          v-if="datasetPublicationStatus === PublicationStatus.FAILED"
          :disabled="!!inFlightStatus"
          href="#"
          @click.prevent="triggerRequest(PublicationStatus.REJECTED, datasetPublicationType)"
        >
          Cancel
        </a>
        <a
          v-else
          :disabled="!!inFlightStatus || datasetPublicationStatus === PublicationStatus.ACCEPTED"
          href="#"
          @click.prevent="triggerRequest(PublicationStatus.REJECTED, datasetPublicationType)"
        >
          Reject Revision
        </a>
        <a
          v-if="isUserDatasetOwner(dataset) && datasetPublicationStatus !== PublicationStatus.FAILED"
          href="#"
          :disabled="!!inFlightStatus"
          @click.prevent="triggerRequest(PublicationStatus.CANCELLED, datasetPublicationType)"
        >
          Withdraw Dataset
        </a>
      </template>
      <!-- If user is not a publisher -->
      <template v-else>
        <a
          v-if="isUserDatasetOwner(dataset)"
          href="#"
          :disabled="!!inFlightStatus"
          @click.prevent="triggerRequest(PublicationStatus.CANCELLED, datasetPublicationType)"
        >
          Withdraw Dataset
        </a>
      </template>
    </template>
    <template
      v-if="datasetPublicationStatus === PublicationStatus.COMPLETED"
    >
      <a
        v-if="dataset.embargoAccess !== 'granted' && datasetPublicationType === PublicationType.EMBARGO"
        :class="{ 'disabled': dataset.embargoAccess === 'requested' }"
        href="#"
        @click.prevent="onRequestAccessClick"
      >
        <template v-if="dataset.embargoAccess === 'requested'">
          Access Request Pending
        </template>
        <template v-else>
          Request Access
        </template>
      </a>
      <a
        v-if="datasetPublicationType === PublicationType.PUBLICATION"
        :href="discoverLink"
        target="_blank"
      >
        View on Discover
      </a>
      <a
        v-if="hasAgreement && dataset.embargoAccess === 'granted' && datasetPublicationType === PublicationType.EMBARGO"
        href="#"
        @click.prevent="viewAgreement"
      >
        Data Use Agreement
      </a>
      <a
        v-if="isUserDatasetOwner(dataset) && datasetPublicationType === PublicationType.EMBARGO && isReleaseRequestEnabled"
        href="#"
        :disabled="!!inFlightStatus"
        @click.prevent="triggerRequest(PublicationStatus.REQUESTED, PublicationType.RELEASE)"
      >
        Request Release
      </a>
      <a
        v-if="isUserDatasetOwner(dataset)"
        href="#"
        :disabled="!!inFlightStatus"
        @click.prevent="triggerRequest(PublicationStatus.REQUESTED, PublicationType.REMOVAL)"
      >
        Remove Dataset
      </a>
    </template>
    <template
      v-if="datasetPublicationStatus === PublicationStatus.REJECTED"
    >
      <router-link
        :to="datasetLink"
        :disabled="!!inFlightStatus"
      >
        View
      </router-link>
      <a
        v-if="isUserDatasetOwner(dataset)"
        href="#"
        :disabled="!!inFlightStatus"
        @click.prevent="triggerRequest(PublicationStatus.REQUESTED, datasetPublicationType)"
      >
        Re-submit Dataset
      </a>
      <a
        v-if="isUserDatasetOwner(dataset) && datasetPublicationStatus !== PublicationStatus.FAILED"
        href="#"
        :disabled="!!inFlightStatus"
        @click.prevent="triggerRequest(PublicationStatus.CANCELLED, datasetPublicationType)"
      >
        Withdraw Dataset
      </a>
    </template>

    <data-use-agreement-sign-dialog
      :visible.sync="isDataUseAgreementSignDialogVisible"
      :data-use-agreement="dataUseAgreement"
      :is-signing-agreement.sync="isSigningAgreement"
      @submit="requestAccess"
      @download="downloadAgreement"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { pathOr, propOr } from 'ramda';

import DataUseAgreementSignDialog from './DataUseAgreementSignDialog/DataUseAgreementSignDialog'

import DatasetPublishedData from '@/mixins/dataset-published-data'
import Request from '@/mixins/request'

import EventBus from '@/utils/event-bus.js';
import { PublicationTabsStatuses, PublicationTabs, PublicationStatus, PublicationType } from '@/utils/constants';

const getPublicationSuffix = (publicationStatus) => {
   return publicationStatus === PublicationStatus.REQUESTED
      ? 'request'
      : publicationStatus === PublicationStatus.REJECTED
        ? 'reject'
        : publicationStatus === PublicationStatus.CANCELLED
          ? 'cancel'
          : 'accept'
}

export default {
  name: 'PublishingDatasetListItemActions',

  components: {
    DataUseAgreementSignDialog
  },

  mixins: [
    DatasetPublishedData,
    Request
  ],

  props: {
    dataset: {
      type: Object,
      required: true
    },
    isUserPublisher: {
      type: Boolean,
      required: true
    },
    datasetLink: {
      type: Object,
      required: true
    },
    isPublishedTab: {
      type: Boolean,
      require: true
    },
    datasetPublicationStatus: {
      type: String,
      required: true
    },
    datasetPublicationType: {
      type: String,
      required: true
    }
  },

  data: function() {
    return {
      inFlightStatus: false,
      isDataUseAgreementSignDialogVisible: false,
      dataUseAgreement: {},
      hasAgreement: false,
      isSigningAgreement: false
    }
  },

  computed: {
    ...mapState(['config']),
    ...mapGetters([
      'userToken',
      'isUserDatasetOwner'
    ]),

    datasetId: function() {
      return propOr(0, 'sourceDatasetId', this.dataset)
    },

    PublicationStatus: function() {
      return PublicationStatus
    },

    PublicationTabsStatuses: function() {
      return PublicationTabsStatuses
    },

    PublicationTabs: function() {
      return PublicationTabs
    },

    PublicationType: function() {
      return PublicationType
    },

    /**
     * Compute the platform publication
     * status of the dataset
     * NOTE: This is different from the
     * status of the published dataset
     * @returns {String}
     */
    publicationStatus: function() {
      return pathOr('', ['publication', 'status'], this.dataset)
    },

    /**
     * True if the dataset has been requested
     * for release
     * @returns {Boolean}
     */
    isRelease: function() {
      return pathOr('', ['publication', 'type'], this.dataset) == this.PublicationType.RELEASE
    },

    /**
     * True if dataset is embargoed
     * @returns {Boolean}
     */
    isEmbargo: function() {
      return this.datasetPublicationType == this.PublicationType.EMBARGO
    },

    /**
     * True if dataset has been
     * requested for publication
     * @returns {Boolean}
     */
    isRequested: function() {
      return this.publicationStatus == this.PublicationStatus.REQUESTED
    },

    /**
     * True if dataset has been
     * accepted for publication
     * @returns {Boolean}
     */
    isAccepted: function() {
      return this.publicationStatus == this.PublicationStatus.ACCEPTED
    },

    /**
     * Request Release button should not
     * be enabled if the dataset is embargoed
     * and has already been requested or accepted
     * for early release
     * @returns {Boolean}
     */
    isReleaseRequestEnabled: function() {
      return this.isEmbargo && !this.isRequested && !this.isAccepted
    }
  },

  watch: {
    isEmbargo: {
      handler: function(val) {
        if (val) {
          this.getAgreement()
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions('publishingModule', [
      'refreshPublishingData'
    ]),

    /**
     * Opens Data Use Agreement Modal
     * @param {Number} dataUseAgreementId
     */
    requestAccess: function(dataUseAgreementId) {
      const url = `${this.config.apiUrl}/discover/datasets/${this.dataset.id}/preview?api_key=${this.userToken}`

      this.sendXhr(url, {
        method: 'POST',
        body: {
          datasetId: this.dataset.id,
          dataUseAgreementId
        }
      }).then(() => {
        EventBus.$emit('toast', {
          detail: {
            type: 'success',
            msg: 'Your request was successfully sent to the dataset owner'
          }
        })
        this.isDataUseAgreementSignDialogVisible = false
        this.isSigningAgreement = false
        this.refreshPublishingData(PublicationStatus.COMPLETED)
      }).catch(this.handleXhrError.bind(this))
    },

    triggerRequest: async function(publicationStatus, publicationType) {
      const publicationSuffix = getPublicationSuffix(publicationStatus)
      let url = ''

      if (this.dataset.publication.type === 'embargo') {
         url = `${this.config.apiUrl
      }/datasets/${this.dataset.content.id
      }/publication/${publicationSuffix
      }?publicationType=${publicationType
      }&api_key=${this.userToken
      }&embargoReleaseDate=${this.dataset.publication.embargoReleaseDate}`

      } else {
        url = `${this.config.apiUrl
      }/datasets/${this.dataset.content.id
      }/publication/${publicationSuffix
      }?publicationType=${publicationType
      }&api_key=${this.userToken}`
      }

      this.inFlightStatus = true;
      try {
        await this.sendXhr(url, { method: 'POST' })

        const actionWord =
          publicationStatus === PublicationStatus.REQUESTED
            ? 'sent'
            : publicationStatus

        const pubTypeWord =
          publicationType === PublicationType.REMOVAL
            ? 'Cancel'
            : publicationType.charAt(0).toUpperCase() + publicationType.slice(1)

        EventBus.$emit('toast', {
          detail: {
            type: 'success',
            msg: `${pubTypeWord} request ${actionWord} for dataset ${this.dataset.content.name}`
          }
        })

        this.refreshPublishingData(publicationStatus)

        // NOTE: we explicitly DO NOT reset inFlight here because we expect further GET requests to update the parent
        // lists and re-mount this component
      } catch (e) {
        this.handleXhrError(e)
        // set inFlight to false so we can attempt to hit the button again
        this.inFlightStatus = false;
      }
    },

    /**
     * If has agreement, open dialog and prompt user to sign
     * Otherwise, request access
     */
    onRequestAccessClick: function() {
      if (this.dataset.embargoAccess === 'requested') {
        return
      }

      if (this.hasAgreement) {
        this.isSigningAgreement = true
        this.isDataUseAgreementSignDialogVisible = true
      } else {
        this.requestAccess()
      }
    },

    /**
     * Get agreement for dataset
     * @returns {Promise}
     */
    getAgreement: function() {
      fetch(`${this.config.apiUrl}/discover/datasets/${this.dataset.id}/data-use-agreement`)
        .then(async (response)=> {
          this.hasAgreement = response.status === 200
          if (response.status === 200) {
            this.dataUseAgreement = await response.json()
          }
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Open agreement dialog and set that the user is not signing.
     * This will allow the user to download the agreement
     */
    viewAgreement: function() {
      this.isSigningAgreement = false
      this.isDataUseAgreementSignDialogVisible = true
    },

    /**
     * Download the agreement
     */
    downloadAgreement: function() {
      const url = `${this.config.apiUrl}/discover/datasets/${this.dataset.id}/data-use-agreement/download`
      this.isDataUseAgreementSignDialogVisible = false
      this.isSigningAgreement = false

      const downloadEl = document.createElement('a')
      downloadEl.setAttribute('href', url)
      downloadEl.setAttribute('download', 'download')

      if (document.createEvent) {
        const event = document.createEvent('MouseEvents')
        event.initEvent('click', true, true)
        downloadEl.dispatchEvent(event)
      } else {
        downloadEl.click()
      }

    }
  }
}
</script>

<style lang="scss">
@import '../../assets/_variables.scss';

  .button-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    a {
      margin-bottom: 12px;
    }
  }

  @media only screen and (min-width: 1079px) and (max-width: 1462px) {
    .bf-button {
      &.button-spacing {
        margin-top: 10px;
      }
    }
  }
</style>
