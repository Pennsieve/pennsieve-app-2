<template>
  <div class="relationship-types">
    <template v-if="!hasRelationships">
      <bf-empty-page-state
        v-if="concepts.length < 1"
        class="empty-state"
      >
        <img
          src="/static/images/illustrations/illo-missing-models.svg"
          alt=""
          width="120"
          height="80"
        >
        <h3>Something's Missing</h3>
        <p>
          Once you create Models in your graph, you can then link them here.
        </p>

        <a
          class="buttonLink"
          href="https://docs.pennsieve.io/docs/creating-relationships-between-metadata-models"
          target="_blank"
        >
          <bf-button
            class="learn-more-button"
          >
            Learn More
          </bf-button>
        </a>
      </bf-empty-page-state>

      <bf-empty-page-state
        v-if="concepts.length >= 1"
        class="empty-state"
      >
        <img
          src="/static/images/illustrations/illo-missing-models.svg"
          alt=""
          width="120"
          height="80"
        >
        <h3>Something's Missing</h3>
        <p>
          Relationships connect models in your graph and allow you to link individual records.
        </p>

        <div>
          <bf-button
            class="learn-more-button"
            :disabled="datasetLocked"
            @click="openRelationshipTypeModal"
          >
            Create Relationship between models
          </bf-button>
        </div>

      </bf-empty-page-state>
    </template>

    <template v-if="hasRelationships">
