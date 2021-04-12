<template>
  <div class="embargoed-request-list">
    <div
      class="embargoed-request-list-item"
    >
      <div class="embargoed-request-list-item__info">
        <p class="embargoed-request-list-item__info--name">
          {{ request.firstName }} {{ request.lastName }}
        </p>
        <p class="embargoed-request-list-item__info--email">
        {{ request.email }}
        </p>
      </div>
      <div
        v-if="request.status === EmbargoedRequestStatus.REQUESTED"
        class="embargoed-request-list-item__buttons"
      >
        <bf-button
          class="primary"
          @click="acceptRequest(request)"
        >
          Accept
        </bf-button>
        <bf-button
          class="secondary"
          @click="rejectRequest(request)"
        >
          Reject
        </bf-button>
      </div>
      <div
        v-else
        class="embargoed-request-list-item__remove"
      >
        <button @click="removeFromList(request)">
          <svg-icon
            name="icon-remove"
            width="13"
            height="13"
          />
        </button>
      </div>
    </div>
    <reject-embargo-request-dialog
      :visible="isDialogVisible"
      :rejected-request="rejectedRequest"
      @close-dialog="closeDialog"
      @submit="removeFromList"
    />
  </div>
</template>

<script>
import RejectEmbargoRequestDialog from '../RejectEmbargoRequestDialog/RejectEmbargoRequestDialog.vue'
import { EmbargoedRequestStatus } from '@/utils/constants'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

  export default {
    name: 'EmbargoedRequestList',

    components: {
      BfButton,
      RejectEmbargoRequestDialog
    },

    props: {
      request: {
        type: Object,
        default: () => {
          return {}
        }
      },
    },

    data() {
      return {
        isDialogVisible: false,
        rejectedRequest: {},
        EmbargoedRequestStatus
      }
    },

    methods: {
      /**
       * Accept embargo request
       * @param {Object} request
       */
      acceptRequest: function() {
        this.$emit('accept-request', this.request)
      },

      /**
       * Reject embargo request
       */
      rejectRequest: function() {
        this.isDialogVisible = true
        this.rejectedRequest = this.request
      },

      /**
       * Submit method for reject dialog
       * @param {Object} request
       */
      removeFromList: function(request) {
        this.$emit('remove-request', request)
      },

      /**
       * Closes reject dialog
       */
      closeDialog: function() {
        this.isDialogVisible = false
      },

      /**
       * Remove embargo access
       * @param {Object} request
       */
      removeRequest: function(request) {
        this.$emit('remove-request', request)
      }
    },
  }
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
.embargoed-request-list {
  .embargoed-request-list-item {
    border-top: solid 1px $gray_2;
    display: flex;
    justify-content: space-between;
    &__info {
      &--name {
        font-size: 14px;
        font-weight: 600;
        line-height: 16px;
        margin-top: 13px;
        margin-bottom: 0;
      }
      &--email {
        color: $gray_4;
        margin-bottom: 17px;
      }
    }
    &__buttons {
      margin-top: 11px;
      margin-bottom: 11px;
      .bf-button {
        &.primary {
          margin-right: 8px;
        }
      }
    }
    &__remove {
      display: flex;
      margin-right: 25px;
    }
    &:last-child {
      border-bottom: solid 1px $gray_2;
    }
  }
  .svg-icon {
    color: $gray_4;
  }
}
</style>
