<template>
  <div
    class="selected-template"
    @click="toggleSelectedTemplate($event)"
  >
    <div class="selected-template-checkbox">
      <el-checkbox
        v-model="checked"
        @click.prevent="toggleSelectedTemplate($event)"
      />
    </div>
    <div class="selected-template-info">
      <div class="selected-template-heading">
        <div class="selected-template-icon">
          <svg-icon
            name="icon-graph"
            width="20"
            height="20"
            color="#2760FF"
          />
        </div>
        <div class="selected-template-title">
          {{ item.displayName }}
        </div>
      </div>
      <div :class="isTruncatedClasses">
        <div
          ref="templateText"
          class="selected-template-text"
        >
          {{ itemProperties }}
        </div>
        <a
          v-if="doPropertiesOverflow"
          href="#"
          class="show-more-less"
          @click.prevent="toggleText($event)"
        >
          {{ showMoreLessText }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import { pathOr, propOr } from 'ramda'
  import CheckOverflow from '../../../../mixins/check-overflow/index'

  export default {
    name: 'SelectedTemplate',

    mixins: [
      CheckOverflow,
    ],

    props: {
      item: {
        type: Object,
        default: () => ({})
      },
      checked: {
        type: Boolean,
        default: true
      },
    },

    data() {
      return {
        truncated: true,
        showMoreLessText: 'Show All',
        doPropertiesOverflow: false,
      }
    },

    computed: {
      /**
       * Returns CSS class name(s)
       * @returns {String}
       */
      isTruncatedClasses: function() {
        return this.truncated ? 'selected-template-copy truncated' : 'selected-template-copy'
      },
      /**
       * Returns string of comma-delimited property name(s)
       * @returns {String}
       */
      itemProperties: function() {
        const props = propOr({}, 'properties', this.item)
        return Object.keys(props).join(', ')
      },
    },

    watch: {
      itemProperties: {
        handler: function(val) {
          if (!val) {
            return
          }
          this.$nextTick(this.checkPropertyOverflow)
        },
        immediate: true
      },
    },

    methods: {
      /**
       * Toggle more and less text
       * @param {Object} evt
       */
      toggleText: function(evt) {
        evt.preventDefault()
        this.truncated = !this.truncated
        this.showMoreLessText = this.truncated ? 'Show All' : 'Hide'
      },
      /**
       * Toggle selected template
       */
      toggleSelectedTemplate: function(evt) {
        evt.preventDefault()
        const tag = pathOr('', ['target', 'tagName'], evt)
        if (tag.toLowerCase() === 'a') {
          return
        }
        const evtName = this.checked ? 'uncheck-selected-template' : 'check-selected-template'
        this.$emit(evtName, this.item)
      },
      /**
       * Determines whether or not properties text overflows
       */
      checkPropertyOverflow: function() {
        const elem = this.$refs.templateText
        this.doPropertiesOverflow = this.checkWidth(elem)
      },
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../../assets/_variables.scss';

  .selected-template {
    background: #fff;
    border: solid 1px $gray_2;
    display: flex;
    margin-bottom: 16px;
    overflow: hidden;
    padding: 16px;

    &:hover {
      background: $gray_1;
      cursor: pointer;
    }
  }

  .selected-template-checkbox {
    margin-right: 24px;
  }

  .selected-template-info {
    overflow: hidden;
    width: 100%;
  }

  .selected-template-heading {
    align-items: center;
    display: flex;
    margin-bottom: 8px;
  }

  .selected-template-icon {
    height: 20px;
    line-height: 20px;
    margin-right: 8px;
    overflow: hidden;
    text-align: center;
    width: 20px;
  }

  .selected-template-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
  }

  .selected-template-copy {
    color: $gray_4;
    font-size: 13px;
    line-height: 16px;
    position: relative;
  }

  .selected-template-text {
    max-width: 90%;
  }

  .show-more-less {
    background: #fff;
    display: block;
    position: absolute;
    bottom: 0;
    right: 0;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .truncated {
    .selected-template-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .show-more-less {
      top: 0;
    }
  }
</style>