<!--      <data-model-graph-->
<!--        ref="dataModelGraph"-->
<!--        :show-relationship-types="true"-->
<!--        :relationship-linked-props="relationshipLinkedProps"-->
<!--        :show-title="false"-->
<!--        :height="216"-->
<!--        :strength="-50"-->
<!--      />-->

      <button
        class="add-relationship-type-btn"
        :disabled="datasetLocked"
        @click="openRelationshipTypeModal"
      >
        <svg-icon
          name="icon-plus"
          color="currentColor"
        />
        Add Relationship Type
      </button>

      <div class="relationship-types-table-wrapper">
        <div class="table-info">
          <h2>Relationship Types in Your Graph</h2>
          <a
            v-if="hasItemSelected"
            href="#"
            @click.prevent
          >
            Delete Selected
          </a>
        </div>

        <el-popover
          ref="filterMenu"
          v-model="isFilterMenuOpen"
          popper-class="filter-menu no-padding scroll"
          placement="top-start"
          transition=""
          :visible-arrow="false"
          trigger="manual"
          width="260"
          :popper-options="{
            modifiers: [ 'offset', 'preventOverflow', popperModifier, 'applyStyle' ]
          }"
        >
          <div class="bf-menu">
            <el-popover
              popper-class="filter-by-menu no-padding scroll"
              placement="right-start"
              transition=""
              :visible-arrow="false"
              trigger="hover"
              width="260"
            >
              <div class="bf-menu">
                <ul>
                  <li
                    v-for="item in filterOptions[activeColumn]"
                    :key="item"
                  >
                    <a
                      href="#"
                      class="bf-menu-item icon-item"
                      @click.prevent="onFilterOptionClick(activeColumn, item)"
                    >
                      {{ item }}

                      <svg-icon
                        v-show="isFilterOptionChecked(activeColumn, item)"
                        icon="icon-check"
                        class="icon-check"
                        width="20"
                        height="20"
                        color="#71747C"
                      />
                    </a>
                  </li>
                </ul>
              </div>

              <ul slot="reference">
                <li>
                  <a
                    class="bf-menu-item filter-menu-item icon-item"
                    href="#"
                    @click.prevent
                  >
                    <span>
                      <svg-icon
                        icon="icon-filter-filled"
                        class="icon-filter-filled"
                        width="16"
                        height="16"
                      />
                      Filter by {{ activeColumn }}
                      <a
                        v-show="hasFilterSelections(activeColumn)"
                        href="#"
                        class="clear-column-filter-selections"
                        @click.prevent="clearColumnFilterSelections"
                      >
                        Clear All
                      </a>
                    </span>
                    <svg-icon
                      icon="icon-arrow-right"
                      width="10"
                      height="10"
                    />
                  </a>
                </li>
              </ul>
            </el-popover>

            <hr>

            <ul>
              <li>
                <a
                  class="bf-menu-item"
                  href="#"
                  @click.prevent="sortColumn(activeColumn, 'asc')"
                >
                  <svg-icon
                    icon="icon-sort"
                    class="icon-sort-asc"
                    width="20"
                    height="20"
                  /> Sort Ascending
                </a>
              </li>
              <li>
                <a
                  class="bf-menu-item"
                  href="#"
                  @click.prevent="sortColumn(activeColumn, 'desc')"
                >
                  <svg-icon
                    icon="icon-sort"
                    class="icon-sort-desc svg-down svg-flip"
                    width="20"
                    height="20"
                  /> Sort Descending
                </a>
              </li>
            </ul>
          </div>
          <el-table
            ref="Table"
            slot="reference"
            v-click-outside="closeFilterMenu"
            v-loading="isLoadingRelationshipTypes"
            :data="filteredRelationshipTypes"
            @selection-change="onTableSelectionChange"
            @header-click="onHeaderClick"
            @row-click="onTableRowClick"
          >
            <el-table-column
              width="60"
              class="checkbox"
              fixed
            >
              <template slot-scope="scope">
                <!-- @NOTE Hiding until we have API support -->
                <!-- <el-checkbox
                  v-if="showRowCheckbox(scope.store)"
                  :value="scope.store.isSelected(scope.row)"
                  @input="scope.store.commit('rowSelectedChanged', scope.row)"
                /> -->
                <svg-icon
                  name="icon-procedure"
                  class="icon-procedure"
                  color="currentColor"
                  width="20"
                  height="20"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="source"
              label="Source Model"
              class-name="column-source"
              :render-header="renderHeader"
            />
            <el-table-column
              prop="relationship"
              label="Relationship"
              class-name="column-relationship"
              :render-header="renderHeader"
            >
              <template slot-scope="scope">
                {{ scope.row.relationship }}
                <svg-icon
                  icon="icon-arrow"
                  class="icon-arrow"
                  width="24"
                  height="24"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="destination"
              label="Destination Model"
              class-name="column-destination"
              :render-header="renderHeader"
            />
            <el-table-column
              min-width="20"
              fixed="right"
            >
              <template
                v-if="scope.row.type === 'relationship'"
                slot-scope="scope"
              >
                <el-dropdown
                  trigger="click"
                  placement="bottom-end"
                  @command="onTableRowMenuClick($event, scope.row)"
                >
                  <span class="el-dropdown-link">
                    <svg-icon
                      name="icon-menu"
                      height="16"
                      width="16"
                    />
                  </span>
                  <el-dropdown-menu
                    slot="dropdown"
                    class="bf-menu"
                    :offset="9"
                  >
                    <el-dropdown-item
                      :disabled="datasetLocked"
                      command="edit"
                    >
                      Update
                    </el-dropdown-item>
                    <el-dropdown-item
                      :disabled="datasetLocked"
                      command="remove"
                    >
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-popover>
      </div>
    </template>

    <create-relationship-type-dialog
      :relationship-type-edit.sync="relationshipTypeEdit"
      :relationship-types="relationshipTypes"
      :url="relationshipsUrl"
      :visible.sync="createRelationshipDialogVisible"
      @add-relationship-type="onAddRelationshipType"
      @update-relationship-type="onUpdateRelationshipType"
    />

    <delete-relationship-type-dialog
      :relationship-type-edit.sync="relationshipTypeEdit"
      :relationship-types="relationshipTypes"
      :url="relationshipsUrl"
      :visible.sync="deleteRelationshipDialogVisible"
      @remove-relationship-type="onRemoveRelationshipType"
    />
  </div>
</template>

