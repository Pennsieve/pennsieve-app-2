<template>
  <div
    v-loading="isLoadingConcepts"
    :class="conceptClassNames"
    element-loading-background="transparent"
  >
    <dataset-owner-message
      v-if="!isLoadingConcepts"
      title="You don't have any records yet."
      :display-owner-message="displayOwnerMessage"
      :hide-got-it="true"
      class="empty-concepts"
    >
      <img
        slot="img"
        src="/static/images/illustrations/illo-search.svg"
        alt=""
      >
      <p slot="copy">
        Once you set up <router-link :to="{ name: 'graph-management' }">
          models
        </router-link>, you'll see a list of records here.
      </p>
    </dataset-owner-message>

    <div>
      <concepts-list-item
        v-for="concept in concepts"
        :key="concept.id"
        :item="concept"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import ConceptsListItem from './ConceptsListItem.vue'
import DatasetOwnerMessage from '../../../shared/DatasetOwnerMessage/DatasetOwnerMessage.vue'
import { find, propEq, propOr } from 'ramda'

export default {
  name: 'ConceptsList',

  components: {
    BfButton,
    DatasetOwnerMessage,
    ConceptsListItem
  },

  computed: {
    ...mapGetters([
      'concepts',
      'exploreFiles',
      'config',
      'userToken',
      'filesProxyId',
    ]),

    ...mapState([
      'isLoadingConcepts'
    ]),

    /**
     * Compute if the empty state should be shown
     * @returns {Boolean}
     */
    displayOwnerMessage: function() {
      return this.concepts.length === 0
    },

    conceptClassNames: function() {
      return {
        'concepts-list': true,
        'has-concepts': this.concepts.length > 0
      }
    },

    /**
     * Get files url
     * @returns {String}
     */
    getFilesUrl: function() {
      const datasetId = this.$route.params.datasetId

      if (!this.userToken) {
        return
      }
      return `${this.config.conceptsUrl}/datasets/${datasetId}/proxy/package`
    },

    /**
     * Compute files "model"
     * @returns {object}
     */
    filesObj: function() {
      if (this.filesProxyId) {
        const proxyId = {
          id: this.filesProxyId
        }
        return Object.assign({}, this.exploreFiles, proxyId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables';

.concepts-list {
  min-height: 100px;

  &.has-concepts {
    margin-bottom: 64px;
  }
}
.empty-concepts {
  img {
    height: 78px;
    width: 99px;
  }
}

</style>
