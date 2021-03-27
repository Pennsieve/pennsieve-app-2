<template>
  <div class="concepts-list-item">
    <el-tooltip
      placement="top-start"
      popper-class="concepts-list-item-tooltip"
      :content="conceptName"
      :disabled="!showTooltip"
      :popper-options="{
        boundariesElement: 'body'
      }"
    >
      <div
        ref="link"
        class="mr-8 model-name"
        @mouseenter="setShowTooltip"
      >
        <template v-if="isLink">
          <router-link :to="modelSearchLink">
            <span v-html="highlight(searchText, conceptName)" />
          </router-link>
        </template>

        <template v-else>
          <a
            href="#"
            @click.prevent="onClick"
          >
            <span v-html="highlight(searchText, conceptName)" />
          </a>
        </template>
      </div>
    </el-tooltip>
    <div class="concept-list-count">
      {{ conceptCount }}
    </div>
  </div>
</template>

<script>
import { propOr, prop } from 'ramda'

import HighlightText from '../../../../mixins/highlight-text'
import EventBus from '../../../../utils/event-bus'
import CheckOverflow from '../../../../mixins/check-overflow'

const formatNumber = (number) => new Intl.NumberFormat('en-EN').format(number)

export default {
  name: 'ConceptsListItem',

  mixins: [
    CheckOverflow,
    HighlightText
  ],

  props: {
    item: {
      type: Object,
      default: function() {
        return {
          name: '',
          id: '',
          count: 0
        }
      }
    },
    searchText: {
      type: String,
      default: ''
    },
    isLink: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      showTooltip: false
    }
  },

  computed: {
    /**
     * Displays the model display name
     * @returns {String}
     */
    conceptName: function() {
      return propOr('Model', 'displayName', this.item)
    },

    /**
     * Displays the model count
     * @returns {Number}
     */
    conceptCount: function() {
      const count = propOr(0, 'count', this.item)
      return formatNumber(count)
    },

    /**
     * Computes the model search link
     * @return {Object | String}
     */
    modelSearchLink: function() {
      const modelId = prop('id', this.item)
      const routerLink = {
        name: 'concept-search',
        params: { conceptId: modelId }
      }
      return modelId ? routerLink : ''
    }
  },

  mounted: function() {
    this.setShowTooltip()
  },

  methods: {
    /**
     * Handle click and emit event
     */
    onClick: function() {
      EventBus.$emit('concepts-list-item-click', this.item)
    },

    /**
     * Set tooltip based on if the model's name is truncated
     */
    setShowTooltip: function() {
      this.showTooltip = this.checkWidth(this.$refs.link)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables';

.concepts-list-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .concept-list-count {
    color: $myelin;
  }
}
.model-name {
  overflow: hidden;
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
<style>
  .concepts-list-item-tooltip {
    max-width: 200px
  }
</style>
