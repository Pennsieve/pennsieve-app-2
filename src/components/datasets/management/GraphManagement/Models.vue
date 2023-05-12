<template>
  <div
    v-loading="loadingModels && !isLoadingConcepts"
    class="models"
    element-loading-background="transparent"
  >
    <div
      v-if="showCards"
      class="graph-management-cards"
    >
      <button
        :disabled="datasetLocked"
        @click="createConcept"
      >
        <bf-card
          :class="{ disabled: datasetLocked }"
          title="Empty Model"
          card-copy="Create a model for metadata records."
        >
          <template slot="icon">
            <img
              src="/static/icons/icon-add-template.svg"
              height="48"
              width="48"
              alt="Add Model"
            >
          </template>
        </bf-card>
      </button>
      <component
        :is="galleryLinkComponent"
        v-if="hasModelTemplatesFeature"
        class="gallery-link"
        :class="{ disabled: datasetLocked }"
        to="model-templates"
      >
        <bf-card
          :class="{ disabled: datasetLocked }"
          title="Template Gallery"
        >
          <img
            slot="icon"
            src="/static/icons/icon-gallery.svg"
            height="48"
            width="96"
            alt="Template Gallery"
          >
          <div class="view-templates-link">
            <div class="view-templates-link-text">
              View All Templates
            </div>
            <svg-icon
              name="icon-arrow-right"
              height="10"
              width="10"
              color="#2760FF"
            />
          </div>
        </bf-card>
      </component>
    </div>

    <div v-if="hasModels">
      <h2>Models in Your Graph</h2>
      <concept-list-item
        v-for="concept in combinedConcepts"
        :key="concept.id"
        :concept="concept"
        @archive-concept="openArchiveDialog"
        @lock-concept="openLockDialog"
        @unlock-concept="onUnlockConcept"
      />
    </div>

    <dataset-owner-message
      v-if="hasNoModels"
      title="You have no metadata models defined yet"
      :display-owner-message="true"
      :hide-got-it="true"
      class="long-copy"
    >
      <img
        slot="img"
        src="/static/images/illustrations/illo-missing-models.svg"
        alt=""
      >
      <p slot="copy">
        Models are the basis of your metadata schema. Before adding metadata records, you'll need to <br> create some models
      </p>
      <bf-button
        slot="button"
        class="new-model-button"
        :disabled="datasetLocked"
        @click="createConcept"
      >
        New Model
      </bf-button>
      <p
        v-if="modelTemplates.length > 0 && datasetLocked === false"
        slot="link"
      >
        <router-link :to="{ name: 'model-templates' }">
          Add a model from a template
        </router-link>
      </p>
    </dataset-owner-message>

    <concept-dialog
      :visible.sync="lockDialogVisible"
      confirm-text="Lock"
      title="Lock Model"
      @confirm="setLockModel(true)"
    >
      <svg-icon
        name="icon-lock-filled"
        height="32"
        width="32"
        color="#2760FF"
      />
      <h3>Lock {{ activeModel.displayName }}?</h3>
      <p>By locking this model, members of your organization will no longer be able to create new records in your graph. Existing records will still be seen in your current graph.</p>
    </concept-dialog>

    <concept-dialog
      :visible.sync="archiveDialogVisible"
      confirm-text="Delete"
      title="Delete Model"
      primary-btn-class="red"
      @confirm="archiveConcept"
    >
      <svg-icon
        name="icon-trash"
        height="32"
        width="32"
        color="#e94b4b"
      />
      <h3>Delete {{ activeModel.displayName }}?</h3>
      <p>The will also remove any relationship types and linked properties.</p>
    </concept-dialog>

    <create-concept-dialog
      :visible.sync="createConceptDialogVisible"
    />
  </div>
</template>

