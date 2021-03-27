<template>
  <div class="info-palette">
    <div class="info-palette-wrap">
      <div class="info-palette-container">
        <div class="info-palette-title">
          <img
            class="svg-icon icon-item"
            :src="fileIcon(getType('icon'), packageType)"
          >
          <h2>{{ packageName }}</h2>
        </div>

        <h2>Information</h2>
        <div>
          <p class="attribute-key">
            Created on
          </p>
          <p class="attribute-value">
            {{ formatDateOnLocale(createdAt) }}
          </p>
        </div>

        <div>
          <h3 class="attribute-key">
            Dataset Size
          </h3>
          <p class="attribute-value">
            {{ formatMetric(storage) }}
          </p>
        </div>

        <div>
          <h3 class="attribute-key">
            Type
          </h3>
          <p class="attribute-value">
            {{ getType('subtype') }}
          </p>
        </div>

        <div>
          <h3 class="attribute-key">
            Blackfynn ID
          </h3>
          <p class="attribute-value">
            {{ packageId }}
          </p>
        </div>

        <p>
          <router-link
            :to="{name: 'concept-instance', params: {
              conceptId: filesProxyId,
              instanceId: packageId
            }}"
          >
            View all details
          </router-link>
        </p>
      </div>

      <div class="properties-wrap">
        <table
          v-if="propertiesList.length > 0"
          class="properties-table"
        >
          <tr>
            <th class="properties-label">
              {{ packageCategory }}
            </th>
          </tr>
          <tr
            v-for="(prop, index) in propertiesList"
            :key="`prop-${index}`"
            class="properties-value"
          >
            <td
              v-if="prop.key.length > 12"
              class="properties-data"
            >
              <el-tooltip
                class="item"
                effect="dark"
                :content="prop.key"
                placement="left"
              >
                <span class="key">
                  {{ prop.key }}
                </span>
              </el-tooltip>
            </td>
            <td
              v-else
              class="properties-data"
            >
              <span class="key-no-gradient">
                {{ prop.key }}
              </span>
            </td>
            <td class="properties-data">
              <span class="value">
                {{ prop.value }}
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { propOr, find, propEq, pathOr, head, filter } from 'ramda'
import FileIcon from '@/mixins/file-icon/index'
import FormatDate from '@/mixins/format-date/index'
import BfStorageMetrics from '@/mixins/bf-storage-metrics/index'
export default {
  name: 'PaletteInfo',

  mixins: [FileIcon, FormatDate, BfStorageMetrics],

  data() {
    return {
      showByIndex: null,
      packageProperty: '',
      dialogVisible: false,
      propertiesList: []
    }
  },

  computed: {
    ...mapState(['dataset', 'filesProxyId']),
    ...mapState('viewer', ['activeViewer']),

    /**
     * Compute the package created date
     * @returns {String}
     */
    createdAt: function() {
      return pathOr('', ['content', 'createdAt'], this.activeViewer)
    },

    /**
     * Compute the package name
     * @returns {String}
     */
    packageName: function() {
      return pathOr('', ['content', 'name'], this.activeViewer)
    },

    /**
     * Compute the package id
     * @returns {String}
     */
    packageId: function() {
      return pathOr('', ['content', 'id'], this.activeViewer)
    },

    /**
     * Compute the package type
     * @returns {String}
     */
    packageType: function() {
      return pathOr('', ['content', 'packageType'], this.activeViewer)
    },

    /**
     * Compute the package category
     * @returns {String}
     */
    packageCategory: function() {
      const properties = propOr([], 'properties', this.activeViewer)
      return propOr('', 'category', head(properties))
    },

    /**
     * Compute the package storage
     * @returns {String}
     */
    storage: function() {
      return propOr('', 'storage', this.activeViewer)
    }
  },

  watch: {
    /**
     * Watch for initialization of activeViewer in vuex. Once initalized
     * we can pull in the package properties and populate propertiesList
     */
    activeViewer: {
      handler: function(val) {
        if (val) {
          const properties = propOr([], 'properties', this.activeViewer)
          const childProps = propOr([], 'properties', head(properties))
          this.propertiesList = filter(propEq('hidden', false), childProps)
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Compute icon type or sub type based on key
     * @returns {String}
     */
    getType(key) {
      const parentProps = propOr([], 'properties', this.activeViewer)
      const childProps = propOr([], 'properties', head(parentProps))
      const type = find(propEq('key', key), childProps)
      return propOr('', 'value', type)
    },

    /**
     * Closes delete dialog modal
     */
    onCloseDialog: function() {
      this.dialogVisible = false
    },

    /**
     * Displays delete dialog modal
     */
    showDeletePropertyModal: function(prop) {
      this.packageProperty = prop
      this.dialogVisible = true
    },

    /**
     * Removes property that was deleted from propertiesList
     */
    removeProperty: function() {
      let updatedPropertiesList = []
      this.propertiesList.forEach(obj => {
        const key = propOr('', 'key', obj)
        if (key !== this.packageProperty) {
          updatedPropertiesList.push(obj)
        }
      })
      this.propertiesList = updatedPropertiesList
      this.onCloseDialog()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../../src/assets/_variables.scss';
.info-palette {
 height: 100%;
 display: flex;
 flex-direction: column;

 .info-palette-wrap {
   height: 100%;
   display: flex;
   flex-direction: column;
 }
  .info-palette-title {
    margin-bottom: 26px;
    h2 {
      font-size: 16px;
      font-weight: 400;
      line-height: 23px;
      display: inline-flex;
      margin-top: 10px;
    }
  }

  h2 {
    font-size: 20px;
    line-height: 24px;
    margin: 0 0 15px;
    font-weight: 400;
  }

  .info-palette-container {
    padding: 20px;
  }

  .attribute-key {
    color: $glial;
    font-size: 12px;
    font-weight: 400;
    margin-bottom: 5px;
  }

  .attribute-value {
    margin-bottom: 18px;
  }

  .icon-item {
    width: 40px;
    height: 40px;
  }

  .properties-label {
    color: $glial;
    background-color: $cortex;
    font-weight: 500;
    padding: 12px 20px;
    width: 400px;
    margin-left: -2px;
    text-align: left;
  }

  .properties-value {
    padding: 12px 20px;
    display: grid;
    grid-template-columns: 40% 60%;
    grid-gap: 5px;
    border-bottom: solid 1px $cortex;
  }

  .icon-delete {
    height: 18px;
    width: 18px;
    color: $glial;
    right: 13px;
  }

  .properties-value .svg-icon {
    visibility: hidden;
  }

  .properties-value:hover .svg-icon {
    visibility: visible;
  }

  .properties-data {
    margin-bottom: -5px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .key {
      background-image: linear-gradient(to right, #71747c, #71747c, #71747c, #f7f7f7);
      color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
      font-weight: 600;
      width: 100px;
    }

    .key-no-gradient {
      font-weight: 600;
      color: #71747c;
      margin-right: 10px;
    }

    .value {
      word-break: break-all;
      padding-right: 3px;
    }
  }

  .properties-wrap {
    overflow: scroll;
    display: flex;
     flex: 1;
    flex-basis: 0.000000001px;
  }

∂
  a {
    text-decoration: underline;
  }
}
</style>
