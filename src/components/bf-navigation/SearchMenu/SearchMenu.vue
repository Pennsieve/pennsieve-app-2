<template>
  <div class="search-menu">
    <el-tooltip
      popper-class="bf-tooltip"
      content="Search shortcut (s)"
      :popper-options="{
        modifiers: ['keepTogether', 'arrow', 'offset', 'preventOverflow', tooltipModifier, 'applyStyle' ]
      }"
      :open-delay="300"
    >
      <button
        class="search-menu bf-navigation-item"
        @click="openSearchModal"
      >
        <svg-icon
          class="icon-main search"
          icon="icon-magnifying-glass"
        />
        <span class="label">
          Search
        </span>
        <svg-icon
          slot="suffix"
          icon="icon-arrow-up"
          color="#fff"
          dir="right"
          height="10"
          width="10"
          class="icon-arrow"
        />
      </button>
    </el-tooltip>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

/**
 * Check if a dialog is open
 * Need to check for two dialogs because of legacy components
 * still being used in favor of Element UI's dialog
 * `.v-modal`: Element Dialogs
 * `.bf-dialog.open`: Blackfynn dialog
 * @returns {Boolean}
 */
const checkDialogs = () => {
  const elDialog = document.querySelector('.v-modal')
  const bfDialog = document.querySelector('.bf-dialog.open')

  return Boolean(elDialog) || Boolean(bfDialog)
}

/**
 * Check if the user is in an input
 * @returns {Boolean}
 */
const checkInput = (evt) => {
  const inputTypes = ['textarea', 'input', 'select', 'button']
  const targetType = evt.target.tagName.toLowerCase() || 'input'

  return inputTypes.includes(targetType)
}

  export default {
    name: 'SearchMenu',

    computed: {
      ...mapState([
        'searchModalVisible',
        'primaryNavCondensed',
        'secondaryNavOpen'
      ])
    },

    mounted() {
      document.addEventListener('keydown', this.onKeyboardShortcut)
    },

    beforeDestroy() {
      document.removeEventListener('keydown', this.onKeyboardShortcut)
    },

    methods: {
      ...mapActions(['updateSearchModalVisible']),

      /**
       * Compute placement and offset for tooltip
       * @param {Object}
       * @returns {Object}
       */
      tooltipModifier: function(data) {
        const alignRight = this.primaryNavCondensed || this.secondaryNavOpen
        // Compute offset
        if (alignRight) {
          data.offsets.popper.top += 8
          data.offsets.arrow.top = 10
        } else {
          data.offsets.popper.left += -30
          data.offsets.arrow.left = 10
        }

        // Compute placement
        const placement = alignRight ? 'right-start' : 'top-start'
        data.instance._options.placement = placement

        return data
      },

      /**
       * Emits an event to open the Search All Datasets modal
       */
      openSearchModal: function() {
        this.updateSearchModalVisible(true)
      },

      /**
       * Callback for keyboard shortcut cmd+k (or ctr+k)
       * Open the search modal if the search modal is not already open
       * AND if there isn't already a dialog open
       * This extra check is to allow the primary navigation to collapse and open correctly
       * @params {Object} evt
       */
      onKeyboardShortcut: function(evt) {
        const isOtherDialogOpen = checkDialogs()
        const isInput = checkInput(evt)
        if (this.searchModalVisible || isOtherDialogOpen || isInput) {
          return
        }

        if (evt.key === 's') {
          evt.preventDefault()

          this.openSearchModal()
        }
      }
    },
  }
</script>

<style lang="scss" scoped>

.primary {
  .bf-navigation-item {
    .search {
      width: 30px !important;
      height: 30px !important;
    }
  }
}
</style>
