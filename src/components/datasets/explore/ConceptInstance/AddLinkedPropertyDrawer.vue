<template>
  <side-drawer
    class="add-model-property-drawer"
    heading="Select a Record"
    :visible="visible"
    @close-side-drawer="closeSideDrawer"
  >
    <div slot="copy">
      <p>Choose from the records below.</p>
    </div>

    <template slot="body">
      <div class="search-results-wrap">
        <model-records-results
          :concept="concept"
          :has-radio-selection="true"
          :radio-selection="radioSelection"
          @radio-selection="onRadioSelection"
          @search-results-changed="updateSearchResults"
        />
      </div>
    </template>

    <div slot="buttons">
      <bf-button
        class="secondary"
        @click="closeSideDrawer"
      >
        Cancel
      </bf-button>
      <bf-button
        :disabled="disableButton || datasetLocked"
        @click="saveChanges"
      >
        Save
      </bf-button>
    </div>
  </side-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { propOr, pathOr, find, propEq } from 'ramda'

import BfButton from '../../../shared/bf-button/BfButton.vue'
import SideDrawer from '../../../shared/side-drawer/SideDrawer.vue'

import Request from '../../../../mixins/request'
import EncodeInternalFields from '../../../../mixins/encode-internal-fields'

import EventBus from '../../../../utils/event-bus'
import ModelRecordsResults from '../search/ModelRecordsResults'
import { Computed } from '@/typescript/lib/add-linked-property-drawer/computed'
import { Methods } from '@/typescript/lib/add-linked-property-drawer/methods'

  export default {
    name: 'AddLinkedPropertyDrawer',

    components: {
      ModelRecordsResults,
      BfButton,
      SideDrawer,
    },

    mixins: [
      EncodeInternalFields,
      Request
    ],

    props: {
      isCreatingRecord: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        searchResults: [],
        concept: {},
        recordTo: {},
        visible: false,
        initialSelection: '',
        radioSelection: '',
        linkedProperty: {}
      }
    },

    computed: {
      ...mapGetters([
        'hasFeature',
        'datasetLocked'
      ]),

      ...mapState([
        'conceptsHash',
        'config',
        'userToken'
      ]),

      /**
       * Compute if save changes button should be visible
       * @returns {Boolean}
       */
      disableButton: function() {
        return Computed.disableButton(this.radioSelection, this.initialSelection)
      },
      /**
       * Concept ID
       * @returns {String}
       */
      conceptId: function() {
        return this.concept.id || ''
      },

      /**
       * Linked Property Url
       * @returns {String}
       */
      linkedPropertiesUrl: function() {
        return Computed.linkedPropertiesUrl(this.$route, this.config.conceptsUrl, this.conceptId)
      },

      /**
       * Compute if user is editing a linked property
       * @returns {Boolean}
       */
      isEditing: function() {
        return Computed.isEditing(this.initialSelection)
      },
    },

    watch: {
      searchResults: {
        handler: function(val) {
          if (val.length > 0) {
            const id = this.radioSelection
            const record = find(propEq('id', id), val)

            if (record) {
              this.recordTo = record
            }
          }
        }
      }
    },

    methods: {
      updateSearchResults: function(searchResults) {
        this.searchResults = searchResults
      },

      /**
       * Handles close-side-drawer event
       */
      closeSideDrawer: function() {
        Methods.closeSideDrawer(this)
      },

      /**
       * Opens the side drawer and requests records
       * @param {Object} property
       */
      openDrawer: function(property) {
        const modelId = pathOr('', ['to', 'modelId'], property)
        const recordId = pathOr('', ['to', 'recordId'], property)

        this.concept = this.conceptsHash[modelId]
        this.radioSelection = recordId
        this.initialSelection = recordId
        this.linkedProperty = property

        this.visible = true
      },

      /**
       * Handle update-record-to event from ConceptSearchResults
       * @param {Object} record
       */
      onUpdateRecordTo: function(record) {
        this.recordTo = record
      },

      /**
       * Save Changes
       */
      saveChanges: function() {
        if (this.isEditing && !this.isCreatingRecord) {
          this.deleteRelationship()
            .then(this.createRelationship.bind(this))
            .catch(this.handleXhrError.bind(this))
        } else {
          this.createRelationship()
        }
      },

      /**
       * Create linked property relationship
       */
      createRelationship: function() {
        this.isCreating = true

        const { name, displayName, id } = this.linkedProperty.schemaLinkedProperty

        const body = {
          name,
          displayName,
          schemaLinkedPropertyId: id,
          to: this.radioSelection
        }

        if (this.isCreatingRecord) {
          this.$emit('update-linked-property', body)
          this.closeSideDrawer()
          this.isCreating = false
        } else {
          this.sendCreateRelationshipRequest(body)
        }
      },

      /**
       * Create linked property request
       * Send request to endpoint to create the linked property
       * @params {Object} body
       */
      sendCreateRelationshipRequest: function(body) {
        this.sendXhr(this.linkedPropertiesUrl, {
          method: 'POST',
          header: {
            'Authorization': `bearer ${this.userToken}`
          },
          body
        })
        .then(response => {
          this.$emit('update-linked-property', response)
          this.closeSideDrawer()
          this.isCreating = false

          EventBus.$emit('toast', {
            detail: {
              type: 'success',
              msg: `Linked Property Saved`
            }
          })

          // track adding a linked property
          EventBus.$emit('track-event', {
            name: 'Linked Property Added'
          })
        })
        .catch(this.handleXhrError)
      },

      /**
       * Makes XHR call to remove linked property
       */
      deleteRelationship: function() {
        if (this.linkedPropertiesUrl) {
          const id = propOr('', 'linkedPropertyId', this.linkedProperty)
          const url = `${this.linkedPropertiesUrl}/${id}`

          return this.sendXhr(url, {
            method: 'DELETE',
            header: {
              'Authorization': `bearer ${this.userToken}`
            }
          })
        }
      },

      onRadioSelection: function(selection) {
        this.radioSelection = selection
        this.recordTo = this.searchResults.find(r => r.id === this.radioSelection)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../../../../assets/variables';

.search-results-wrap {
  flex: 1;
  overflow: hidden;
}
</style>
