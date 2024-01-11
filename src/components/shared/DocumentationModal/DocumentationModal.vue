<template>
  <el-dialog
    :visible="visible"
    :custom-class="calculateModalWidth"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" :title="title" />

    <dialog-body>{{ body }}</dialog-body>
  </el-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import { pathOr } from 'ramda'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import Request from '@/mixins/request'

export default {
  name: 'DocumentationModal',

  components: {
    BfDialogHeader,
    DialogBody
  },

  mixins: [Request],

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      title: '',
      body: ''
    }
  },

  computed: {
    ...mapState([
      'config',
      'activeOrganization',
      'primaryNavOpen',
      'primaryNavCondensed',
      'secondaryNavOpen',
      'documentationModalVisible',
      'userToken'
    ]),

    /**
     * Calculate modal width based on navigation width
     * @returns {String}
     */
    calculateModalWidth: function() {
      return this.primaryNavCondensed || this.secondaryNavOpen
        ? 'condensed-nav-modal-width'
        : 'default-nav-modal-width'
    },

    /**
     * Compute active organization intId
     * @returns {String}
     */
    activeOrganizationIntId: function() {
      return pathOr('', ['organization', 'intId'], this.activeOrganization)
    }
  },

  watch: {
    documentationModalVisible: function() {
      console.log(this.documentationModalVisible)
      this.fetchDocumentation()
    }
  },
  methods: {
    ...mapActions(['updateDocumentationModalVisible']),

    /**
     * Closes the Search Across All Datasets dialog
     */
    closeDialog: function() {
      this.updateDocumentationModalVisible(false)
    },
    /**
     * Fetch Documentation
     */
    fetchDocumentation: function() {
      const url = `${
        this.config.api2Url
      }/readme/docs/pennsieve-open-office-hours`

      this.sendXhr(url, {
        method: 'GET',
        header: {
          Authorization: `Bearer ${this.userToken}`
        }
      })
        .then(response => {
          console.log('***', response)
          this.title = response.title
          this.body = response.body
        })
        .catch(error => console.error(error))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

h2 {
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
}

/deep/ .el-dialog {
  height: calc(100vh - 32px);
  border-radius: 3px;
  margin-bottom: 0;
  margin-top: 16px !important;
  .el-dialog__header {
    border-bottom: none;
  }

  .el-dialog__body {
    padding-top: 7px;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: bold;
  }

  .el-dialog__headerbtn .el-dialog__close {
    color: $gray_6;
    height: 10px;
    width: 10px;
  }
}

p {
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  letter-spacing: 0px;
  color: $gray_4;
}

/deep/ h3 {
  font-size: 14px;
  font-weight: bold;
  color: $gray_6;
}
</style>

<style lang="scss">
.default-nav-modal-width {
  width: calc(100vw - 32px - 230px);
  margin-left: 246px;
  overflow-y: auto;
}

.condensed-nav-modal-width {
  width: calc(100vw - 32px - 56px);
  margin-left: 72px;
  overflow-y: auto;
}
</style>
