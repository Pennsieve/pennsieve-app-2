<template>
  <div class="dataset-settings-associated-publications">
    <h4>References</h4>
    <p class="mb-16">
      List references to other items that are associated with this dataset (e.g
      Publications, Protocols, and Other Datasets).
    </p>
    <bf-button
      class="secondary"
      @click="showAssociatedPublicationsDialog"
    >
      Add Reference
    </bf-button>
    <div v-loading="isLoading">
      <div
        v-for="referenceType in Object.keys(groupedReferences)"
        :key="referenceType"
        class="citation-list"
      >
        <p>{{ referenceHeading(referenceType) }}</p>
        <associated-publications-list
          v-for="pub in groupedReferences[referenceType]"
          :key="pub.doi"
          v-loading="isLoading"
          :publication="pub"
          :relationship="pub.relationshiptype"
          @add-reference="addReference"
          @remove-citation="removeCitation(pub, pub.relationship)"
        />
      </div>
    </div>
    <reference-types-dialog
      :visible.sync="publicationsDialogVisible"
      :url="externalPublicationsUrl"
      @add-reference="addReference"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { pathOr, propEq, find, propOr, groupBy } from 'ramda'
import AssociatedPublicationsList from '../AssociatedPublicationsList/AssociatedPublicationsList.vue'
import ReferenceTypesDialog from '../ReferenceTypesDialog/ReferenceTypesDialog.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import Request from '@/mixins/request/index'
import { referenceTypeOptions } from '@/utils/constants'
export default {
  name: 'DatasetAssociatedPublications',

  components: {
    AssociatedPublicationsList,
    ReferenceTypesDialog,
    BfButton
  },

  mixins: [Request],

  data() {
    return {
      doiList: [],
      isLoading: false,
      hasDuplicate: false,
      publicationsDialogVisible: false,
      referenceTypeValue: '',
      referenceTypeOptions,
      references: []
    }
  },

  computed: {
    ...mapGetters(['datasetLocked']),
    ...mapState(['config', 'userToken', 'dataset']),

    /**
     * Computes dataset Id
     * @returns {String}
     */
    datasetId: function() {
      return pathOr('', ['content', 'id'], this.dataset)
    },
    /**
     * GET External Publications URL
     * @returns {String}
     */
    externalPublicationsUrl: function() {
      return `${this.config.apiUrl}/datasets/${
        this.datasetId
      }/external-publications`
    },
    /**
     * Groups references
     * @returns {Array}
     */
    groupedReferences: function() {
      return groupBy(item => item.relationshipType, this.references)
    }
  },

  mounted() {
    this.getExternalPublications()
  },

  methods: {
    /**
     * Get reference heading by value
     * @TODO optimize
     * @params {String} referenceType
     */
    referenceHeading: function(referenceType) {
      return this.referenceTypeOptions.filter(item => item.value === referenceType)[0].label
    },

    /**
     * Show Associated Publications Dialog
     */
    showAssociatedPublicationsDialog: function() {
      this.publicationsDialogVisible = true
    },
    /**
     * Gets external publications associated with dataset
     */
    getExternalPublications: function() {
      if (!this.externalPublicationsUrl) {
        return
      }

      this.isLoading = true
      const url = this.externalPublicationsUrl + `?api_key=${this.userToken}`

      this.sendXhr(url)
        .then(response => {
          this.isLoading = false
          this.references = response
        })
        .catch(() => {
          this.isLoading = false
          this.hasError = true
        })
    },

    /**
     * Adds DOI citation to dataset
     * @param {Object} doi
     * @param {String} refLabel
     * @param {String} refVal
     */
    addReference: function(doi, refLabel, refVal) {
      if (!this.externalPublicationsUrl) {
        return
      }

      this.isLoading = true
      const url = typeof doi === 'object' && doi !== null
        ? this.externalPublicationsUrl +
          `?doi=${doi.doi}&api_key=${this.userToken}&relationshipType=${refVal}`
        : this.externalPublicationsUrl +
          `?doi=${doi}&api_key=${this.userToken}&relationshipType=${refVal}`
      this.sendXhr(url, {
        method: 'PUT'
      })
        .then(response => {
          this.isLoading = false
         this.checkForDuplicates(response)
          if (!this.hasDuplicate) {
            this.references.push(response)
          }
        })
        .catch(this.handleXhrError.bind(this))
      this.hasDuplicate = false
    },

    /**
     * Checks if a DOI citation already exists in the list
     * @param {Object} response
     */
    checkForDuplicates: function(response) {
      this.references.forEach(ref => {
        if (response.doi === ref.doi && response.relationshipType === ref.relationshipType) {
          this.hasDuplicate = true
        }
      })
    },

    /**
     * Deletes a DOI citation from the list
     * @param {Object} doi
     */
    removeCitation: function(doi) {
      if (!this.externalPublicationsUrl) {
        return
      }

      const url =
        this.externalPublicationsUrl +
        `?doi=${doi.doi}&api_key=${this.userToken}&relationshipType=${
          doi.relationshipType
        }`
      this.sendXhr(url, {
        method: 'DELETE'
      }).then(() => {
        this.references = this.references.filter(ref => ref !== doi)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.dataset-settings-associated-publications {
  .doi-input {
    max-width: 474px;
    margin-bottom: 8px;
  }

  .error {
    color: $error-color;
  }

  .citation-list {
    p {
      font-weight: 500;
      margin-top: 10px;
    }
  }

  /deep/ .bf-button {
    &.secondary {
      width: 135px;
      margin-bottom: 10px;
    }
  }
}
</style>
