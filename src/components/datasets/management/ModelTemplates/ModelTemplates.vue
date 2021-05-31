<template>
  <bf-page class="graph-management">
    <bf-rafter
      slot="heading"
    >
      <h1
        slot="heading"
        class="flex-heading"
      >
        <svg-icon
          v-if="isDatasetLocked"
          class="mr-8"
          color="#71747C"
          name="icon-lock-filled"
          height="24"
          width="24"
        />
        SPARC Templates
      </h1>
      <div slot="breadcrumb">
        <router-link
          class="back-to-models"
          :to="{name: 'models'}"
        >
          <svg-icon
            name="icon-arrow-up"
            dir="left"
            height="10"
            width="10"
          />
          Models
        </router-link>
      </div>
      <div
        slot="buttons"
        class="buttons"
      >
        <bf-button
          :disabled="selectedModels.length === 0"
          @click="previewSelectedModels"
        >
          Select Models
        </bf-button>
      </div>
    </bf-rafter>

    <bf-stage slot="stage">
      <div class="model-templates">
        <div class="template-cards">
          <bf-card
            v-for="model in modelTemplates"
            :key="model.$id"
            :is-disabled="model.isDisabled"
            :item="model"
            :class="{ disabled: isDatasetLocked }"
            :title="model.displayName"
            :card-copy="model.description"
            :is-selectable="isDatasetLocked === false"
            :is-model-card="true"
            :checked="isChecked(model.$id)"
            @card-checked="addToSelectedModels"
            @card-unchecked="removeFromSelectedModels"
          >
            <template slot="icon">
              <svg-icon
                name="icon-graph"
                width="40"
                height="40"
                :color="model.isDisabled ? '#71747C' : '#2760FF'"
              />
            </template>
            <template slot="footer">
              <span class="property-count">
                <strong>{{ displayPropertyCount(model) }}</strong> {{ displayPropsText(model) }}
              </span>
            </template>
          </bf-card>
        </div>
      </div>

      <preview-models
        ref="previewDrawer"
        :selected-templates="selectedModels"
        @clear-selected-templates="handleClearSelectedTemplates"
      />
    </bf-stage>
  </bf-page>
</template>

<script>
  import { mapGetters, mapActions, mapState } from 'vuex'
  import { path, find, propEq, propOr } from 'ramda'

  import BfEmptyPageState from '../../../shared/bf-empty-page-state/BfEmptyPageState.vue'
  import BfCard from '../../../shared/bf-card/BfCard.vue'
  import BfRafter from '../../../shared/bf-rafter/BfRafter.vue'
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import PreviewModels from './PreviewModels.vue'
  import Request from '../../../../mixins/request'

  export default {
    name: 'ModelTemplates',

    components: {
      BfRafter,
      BfButton,
      BfCard,
      BfEmptyPageState,
      PreviewModels,
    },

    mixins: [
      Request,
    ],

    data() {
      return {
        models: [],
        selectedModels: [],
      }
    },

    computed: {
      ...mapState([
        'dataset'
      ]),

      ...mapGetters([
        'activeOrganization',
        'userToken',
        'config',
        'concepts'
      ]),
      ...mapState([
        'modelTemplates'
      ]),

      /**
       * Compute if the dataset is locked
       * @returns {Boolean}
       */
      isDatasetLocked: function() {
        return propOr(false, 'locked', this.dataset)
      },

      /**
       * Gets model templates
       */
      getModelTemplates: function(){
        return this.modelTemplates
      }

    },

    watch: {
      concepts: {
        handler: function(concepts) {
          if (concepts) {
            this.getModelTemplates
          }
        },
        immediate: true
      }
    },

    methods: {
      ...mapActions([
        'updateModelTemplates'
      ]),
      /**
       * Saves selected models
       */
      previewSelectedModels: function() {
        this.$refs.previewDrawer.openDrawer()
      },
      /**
       * Add item to selectedModels array
       * @param {Object}
       */
      addToSelectedModels: function(item) {
        this.selectedModels.push(item)
      },
      /**
       * Removes item from selectedModels array
       * @param {Object}
       */
      removeFromSelectedModels: function(item) {
        const updatedModels = this.selectedModels.filter(model => model.$id !== item.$id)
        this.selectedModels = updatedModels
      },
      /**
       * Resets selected models
       */
      handleClearSelectedTemplates: function() {
        this.selectedModels = []
      },
      /**
       * Determines if card should be checked
       * @param {String} modelId
       * @returns {Boolean}
       */
      isChecked: function(modelId) {
        const model = find(propEq('$id', modelId), this.selectedModels)
        return Boolean(model)
      },
      /**
       * Returns the model properties count
       * @param {Object} model
       * @returns {Number}
       */
      displayPropertyCount: function(model) {
        const props = propOr({}, 'properties', model)
        return Object.keys(props).length
      },
      /**
       * Returns the model properties count
       * @param {Object} model
       * @returns {String}
       */
      displayPropsText: function(model) {
        const propsLength = this.displayPropertyCount(model)
        return propsLength === 1 ? 'Property' : 'Properties'
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';

  .graph-management {
    background: $white;
  }

  .model-templates {
    display: flex;
    flex-direction: column;
    flex: 1 auto;
  }

  .bf-card {
    float: left;
  }
</style>
