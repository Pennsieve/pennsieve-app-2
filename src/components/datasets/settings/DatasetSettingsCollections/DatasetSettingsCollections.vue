<template>
  <div class="dataset-settings-collections">
    <h4>Collection</h4>
    <p class="mb-16">
      Assign this dataset to a collection to group similar work
    </p>

    <el-select
      ref="inputCollection"
      v-model="inputCollection"
      class="mb-8"
      placeholder="Add or Create a Collection"
      filterable
      default-first-option
      allow-create
      no-data-text="Start typing to create a new collection"
      :disabled="datasetLocked"
      popper-class="bf-menu dataset-collections-input-options"
      @change="onCollectionSelect"
    >
      <svg-icon
        slot="prefix"
        name="icon-research"
        height="20"
        width="20"
        color="#000"
      />
      <el-option
        v-for="collection in unselectedCollections"
        :key="collection.id"
        class="filtered-field bf-menu-item"
        :label="collection.name"
        :value="collection"
      />
    </el-select>
    <p
      v-if="hasError"
      class="error mb-8"
    >
      Sorry, an error has occurred. Please try again.
    </p>

    <div class="tag-wrap">
      <bf-tag
        v-for="collection in datasetCollections"
        :key="collection.id"
        :label="collection.name"
        class="tag mb-8 mr-8"
        @remove="removeCollection({ datasetId: $route.params.datasetId, collectionId: collection.id })"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import BfTag from '@/components/shared/BfTag/BfTag'

import Request from '@/mixins/request'

export default {
  name: 'DatasetSettingsCollections',

  components: {
    BfTag
  },

  mixins: [
    Request
  ],

  data() {
    return {
      inputCollection: '',
      hasError: false
    }
  },

  computed: {
    ...mapState([
      'config',
      'datasetLocked',
      'userToken'
    ]),

    ...mapState('collectionsModule', [
      'collections',
      'datasetCollections'
    ]),

    /**
     * Compute the collections that the dataset is not
     * already a part of
     * @returns {Array}
     */
    unselectedCollections: function() {
      return this.collections.filter(collection => {
        return !this.datasetCollections.find(item => item.id === collection.id)
      })
    }
  },

  mounted: function() {
    this.fetchDatasetCollections(this.$route.params.datasetId)
  },

  methods: {
    ...mapActions('collectionsModule', [
      'addCollection',
      'createCollection',
      'fetchDatasetCollections',
      'removeCollection'
    ]),

    /**
     * Add collection to the dataset
     */
    onCollectionSelect: async function(collection) {
      this.hasError = false

      const isCreating = this.$refs.inputCollection.showNewOption
      if (isCreating) {
        // Add collection to vuex
        this.createCollection({
          datasetId: this.$route.params.datasetId,
          collectionName: collection
        })
          .catch(() => {
            this.hasError = true
          })
      } else {
        this.addCollection({
          datasetId: this.$route.params.datasetId,
          collectionId: collection.id
        })
          .catch(() => {
            this.hasError = true
          })
      }

      this.inputCollection = ''
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';

.el-select {
  width: 100%;
}
.tag-wrap {
  display: flex;
  flex-wrap: wrap;
}
/deep/ .el-input__prefix {
  align-items: center;
  display: flex;
}
.error {
  color: $error-color;
}
</style>
<style lang="scss">
@import '../../../../assets/_variables.scss';

.dataset-collections-input-options {
  .el-select-dropdown__item:not(.filtered-field) {
    align-items: center;
    color: $app-primary-color;
    display: flex;
    padding: 16px;
    text-decoration: underline;

    &:before {
      content: 'Create "'
    }
    &:after {
      content: '"'
    }

    &.selected {
      color: #fff
    }
  }
}
</style>
