<template>
  <div
    v-click-outside="dismissPopover"
    class="search-filter-criteria"
    :class="{
      'disabled': disabled,
      'locked': locked
    }"
  >
    <template v-if="criteria">
      <div
        class="search-filter-criteria-select"
        @click="isPopoverVisible = true"
      >
        <svg-icon
          v-if="locked"
          class="icon-lock"
          icon="icon-lock-filled"
          color="#7DA0FF"
          height="16"
          width="16"
        />
        <span class="search-filter-criteria-label">
          {{ label }}
        </span>
        <svg-icon
          v-if="!locked"
          class="icon-caret"
          icon="icon-arrow-up"
          color="#2760ff"
          dir="down"
          height="6"
          width="10"
        />
      </div>
    </template>

    <input
      v-else
      ref="input"
      v-model="input"
      type="text"
      :disabled="disabled || locked"
      @focus="isPopoverVisible = true"
      @input="$emit('input', $event.target.value)"
      @keydown.delete="onDelete"
    >

    <el-popover
      ref="popover"
      v-model="isPopoverVisible"
      popper-class="no-padding scroll"
      placement="bottom-start"
      trigger="manual"
      :append-to-body="false"
      :visible-arrow="false"
      :popper-options="{
        modifiers: [ 'offset', 'preventOverflow', popoverModifier, 'applyStyle' ]
      }"
      :disabled="disabled || locked"
    >
      <div
        v-if="loading"
        class="bf-menu"
      >
        <div class="loading-list">
          Loading
        </div>
      </div>
      <div
        v-if="loading === false"
        class="bf-menu scroll-menu"
      >
        <template v-for="(category, idx) in filteredOptions">
          <ul
            v-if="category.items.length"
            :key="category.label"
          >
            <hr v-if="idx > 0">

            <h2>{{ category.label }}</h2>

            <ul>
              <li
                v-for="item in category.items"
                :key="getOptionKey(item)"
              >
                <a
                  href="#"
                  class="bf-menu-item"
                  @click.prevent="onOptionClick(item, category.type)"
                >
                  <span
                    v-if="optionPrefix"
                    class="prefix"
                  >
                    {{ optionPrefix }} <strong>{{ item.label }}</strong>
                    <template v-if="item.isDuplicateName">
                      ({{ getDataType(item) }})
                    </template>
                  </span>

                  <template v-else>
                    {{ item.label }}
                  </template>
                </a>
              </li>
            </ul>
          </ul>
        </template>


        <p
          v-if="hasNoResults"
          class="filter-empty-state"
        >
          No results found
        </p>
      </div>
    </el-popover>
  </div>
</template>

<script>
import {
  compose,
  isEmpty,
  flatten,
  pathOr,
  pluck
} from 'ramda'

  export default {
    name: 'SearchFilterCriteria',

    props: {
      criteria: {
        type: String,
        default: ''
      },
      label: {
        type: String,
        default: ''
      },
      optionPrefix: {
        type: String,
        default: ''
      },
      options: {
        type: Array,
        default: () => []
      },
      loading: {
        type: Boolean,
        default: false
      },
      optionKey: {
        type: String,
        default: 'name'
      },
      disabled: {
        type: Boolean,
        default: false
      },
      locked: {
        type: Boolean,
        default: false
      }
    },

    data: function() {
      return {
        input: '',
        isPopoverVisible: false
      }
    },

    computed: {
      /**
       * Compute filtered targets based off of user input
       * @TODO Refactor with new data shape
       * @returns {Array}
       */
      filteredOptions: function() {
        return this.options.map(item => {
          const items = item.items.filter(data => {
            return data.label.toLowerCase().indexOf(this.input.toLowerCase()) > -1
          })

          return {
            label: item.label,
            type: item.type,
            items
          }
        })
      },

      /**
       * Compute if the filtered options have no results
       * Used to display information to the user, and is needed
       * since there can be multiple categories displayed
       * @returns {Boolean}
       */
      hasNoResults: function() {
        return compose(
          isEmpty,
          flatten,
          pluck('items')
        )(this.filteredOptions)
      }
    },

    mounted: function() {
      /**
       * Set the popover references so they can be positioned and full width
       * `el-popover` doesn't allow for this to be dynamic
       */
      this.$refs.popover.$refs.reference = this.$parent.$refs.inputWrap
    },

    methods: {
      /**
       * Get dataType for the criteria iteem
       * @returns {String}
       */
      getDataType: function(item) {
        return pathOr('', ['dataType', 'type'], item)
      },

      /**
       * Get option key based off of prop
       * This is for dynamic keys based on different
       * types of lists
       * @param {Object} item
       */
      getOptionKey: function(item) {
        return item[this.optionKey]
      },

      /**
       * Compute placement and width for popover
       * @param {Object}
       * @returns {Object}
       */
      popoverModifier: function(data) {
        // Set offset
        data.offsets.popper.top -= 22

        // Set to width of reference (so it's full width of input)
        data.styles.width = data.offsets.reference.width

        return data
      },

      /**
       * Focus on the text input
       */
      focus: function() {
        this.$refs.input.focus()
      },

      /**
       * On delete key press
       * Emit delete event if the value is empty
       */
      onDelete: function() {
        if (this.input === '') {
          this.$emit('delete')
        }
      },

      /**
       * Dismiss popover
       */
      dismissPopover: function() {
        this.isPopoverVisible = false
      },

      /**
       * Callback of clicking an option in the dropdown
       * Emit event and close popover
       * @param {Object} item
       * @param {String} type
       */
      onOptionClick: function(item, type = '') {
        this.input = ''
        this.$emit('input', '')
        this.dismissPopover()
        this.$emit('select', item, type)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.search-filter-criteria {
  &.disabled {
    cursor:not-allowed;
    input {
      cursor:not-allowed
    }
  }
}
.search-filter-criteria-select {
  align-items: center;
  background: rgba($purple_1, .1);
  border-radius: 12px;
  color: $gray_6;
  cursor: pointer;
  display: flex;
  letter-spacing: 0.25px;
  padding: 3px 10px;
  user-select: none;
  .locked & {
    cursor: default;
  }
}
.search-filter-criteria-label {
  flex: 1;
  overflow: hidden;
  margin-right: 4px;
  max-width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
input {
  background: none;
  border: none;
  color: $gray_6;
  flex: 1;
  font-size: inherit;
  line-height: inherit;
  outline: none;
  margin: -10px 0;
  padding: 10px 0;
  width: 100%;
}
.bf-menu-item .prefix {
  :not(:active) & {
    color: $gray_4;
    strong {
      color: $app-primary-color;
    }
  }
  strong {
    font-weight: 400;
  }
}
.filter-empty-state {
  font-style: italic;
  margin: 0;
  padding: 8px 16px 8px 24px;
}
.loading-list {
  padding: 8px 16px;
}
.icon-lock {
  margin-right: 6px;
}
</style>