<script>
  import { all, contains, equals, head, keys, pathOr, propOr, pluck, uniq, clone, find, propEq, findIndex, reject } from 'ramda'
  import { mapState, mapGetters, mapActions } from 'vuex'

  import FileIcon from '../../../../mixins/file-icon'
  import TableFunctions from '../../../../mixins/table-functions'
  import Sorter from '../../../../mixins/sorter'
  import Request from '../../../../mixins/request'
  import EventBus from '../../../../utils/event-bus'
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfEmptyPageState from '../../../shared/bf-empty-page-state/BfEmptyPageState.vue'
  import CreateRelationshipTypeDialog from './CreateRelationshipTypeDialog/CreateRelationshipTypeDialog.vue'
  import DeleteRelationshipTypeDialog from './DeleteRelationshipTypeDialog/DeleteRelationshipTypeDialog.vue'
  import DataModelGraph from '../../../datasets/explore/DataModelGraph.vue'

  export default {
    name: 'RelationshipTypes',

    components: {
      BfButton,
      BfEmptyPageState,
      CreateRelationshipTypeDialog,
      DeleteRelationshipTypeDialog,
      DataModelGraph
    },

    mixins: [
      FileIcon,
      TableFunctions,
      Sorter,
      Request
    ],

    data() {
      return {
        isFilterMenuOpen: false,
        transformedRelationshipTypes: [],
        filteredRelationshipTypes: [],
        transformedLinkedPropTypes: [],
        propRelTypesResponse: [],
        activeColumn: '',
        filterOptionSelections: {},
        selection: [],
        createRelationshipDialogVisible: false,
        deleteRelationshipDialogVisible: false,
        relationshipTypeEdit: {},
        sortBy: 'source',
        sortOrder: 'asc'

      }
    },

    computed: {
      ...mapState([
        'dataset',
        'concepts',
        'config',
        'userToken',
        'relationshipTypes',
        'isLoadingRelationshipTypes'
      ]),

      ...mapGetters([
        'getRelationshipTypes', 'datasetLocked'
      ]),

      /**
       * Combines two responses to pass to data graph component
       * @returns {Array}
       */
      relationshipLinkedProps: function() {
        return this.propRelTypesResponse.concat(this.relationshipTypes)
      },

      /**
       * Compute if the dataset has relationships
       * @returns {Boolean}
       */
      hasRelationships: function() {
        // removing file relationship belongs_to as it should not be visible to users
        const sansFileRelationship = reject(propEq('name', 'belongs_to'), this.relationshipTypes)
        return sansFileRelationship.length > 0
      },

      hasItemSelected: function() {
        return this.selection.length
      },

      columns: function() {
        return ['source', 'relationship', 'destination']
      },

      filterOptions: function() {
        const options = {}
        this.columns.forEach(column => {
          options[column] = uniq(pluck(column, this.transformedRelationshipTypes))
        })
        return options
      },

      /**
      * Compute relationship types url
      * @returns {String}
      */
      relationshipsUrl: function() {
        const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
        const conceptsUrl = propOr('', 'conceptsUrl', this.config)
        if (conceptsUrl && datasetId) {
          return `${conceptsUrl}/datasets/${datasetId}/relationships`
        }
      },

      linkedPropertiesUrl: function() {
        const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
          if (datasetId) {
            return `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/linked/properties`
          }
          return ''
        },
    },

    watch: {
      '$route.query.createRelationshipType': {
        handler: function(createRelationshipType) {
          if (createRelationshipType) {
            this.openRelationshipTypeModal()
          }
        },
        immediate: true
      },

      columns: {
        handler: function(columns) {
          columns.forEach(column => {
            this.filterOptionSelections[column] = []
          })
        },
        immediate: true
      },

      linkedPropertiesUrl: {
        handler: function(val) {
          if (val) {
            this.getRelationshipLinkedProperties()
          }
        },
        immediate: true
      }
    },

    mounted: function() {
      this.$store.watch(this.getRelationshipTypes, {
        handler: this.setupRelationshipTypes.bind(this),
        immediate: true
      })
      this.getRelationshipLinkedProperties()
    },

    methods: {
      ...mapActions([
        'setRelationshipTypes',
        'updateRelationshipType',
        'deleteRelationshipType'
      ]),

      getRelationshipLinkedProperties: function() {
        if (!this.linkedPropertiesUrl) {
          return
        }
      this.sendXhr(this.linkedPropertiesUrl, {
        header: {
          Authorization: `bearer ${this.userToken}`
        }
      })
       .then(response => {
         this.propRelTypesResponse = response
      })
        .catch(this.handleXhrError.bind(this))
      },

      /**
       * Format raw api response data
       * @param {Array} rawData
       * @returns {Array}
       */
      transformAPIResponse: function(rawData, type = 'relationship') {
        return rawData.map(item => {
          const sourceDisplayName = this.getModelProperty(item.from, 'displayName')
          const sourceName = this.getModelProperty(item.from, 'name')
          const destinationDisplayName = this.getModelProperty(item.to, 'displayName')
          const destinationName = this.getModelProperty(item.to, 'name')


          return {
            id: item.id,
            source: sourceDisplayName,
            relationship: item.displayName,
            relationshipName: item.name,
            destination: destinationDisplayName,
            sourceName,
            destinationName,
            type: type


          }
        })
      },

      /**
       * Return model name from a given id
       * @param {String} id
       * @param {String} prop
       * @returns {String}
       */
      getModelProperty: function(id, prop) {
        const model = find(propEq('id', id), this.concepts)
        return propOr('', prop, model)
      },

      /**
       * Open relationship type modal
       */
      openRelationshipTypeModal: function() {
        this.createRelationshipDialogVisible = true
      },

      /**
      * Handle table selection change
      * @param {Array} selection
      */
      onTableSelectionChange: function(selection) {
        this.selection = selection
      },

      /**
       * Handle table row click event
       * @param {Object} row
       */
      onTableRowClick: function(row) {
        this.activeRow = row
        this.closeFilterMenu()
      },

      /**
       * Handle table row menu click event
       * @param {String} command
       * @param {Object} row
       */
      onTableRowMenuClick: function(command, row) {
        // Find relationship type
        this.relationshipTypeEdit = {
          id: propOr('', 'id', row),
          originModel: propOr('', 'sourceName', row),
          originModelDisplayName: propOr('', 'source', row),
          relationshipName: propOr('', 'relationshipName', row),
          destinationModel: propOr('', 'destinationName', row),
          destinationModelDisplayName: propOr('', 'destination', row),
        }


        switch (command) {
          case 'edit':
            // Open edit dialog
            this.createRelationshipDialogVisible = true
            break;

          case 'remove':
            // Open delete dialog
            this.deleteRelationshipDialogVisible = true

          default:
            break;
        }
      },

      /**
       * Handle table header click event
       * @param {Object} column
       * @param {Object} event
       */
      onHeaderClick: function(column, event) {
        const tagName = pathOr('', ['target', 'tagName'], event)

        if (tagName === 'BUTTON') {
          this.updateFilterMenu(column.property)
        } else {
          this.closeFilterMenu()
        }
      },

      /**
       * Update filter menu state
       * @param {String} column
       */
      updateFilterMenu: function(column) {
        if (this.activeColumn === column) {
          this.closeFilterMenu()
        } else {
          this.activeColumn = column
          this.isFilterMenuOpen = true
          this.$refs.filterMenu.updatePopper()
        }
      },

      /**
       * Clear column filter selections
       * @param {Object} event
       */
      clearColumnFilterSelections: function(event) {
        this.filterOptionSelections[this.activeColumn] = []
        this.filterTable()
      },

      /**
       * Close filter menu
       */
      closeFilterMenu: function() {
        this.isFilterMenuOpen = false
        this.activeColumn = ''
      },

      /**
       * Handle filter by option click
       * @param {String} columnName
       * @param {String} option
       */
      onFilterOptionClick: function(columName, option) {
        const filterOptionSelections = clone(this.filterOptionSelections)

        const items = filterOptionSelections[columName]
        const idx = items.indexOf(option)

        if (idx >= 0) {
          items.splice(idx, 1)
        } else {
          items.push(option)
        }

        this.filterOptionSelections = filterOptionSelections

        this.filterTable()
      },

      /**
       * Compute if filter option is checked
       * @param {String} columnName
       * @param {String} option
       * @returns {Boolean}
       */
      isFilterOptionChecked: function(columName, option) {
        const items = this.filterOptionSelections[columName]
        const idx = items.indexOf(option)

        if (idx >= 0) {
          return true
        }
        return false
      },

      /**
       * Compute if a given column has filter selections
       * @param {String} columnName
       */
      hasFilterSelections: function(columnName) {
        const items = propOr([], columnName, this.filterOptionSelections)
        return items.length > 0
      },

      /**
       * Filter table results based on option selections
       */
      filterTable: function() {
        this.filteredRelationshipTypes = this.transformedRelationshipTypes.filter(relType => {
          const checks = []
          this.columns.forEach(column => {
            const selections = this.filterOptionSelections[column]

            if (selections.length) {
              const filterBySelection = relType[column]
              checks.push(contains(filterBySelection, selections))
            }
          })
          return all(equals(true), checks)
        })

        this.sortColumn(this.activeColumn, this.sortDirection)
      },

      /**
       * Sort table by column
       * @param {String} columnName
       * @param {String} sortDirection
       */
      sortColumn: function(columnName, sortDirection) {
        const sortedList = this.returnSort(columnName, this.filteredRelationshipTypes, sortDirection)
        this.filteredRelationshipTypes = sortedList
      },

      /**
       * Checkbox display logic
       * @param {Object} store
       * @return {Boolean}
       */
      showRowCheckbox(store) {
        const tableState = store.states

        return tableState.isAllSelected
      },

      /**
       * Popper component modifier
       * @param {String} columnName
       * @param {Object} data
       * @returns {Object}
       */
      popperModifier: function(data) {
        console.log(data)
        const activeColumn = this.activeColumn
        const column = document.querySelector(`.column-${activeColumn}`)

        if (column) {
          const { x } = column.getBoundingClientRect()
          const offsetTop = pathOr(0, ['offsets', 'popper', 'top'], data)
          data.offsets.popper.left = x + 8
          data.offsets.popper.top = offsetTop + 200
        }

        return data
      },

      /**
       * Handle add relationship type event
       * @param {Object} relationship
       */
      onAddRelationshipType: function(relationship) {
        this.setRelationshipTypes([...this.relationshipTypes, relationship])
        // track creating a relationship type
        EventBus.$emit('track-event', {
          name: 'Create Relationship Type'
        })

        const chart = this.$refs.dataModelGraph
        if (chart) {
          chart.resetChart()
        }
      },

      /**
       * Update relationshipTypes state in vuex
       * @param {Object} relationship
       */
      onUpdateRelationshipType: function(relationship) {
        this.updateRelationshipType(relationship)

        const chart = this.$refs.dataModelGraph
        if (chart) {
          chart.resetChart()
        }
      },

      /**
       * Handle remove relationship event
       * @param {Object} relationship
       */
      onRemoveRelationshipType: function(relationship) {
        this.deleteRelationshipType(relationship)

        const chart = this.$refs.dataModelGraph
        if (chart) {
          chart.resetChart()
        }
      },

      /**
       * Setup relationship types table
       */
      setupRelationshipTypes: function() {
        // transform raw api data
        this.transformedRelationshipTypes = this.transformAPIResponse(this.relationshipTypes)
        // remove file relationship belongs_to
        this.filteredRelationshipTypes = this.transformedRelationshipTypes.filter(relType => relType.relationshipName !== 'belongs_to')
        // sort table
        this.sortColumn(this.sortBy, this.sortDirection)
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../../assets/_variables.scss';
  @import './_filter-menu.scss';

  .relationship-types {
    .empty-state {
      h3 {
        margin: 0 0 16px;
      }

      h2 {
        font-size: 16px;
      }

      p {
        font-size: 14px;
        margin-bottom: 18px;
      }
    }

    .data-model-graph {
      margin-bottom: 24px;
      .chart {
        border: 1px solid $gray_2;
      }
    }

    .add-relationship-type-btn {
      align-items: center;
      border: 1px solid $gray_2;
      color: $purple_1;
      display: flex;
      cursor: pointer;
      font-size: 14px;
      height: 58px;
      margin-bottom: 24px;
      padding: 0 16px;
      width: 100%;

      .svg-icon {
        height: 24px;
        width: 24px;
      }
    }

    .el-table {
      outline: none;

      td.checkbox {
        text-align: center;
      }

      .icon-arrow {
        color: #BDBDBD;
      }
    }

    .table-info {
      display: flex;
      justify-content: space-between;
    }

    .icon-procedure {
      color: $purple_1;
    }
  }
</style>
