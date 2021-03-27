<template>
  <div class="directory-explorer">
    <div class="directory-explorer__tree">
      <directory-tree
        :directory-data="directoryData"
        @item-click="itemClick"
      />
    </div>
    <div class="directory-explorer__metadata-viewer">
      <template v-if="objectData">
        <h4>Data</h4>
        <div class="directory-explorer__content-border">
          <code>{{ objectData }}</code>
        </div>
      </template>
      <template v-if="metadata.length">
        <h4>Metadata</h4>
        <div class="directory-explorer__content-border">
          <table class="directory-explorer__metadata-table">
            <tr
              v-for="item in metadata"
              :key="item.key"
              class="directory-explorer__data"
            >
              <td class="directory-explorer__data-index">
                {{ item.key }}
              </td>
              <td class="directory-explorer__data-info">
                {{ item.value }}
              </td>
            </tr>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { propOr, toPairs } from 'ramda'

import DirectoryTree from '../DirectoryTree/DirectoryTree.vue'
export default {
  name: 'DirectoryExplorer',
  components: { DirectoryTree },

  props: {
    directoryData: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      selectedItem: {}
    }
  },

  computed: {
    /**
     * Computes metadata
     * @returns {Boolean}
     */
    metadata: function() {
      return propOr([], 'value', this.selectedItem)
    },
    /**
     * Displays object data and data type
     * @returns {String}
     */
    objectData: function() {
      const _data = this.selectedItem.type

      return _data && typeof _data === 'object'
        ? toPairs(_data)
            .map(items => items.join(': '))
            .join(', ')
        : _data
    }
  },

  methods: {
    /**
     * Handles click event per tree item
     * @param {Object} item
     */
    itemClick: function(item) {
      this.selectedItem = item
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.directory-explorer {
  display: flex;
  height: 300px;
  border: 1px solid $table-background-color;
  border-radius: 4px;

  h4 {
    font-weight: 500;
    margin: 16px 0 4px 0;
  }

  &__tree {
    border-right: 1px solid $table-background-color;
    width: 40%;
    overflow: scroll;
  }

  &__metadata-viewer {
    width: 60%;
    overflow: scroll;
    background-color: $noradrenaline;
  }

  &__metadata-viewer {
    padding: 0 16px 16px 16px;
    border-radius: 4px;
  }

  &__content-border {
    border: solid 1px $cortex;
    border-radius: 3px;
    min-height: 25px;
  }

  &__data-index {
    background: $cortex;
    padding: 4px 8px;
  }

  &__data-info {
    flex: 1 auto;
    padding: 4px 8px;
  }

  &__metadata-table {
    border-spacing: 0;
  }

  code {
    display: block;
    padding: 4px 8px;
    white-space: pre-wrap;
  }
}
</style>