<script>
  import { mapGetters, mapActions, mapState } from 'vuex'
  import { pathOr, propOr, findIndex, propEq, find, head, clone, defaultTo } from 'ramda'

  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfCard from '../../../shared/bf-card/BfCard.vue'
  import ConceptDialog from '../../explore/ConceptDialog/ConceptDialog.vue'
  import ConceptListItem from './ConceptListItem/ConceptListItem.vue'
  import CreateConceptDialog from '../CreateConceptDialog/CreateConceptDialog.vue'
  import DatasetOwnerMessage from '../../../shared/DatasetOwnerMessage/DatasetOwnerMessage.vue'

  import EventBus from '../../../../utils/event-bus'
  import Request from '../../../../mixins/request'

  export default {
    name: 'Models',

    components: {
      BfButton,
      BfCard,
      ConceptDialog,
      ConceptListItem,
      CreateConceptDialog,
      DatasetOwnerMessage
    },

    mixins: [
      Request
    ],

    data() {
      return {
        activeModel: {
          name: '',
          displayName: ''
        },
        archiveDialogVisible: false,
        createConceptDialogVisible: false,
        lockDialogVisible: false,
        combinedConcepts: null,
        loadingModels: true
      }
    },

    computed: {
      ...mapGetters([
        'concepts',
        'config',
        'hasFeature',
        'userToken',
        'activeOrganization',
        'datasetLocked'
      ]),
      ...mapState([
        'modelTemplates',
        'dataset',
        'isLoadingConcepts'
      ]),

      /**
       * Computes if cards should be displayed
       * @returns {Boolean}
       */
      showCards: function() {
        return !this.loadingModels && this.concepts.length > 0
      },

      /**
       * Computes if models exist in the current dataset
       * @returns {Boolean}
       */
      hasModels: function() {
        return !this.loadingModels && this.combinedConcepts && this.combinedConcepts.length > 0
      },

      /**
       * Computes if no models exist in the current dataset
       * @returns {Boolean}
       */
      hasNoModels: function() {
        return !this.isLoadingConcepts && (!this.concepts || this.concepts.length === 0)
      },

      /**
       * Computes whether or not model templates feature is enabled
       * @returns {Boolean}
       */
      hasModelTemplatesFeature: function() {
        return this.hasFeature('model_templates_feature')
      },

      /**
       * Compute model URL
       * @returns {String}
       */
      modelUrl: function() {
        const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
        const modelId = propOr('', 'id', this.activeModel)
        return `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/${modelId}`
      },

      galleryLinkComponent: function() {
        return this.datasetLocked ? 'div' : 'router-link'
      }
    },

    watch: {
      '$route.query.openNewModelDialog': {
        handler: function(openNewModelDialog) {
          if (openNewModelDialog) {
            this.createConcept()
          }
        },
        immediate: true
      },
      concepts: {
        handler: function(val) {
          if (val && (!this.isLoadingConcepts && !this.combinedConcepts) || (this.combinedConcepts && this.combinedConcepts.length !== this.concepts.length)) {
            this.getLinkedProps(val)
          }
        },
        immediate: true,
        deep: true
      }
    },

    methods: {
      ...mapActions([
        'updateConcepts',
      ]),

      /**
       * Builds list of linked properties calls per model
       * @param {Object} models
       * @returns {Promise}
       */
      buildLinkedPromises: function(models) {
        const datasetId = this.$route.params.datasetId
        const promises = models.map(model => {
          const modelId = model.id
          const url = `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/${modelId}/linked`
          return this.sendXhr(url, {
            header: {
              'Authorization': `bearer ${this.userToken}`
            }
          })
        })
        return promises
      },

      /**
       * Combines linked property count with propertyCount
       * @param {Object} models
       */
      getLinkedProps: function(models) {
        if (models.length === 0) {
          this.loadingModels = false
          this.combinedConcepts = []
          return
        }
        const promises = this.buildLinkedPromises(models)
        Promise.all(promises)
          .then(linkedProps => {
            this.combinedConcepts = clone(this.concepts)
            linkedProps
              .filter(linked => linked.length > 0)
              .forEach(linked => {
                // increment count
                const concept = pathOr('', ['link', 'from'], head(linked))
                const updatedConcept = find(propEq('id', concept), this.combinedConcepts)
                updatedConcept.propertyCount = updatedConcept.propertyCount + linked.length
                // update combinedConcepts
                const idx = findIndex(propEq('id', concept), this.combinedConcepts)
                this.combinedConcepts.splice(idx, 1, updatedConcept)
              })
            this.loadingModels = false
          })
          .catch(err => {
            this.loadingModels = false
            this.handleXhrError(err)
          })
      },

      /**
       * Create a new concept
       */
      createConcept: function() {
        this.createConceptDialogVisible = true
      },

      /**
       * Open Lock Dialog
       * @param {object} model
       */
      openLockDialog: function(model) {
        this.activeModel = model
        this.lockDialogVisible = true
      },

      /**
       * Lock concept
       */
      setLockModel: function(locked) {
        const body = Object.assign({}, this.activeModel, { locked })

        this.sendXhr(this.modelUrl, {
          method: 'PUT',
          header: {
            'Authorization': `bearer ${this.userToken}`
          },
          body
        })
        .then(response => {
          this.lockDialogVisible = false
          this.updateModel(response)
        })
        .catch(this.handleXhrError.bind(this))
      },

      /**
       * Archive concept
       * @param {object} concept
       */
      openArchiveDialog: function(concept) {
        this.activeModel = concept
        this.archiveDialogVisible = true
      },

      /**
       * Open Archive Dialog
       */
      archiveConcept: function() {
        this.sendXhr(this.modelUrl, {
          method: 'DELETE',
          header: {
            'Authorization': `bearer ${this.userToken}`
          }
        })
        .then(() => {
          const displayName = this.activeModel.displayName
          const index = findIndex(propEq('name', this.activeModel.name), this.concepts)

          const updatedConcepts = this.concepts.slice()
          updatedConcepts.splice(index, 1)

          this.updateConcepts(updatedConcepts).then(() => {
            this.archiveDialogVisible = false
            this.combinedConcepts = clone(this.concepts)
            this.activeModel = {}
          })
        })
        .catch(this.handleXhrError.bind(this))
      },

      onUnlockConcept: function(model) {
        this.activeModel = model
        this.setLockModel(false)
      },

      /**
       * Update model in state
       * @param {Object} response
       */
      updateModel: function(response) {
        const index = findIndex(propEq('name', response.name), this.concepts)
        const updatedConcepts = this.concepts.slice()
        updatedConcepts.splice(index, 1, response)
        this.updateConcepts(updatedConcepts)

        this.activeModel = {}
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';

  .models {
    min-height: 500px;

    h2 {
      font-size: 20px;
      line-height: 24px;
    }

    .owner-message p {
      max-width: 680px;
    }

    .graph-management-cards {
      display: flex;
      margin-bottom: 48px;
    }

    .gallery-link {
      &:hover {
        text-decoration: none;
      }
      &.disabled {
        cursor: default;
        opacity: .6;
      }
    }

    .view-templates-link {
      align-items: center;
      display: flex;
      justify-content: center;

      .view-templates-link-text {
        width: 64px;
      }
    }

    .bf-card {
      height: 183px;
      min-width: 175px;
      max-width: 175px;
      padding: 32px 16px;
    }

    .owner-message p {
      max-width: 680px;
    }

    .long-copy {
      border: none;
      img {
        height: 74px;
        width: 109px;
      }

      p {
        color: #71747C;
        font-size: 14px;
        line-height: 16px;
        text-align: center;
        padding-bottom: 16px;
      }

      .new-model-button {
        height: 40px;
        width: 114px;
        margin-bottom: 16px;
      }
    }
  }
</style>
