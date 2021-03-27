<template>
  <div>
    <h2>Data Use Agreement</h2>
    <p class="mb-16">
      Assign a data use agreement to your dataset. Users will be prompted to sign this agreement when they request access to your embargoed dataset.
    </p>
    <el-select
      v-model="dataUseAgreementId"
      filterable
      placeholder="Select data use agreement"
      @change="setDataUseAgreement"
    >
      <svg-icon
        slot="prefix"
        icon="icon-document"
        height="20"
        width="20"
        color="#000"
      />
      <el-option
        v-for="dataUseAgreement in dataUseAgreements"
        :key="dataUseAgreement.id"
        :label="dataUseAgreement.name"
        :value="dataUseAgreement.id"
      />
    </el-select>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { pathOr } from 'ramda'

import Request from '@/mixins/request'
import EventBus from '@/utils/event-bus'

export default {
  name: 'DatasetPermissionsDataUseAgreement',

  mixins: [
    Request
  ],

  data() {
    return {
      dataUseAgreementId: ''
    }
  },

  computed: {
    ...mapState([
      'config',
      'dataset',
      'dataUseAgreements',
      'userToken'
    ])
  },

  watch: {
    'dataset.content.dataUseAgreementId': {
      handler: function(val) {
        if (val) {
          this.dataUseAgreementId = val
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions([
      'updateDataset'
    ]),

    /**
     * Set data use agreement
     */
    setDataUseAgreement: function() {
      this.sendXhr(`${this.config.apiUrl}/datasets/${this.$route.params.datasetId}?api_key=${this.userToken}`, {
        method: 'PUT',
        body: {
          dataUseAgreementId: this.dataUseAgreementId
        }
      })
        .then((response) => {
          return this.updateDataset(response)
        })
        .then(() => {
          EventBus.$emit('toast', {
            detail: {
              msg: 'Data use agreement successfully added',
              type: 'success'
            }
          })
        })
        .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  max-width: 474px;
  width: 100%;
}
/deep/ .el-input__prefix {
  align-items: center;
  display: flex;
}
</style>
