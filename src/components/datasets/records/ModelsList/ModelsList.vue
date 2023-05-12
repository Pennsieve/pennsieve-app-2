<template>
  <div
    class="models-list"
    :class="{ 'scrolling-list': scrollingList }"
  >
    <template v-if="hasModels || isLoadingConcepts">
      <h2 v-if="showHeading">
        All Models
      </h2>
      <div
        v-loading="isLoadingConcepts"
        class="models-list-loading-wrap"
        element-loading-background="#fff"
        @keyup.enter="onEnter"
      >
        <div class="input-wrap">
          <el-input
            v-model="searchText"
            class="mb-8"
            placeholder="Filter by Model"
            autofocus
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
          >
            <svg-icon
              slot="prefix"
              class="icon-search"
              name="icon-magnifying-glass"
              height="24"
              width="24"
            />
          </el-input>
        </div>

        <div class="models-list-wrap-scroll">
          <div class="models-list-wrap">
            <div
              v-for="(group, groupKey) in groupedConcepts"
              :key="groupKey"
              class="model-group mb-8 mt-16"
            >
              <div class="mr-24">
                <h2 class="group-key">
                  {{ groupKey }}
                </h2>
              </div>
              <div class="model-group-col">
                <concepts-list-item
                  v-for="concept in group"
                  :key="concept.id"
                  :item="concept"
                  :search-text="searchText"
                  :is-link="isLink"
                  class="mb-16"
                  @click="clickModel"
                />
              </div>
            </div>

            <bf-empty-page-state
              v-if="showNoResults"
              class="no-results-found-wrapper"
            >
              <img
                src="/static/images/illustrations/illo-search.svg"
                height="78"
                width="99"
                alt="No results found"
              >

              <h2>No results found</h2>
              <p>No results found for "{{ searchText }}". Try a different search term.</p>
            </bf-empty-page-state>
          </div>
        </div>
      </div>
    </template>

    <dataset-owner-message
      v-if="!isLoadingConcepts"
      title="You don't have any records yet."
      :display-owner-message="hasModels === false"
      :hide-got-it="true"
      class="empty-concepts"
    >
      <img
        slot="img"
        src="/static/images/illustrations/illo-search.svg"
        alt="Illustration of a magnifying glass"
      >

      <p slot="copy">
        Once you set up <router-link :to="{ name: 'models' }">
          models
        </router-link>, you'll see a list of records here.
      </p>
    </dataset-owner-message>
  </div>
</template>

<script>
  import {
    mapState
  } from 'vuex'

  import {
    groupBy,
    toUpper,
    sortBy,
    prop,
    filter,
    defaultTo
  } from 'ramda'

  import ConceptsListItem from '../../explore/ConceptsList/ConceptsListItem.vue'
  import DatasetOwnerMessage from '../../../shared/DatasetOwnerMessage/DatasetOwnerMessage.vue'
  import BfEmptyPageState from '../../../shared/bf-empty-page-state/BfEmptyPageState.vue'

  import AutoFocus from '../../../../mixins/auto-focus/index'

  export default {
    name: 'ModelsList',

    components: {
      ConceptsListItem,
      DatasetOwnerMessage,
      BfEmptyPageState
    },

    mixins: [
      AutoFocus
    ],

    props: {
      showHeading: {
        type: Boolean,
        default: true
      },
      isLink: {
        type: Boolean,
        default: true
      },
      shouldReset: {
        type: Boolean,
        default: false
      },
      scrollingList: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        searchText: '',
        isInputFocused: false
      }
    },

    computed: {
      ...mapState([
        'concepts',
        'isLoadingConcepts'
      ]),

      /**
       * Compute if the empty state should be shown
       * @returns {Boolean}
       */
      hasModels: function() {
        return this.concepts.length > 0
      },

      /**
       * Compute whether to show "No results" empty state if the user has filtered with no matches
       * @returns {Boolean}
       */
      showNoResults: function() {
        return this.searchText !== '' && Object.keys(this.groupedConcepts).length === 0
      },

      /**
       * Group concepts by letter
       * @returns {Array}
       */
      groupedConcepts: function() {
        const byFirstLetter = groupBy(function(concept) {
          return toUpper(concept.displayName.charAt(0))
        })
        const sortedConcepts = sortBy(prop('displayName'), this.concepts)
        const searchText = defaultTo('', this.searchText)
        const matches = concept => concept.displayName.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        const filteredConcepts = filter(matches, sortedConcepts)

        return byFirstLetter(filteredConcepts)
      },
    },

    watch: {
      /**
       * Reset the component
       */
      shouldReset: function(val) {
        if (val) {
          this.searchText = ''
          this.$emit('update:shouldReset', false)
        }
      }
    },

    mounted: function() {
      this.autoFocus()
    },

    methods: {
      clickModel: function(ev) {
        this.$emit('click', ev)
      },
      /**
       * Allow user to press enter key to navigate to the first item in the list
       */
      onEnter: function() {
        if (this.isInputFocused) {
          const modelLink = this.$el.querySelector('.concepts-list-item a')
          if (modelLink && this.searchText !== '') {
            modelLink.click()
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/_variables.scss';
  .models-list.scrolling-list {
    box-sizing: border-box;
    height: 100%;
    .models-list-wrap-scroll {
      box-sizing: border-box;
      flex: 1;
      overflow: scroll;
      padding: 0 0 16px 16px;
    }
    .models-list-loading-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .input-wrap {
      padding: 0px 0px 0 16px;
    }
    .el-input {
      margin-bottom: 0;
    }
  }

  .models-list-wrap {
    background: $gray_1;
    padding: 16px;
  }
  .model-group {
    display: flex;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  .model-group-col {
    flex: 1;
    overflow: hidden;
  }
  .group-key {
    line-height: 1;
    margin: 0;
    min-width: 20px;
  }
  .icon-search {
    color: $app-primary-color;
  }
  .empty-concepts {
    img {
      height: 78px;
      width: 99px;
    }
  }
</style>
<style lang="scss">
  @import '../../../../assets/_variables.scss';


  .models-list {
    .el-input__inner {
      background: $gray_1;
      border: none;
      border-bottom: 1px solid $gray_3;
      border-radius: 0;
      padding-left: 32px;
    }
    .el-input__prefix {
      align-items: center;
      display: flex;
    }
  }
</style>
