<template>
  <intersect
    :threshold="[0.5]"
    @enter="handleTableEnter"
  >
    <div>
      <el-collapse-item
        v-if="showCollapse && !isSourceFile"
        :title="relationship.displayName"
        :name="relationship.name"
        :class="selectionCount > 0 ? 'row-is-selected' : ''"
      >
        <div
          slot="title"
          class="relationship-title"
        >
          <svg-icon
            name="icon-arrow-up"
            class="icon-collapse"
            :dir="arrowDirection(relationship.name)"
            height="10"
            width="10"
            color="#404554"
          />
          <h2>{{ relationship.displayName }}</h2>
          <div
            v-if="!selectionCount > 0"
            class="table-actions"
          >
            <span
              v-if="canAddNewFile"
              @click="onUploadClick"
            >
              <svg-icon
                v-if="!isSourceFile"
                name="icon-upload"
                class="icon-upload"
                height="20"
                width="20"
                color="#606266"
              />
            </span>
            <span
              v-if="canAddRelationship && getPermission('editor') && !isSourceFile"
              class="add-new"
              :class=" { disabled: datasetLocked }"
              @click="onAddRelationshipClick(relationship.name, $event)"
            >
              Add New
            </span>
          </div>
          <div
            v-else
            class="table-info"
          >
            <span class="selected-files">
              {{ selectionText }}
            </span>
            <a
              v-if="!datasetLocked"
              href="#"
              @click.prevent="onRemoveRelationships(relationship.name, $event)"
            >
              {{ relationshipText }}
            </a>
            <span
              v-if="isFilesType && !datasetLocked"
              class="relationships-text-divider"
            >
              |
            </span>
            <a
              v-if="isFilesType && !datasetLocked"
              href="#"
              @click.stop="onDeleteFiles"
            >
              {{ deleteText }}
            </a>
          </div>
        </div>

        <div
          id="relationships-table"
          v-loading="isLoading"
          :class="!isLoading && hasConcepts ? 'has-data' : ''"
          element-loading-background="#FBFBFD"
        >
          <p
            v-if="!isFilesType && !hasConcepts && canAddRelationship"
            class="empty-state-text"
          >
            No Related Records. Click "Add New" to link a record.
          </p>
          <p
            v-if="!canAddRelationship && !hasConcepts"
            class="empty-state-text"
          >
            No records have been created.
          </p>
          <div
            v-if="totalRowCount > 0"
            class="pagination-header mb-16"
          >
            <pagination-page-menu
              class="ml-8"
              :page-size="limit"
              @update-page-size="onUpdateLimit"
            />
            <el-pagination
              :page-size="limit"
              :pager-count="5"
              :current-page="offset / limit + 1"
              layout="prev, pager, next"
              :total="totalRowCount"
              @current-change="onPaginationPageChange"
            />
          </div>
          <el-table
            v-if="hasConcepts"
            ref="Table"
            :data="concepts"
            max-height="467"
            :row-class-name="tableRowClassName"
            :border="true"
            @bf-sort="handleSortChange"
            @selection-change="handleTableSelectionChange"
            @cell-mouse-enter="handleTableCellEnter"
            @cell-mouse-leave="handleTableCellLeave"
          >
            <!-- Files again...is isFilesType === the former 'isRecordFile' -->
            <template v-if="isFilesType">
              <el-table-column
                v-if="!datasetLocked"
                class-name="column-no-padding el-table-column--selection file-selection"
                type="selection"
                fixed
              >
                <template slot-scope="scope">
                  <el-checkbox
                    v-if="showRowCheckbox(scope.store, scope.row, hoverRow)"
                    :value="scope.store.isSelected(scope.row)"
                    @input="scope.store.commit('rowSelectedChanged', scope.row)"
                  />
                  <bf-waiting-icon
                    v-else-if="scope.row.status === 'Processing' || scope.row.status === 'Uploading'"
                    class="icon-package icon-waiting"
                  />
                  <img
                    v-else
                    class="svg-icon icon-item"
                    :src="fileIcon(scope.row.icon, scope.row.packageType)"
                  >
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                label="Name"
                fixed
                min-width="75"
                :render-header="renderHeader"
                :resizable="true"
              >
                <template slot-scope="scope">
                  <router-link
                    :to="getRecordUrl(scope)"
                  >
                    {{ getPackageDisplayName(scope.row) }}
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column
                prop="subtype"
                label="Kind"
                :render-header="renderHeader"
                :resizable="true"
              />
              <el-table-column
                prop="createdAt"
                label="Date Created"
                :render-header="renderHeader"
                :resizable="true"
              />
              <el-table-column
                width="75"
                :resizable="true"
              >
                <template slot-scope="scope">
                  <el-dropdown
                    v-if="getPermission('editor')"
                    trigger="click"
                    placement="bottom-end"
                    @command="onFileMenu"
                  >
                    <span
                      v-show="!datasetLocked"
                      class="btn-file-menu el-dropdown-link"
                      @click.stop="setActiveRow(scope.row, $event)"
                    >
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
                        v-if="scope.row.status === 'Unprocessed'"
                        command="process"
                      >
                        Process File
                      </el-dropdown-item>
                      <el-dropdown-item command="unlink">
                        Unlink File
                      </el-dropdown-item>
                      <el-dropdown-item command="delete">
                        Delete File
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>

              <div
                v-if="isLoading"
                slot="append"
                class="append-skeleton-loader"
              >
                <div>
                  <content-loader
                    :width="25"
                    :height="25"
                    :speed="2"
                    primary-color="#d8d8d8"
                    secondary-color="#ecebeb"
                    class="source-file-table-skeleton-loader"
                  >
                    <rect
                      x="7"
                      y="5.2"
                      rx="0"
                      ry="0"
                      width="11"
                      height="12"
                    />
                  </content-loader>
                </div>
                <div>
                  <content-loader
                    :width="124"
                    :height="25"
                    :speed="2"
                    primary-color="#d8d8d8"
                    secondary-color="#ecebeb"
                    class="source-file-table-skeleton-loader"
                  >
                    <rect
                      x="6"
                      y="9"
                      rx="5"
                      ry="5"
                      width="107"
                      height="7"
                    />
                  </content-loader>
                </div>
                <div>
                  <content-loader
                    :width="158"
                    :height="25"
                    :speed="2"
                    primary-color="#d8d8d8"
                    secondary-color="#ecebeb"
                    class="source-file-table-skeleton-loader"
                  >
                    <rect
                      x="50"
                      y="9"
                      rx="5"
                      ry="5"
                      width="107"
                      height="7"
                    />
                  </content-loader>
                </div>
                <div>
                  <content-loader
                    :width="177"
                    :height="25"
                    :speed="2"
                    primary-color="#d8d8d8"
                    secondary-color="#ecebeb"
                    class="source-file-table-skeleton-loader"
                  >
                    <rect
                      x="70"
                      y="9"
                      rx="5"
                      ry="5"
                      width="97"
                      height="7"
                    />
                  </content-loader>
                </div>
                <div>
                  <content-loader
                    :width="187"
                    :height="25"
                    :speed="2"
                    primary-color="#d8d8d8"
                    secondary-color="#ecebeb"
                    class="source-file-table-skeleton-loader"
                  >
                    <rect
                      x="75"
                      y="9"
                      rx="5"
                      ry="5"
                      width="97"
                      height="7"
                    />
                  </content-loader>
                </div>
                <div>
                  <content-loader
                    :width="137"
                    :height="25"
                    :speed="2"
                    primary-color="#d8d8d8"
                    secondary-color="#ecebeb"
                    class="source-file-table-skeleton-loader"
                  >
                    <rect
                      x="68"
                      y="9"
                      rx="5"
                      ry="5"
                      width="17"
                      height="7"
                    />
                  </content-loader>
                </div>
              </div>
            </template>
            <!-- Relationships -->
            <template v-else>
              <el-table-column
                v-if="!datasetLocked"
                type="selection"
              />
              <el-table-column
                v-if="showRelationshipName"
                prop="relationship"
                label="Relationship"
                fixed
                min-width="165"
                :render-header="renderHeader"
                :resizable="true"
              />
              <el-table-column
                v-for="(heading, index) in getHeadings(headings, ['relationship'], true)"
                :key="heading"
                :item="heading"
                :prop="getProperty(heading)"
                :label="heading"
                :render-header="renderHeader"
                min-width="165"
                :resizable="true"
              >
                <template slot-scope="scope">
                  <router-link
                    v-if="index === 0 && isSubmissions === false"
                    :to="getRecordUrl(scope)"
                    v-html="displayValue(scope.row[heading])"
                  />
                  <span
                    v-else
                    v-html="displayValue(scope.row[heading])"
                  />

                  <router-link
                    v-if="isFile(scope)"
                    :to="getRecordUrl(scope, getProperty(heading))"
                  >
                    {{ scope.row.file.name }}
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column
                v-if="getPermission('editor')"
                min-width="45"
                fixed="right"
                :resizable="true"
              >
                <template slot-scope="scope">
                  <div
                    v-if="!datasetLocked"
                    class="remove-relationship"
                    @click="onRemoveRelationship(scope.row, $event)"
                  >
                    <svg-icon
                      name="icon-remove"
                      height="10"
                      width="10"
                      color="#404554"
                    />
                  </div>
                </template>
              </el-table-column>
            </template>
          </el-table>
          <div
            v-if="totalRowCount > 0"
            class="source-file-table-results-count"
          >
            {{ getRowCount }}
          </div>
        </div>
      </el-collapse-item>

      <!-- SOURCE FILES TABLE -->
      <el-collapse-item
        v-if="showCollapse && isSourceFile"
        title="Source Files"
        name="sourcefiles"
        :class="selectionCount > 0 ? 'row-is-selected' : ''"
      >
        <div
          slot="title"
          class="relationship-title"
        >
          <svg-icon
            name="icon-arrow-up"
            class="icon-collapse"
            :dir="arrowDirection('sourcefiles')"
            height="10"
            width="10"
            color="#404554"
          />
          <h2>{{ displayName }}</h2>
          <div
            v-if="selectionCount > 0"
            class="table-info"
          >
            <span
              v-if="!datasetLocked"
              class="selected-source-files"
            >
              {{ selectionText }}
            </span>
            <span
              v-if="!datasetLocked"
              class="relationships-text-divider"
            >
              |
            </span>
            <a
              v-if="!datasetLocked"
              href="#"
              @click.stop="onDownloadSelection"
            >
              Download Selected
            </a>
          </div>
        </div>

        <div
          id="relationships-table"
          v-loading="loadTableResults"
          :class="!loadTableResults && hasConcepts ? 'has-data' : ''"
          element-loading-background="#FBFBFD"
        >
          <div
            v-if="totalRowCount > 0"
            class="pagination-header"
          >
            <pagination-page-menu
              class="ml-8"
              :page-size="limit"
              @update-page-size="onUpdateLimit"
            />
            <el-pagination
              :page-size="limit"
              :pager-count="5"
              :current-page="offset / limit + 1"
              layout="prev, pager, next"
              :total="totalRowCount"
              @current-change="onPaginationPageChange"
            />
          </div>
          <el-table
            ref="Table"
            class="no-radius-bottom"
            :data="concepts"
            max-height="467"
            :row-class-name="tableRowClassName"
            :border="true"
            @bf-sort="handleSortChange"
            @selection-change="handleTableSelectionChange"
            @cell-mouse-enter="handleTableCellEnter"
            @cell-mouse-leave="handleTableCellLeave"
          >
            <el-table-column
              v-if="!datasetLocked"
              class-name="column-no-padding el-table-column--selection file-selection"
              type="selection"
              fixed
            >
              <template slot-scope="scope">
                <el-checkbox
                  v-if="showRowCheckbox(scope.store, scope.row, hoverRow)"
                  :value="scope.store.isSelected(scope.row)"
                  @input="scope.store.commit('rowSelectedChanged', scope.row)"
                />
                <img
                  v-else
                  class="svg-icon icon-item"
                  :src="fileIcon(scope.row.icon, scope.row.packageType)"
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="filename"
              label="Name"
              fixed
              min-width="75"
              :render-header="renderHeader"
              :resizable="true"
            >
              <template slot-scope="scope">
                {{ decodeURIComponent(scope.row.filename) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="size"
              label="Size"
              :render-header="renderHeader"
              :resizable="true"
            />
            <el-table-column
              prop="createdAt"
              label="Date Created"
              :render-header="renderHeader"
              :resizable="true"
            />
            <el-table-column
              width="85"
              :resizable="true"
            >
              <template slot-scope="scope">
                <button
                  v-if="showRowCheckbox(scope.store, scope.row, hoverRow)"
                  class="download-source-file-col"
                  @click="onDownloadRow(scope.row)"
                >
                  <svg-icon
                    class="download-source-file-icon"
                    name="icon-upload"
                    dir="down"
                  />
                </button>
              </template>
            </el-table-column>

            <div
              v-if="isLoading"
              slot="append"
              class="append-skeleton-loader"
            >
              <div>
                <content-loader
                  :width="25"
                  :height="25"
                  :speed="2"
                  primary-color="#d8d8d8"
                  secondary-color="#ecebeb"
                  class="source-file-table-skeleton-loader"
                >
                  <rect
                    x="7"
                    y="5.2"
                    rx="0"
                    ry="0"
                    width="11"
                    height="12"
                  />
                </content-loader>
              </div>
              <div>
                <content-loader
                  :width="164"
                  :height="25"
                  :speed="2"
                  primary-color="#d8d8d8"
                  secondary-color="#ecebeb"
                  class="source-file-table-skeleton-loader"
                >
                  <rect
                    x="6"
                    y="9"
                    rx="5"
                    ry="5"
                    width="157"
                    height="7"
                  />
                </content-loader>
              </div>
              <div>
                <content-loader
                  :width="244"
                  :height="25"
                  :speed="2"
                  primary-color="#d8d8d8"
                  secondary-color="#ecebeb"
                  class="source-file-table-skeleton-loader"
                >
                  <rect
                    x="70"
                    y="9"
                    rx="5"
                    ry="5"
                    width="167"
                    height="7"
                  />
                </content-loader>
              </div>
              <div>
                <content-loader
                  :width="424"
                  :height="25"
                  :speed="2"
                  primary-color="#d8d8d8"
                  secondary-color="#ecebeb"
                  class="source-file-table-skeleton-loader"
                >
                  <rect
                    x="60"
                    y="9"
                    rx="5"
                    ry="5"
                    width="167"
                    height="7"
                  />
                </content-loader>
              </div>
            </div>
          </el-table>
          <div
            v-if="totalRowCount > 0"
            class="source-file-table-results-count"
          >
            {{ getRowCount }}
          </div>
        </div>
      </el-collapse-item>
    </div>
  </intersect>
</template>

<script>
import { clone, compose, contains, defaultTo, find, head, last, pathOr, propEq, propOr } from 'ramda'
import { mapGetters, mapState } from 'vuex'
import Intersect from 'vue-intersect'
import { ContentLoader } from 'vue-content-loader'

import EventBus from '@/utils/event-bus'
import Request from '@/mixins/request'
import TableFunctions from '@/mixins/table-functions'
import Sorter from '@/mixins/sorter'
import EncodeInternalFields from '@/mixins/encode-internal-fields'
import StorageMetrics from '@/mixins/bf-storage-metrics/index'
import FileIcon from '@/mixins/file-icon/index'
import FormatDate from '@/mixins/format-date'
import GetFileProperty from '@/mixins/get-file-property'
import FormatDisplayValue from './format-display-value'
import BfWaitingIcon from '@/components/shared/bf-waiting-icon/bf-waiting-icon.vue'
import { packageDisplayName } from '@/utils/packages'

import PaginationPageMenu from '@/components/shared/PaginationPageMenu/PaginationPageMenu'

export default {
  name: 'RelationshipsTable',

  components: {
    Intersect,
    BfWaitingIcon,
    ContentLoader,
    PaginationPageMenu
  },

  mixins: [
    Request,
    TableFunctions,
    Sorter,
    StorageMetrics,
    FileIcon,
    FormatDate,
    FormatDisplayValue,
    EncodeInternalFields,
    GetFileProperty
  ],

  props: {
    isSubmissions: {
      type: Boolean,
      default: false
    },
    showRelationshipName: {
      type: Boolean,
      default: true
    },
    activeSections: {
      type: Array,
      default: function() {
        return []
      }
    },
    relationship: {
      type: Object,
      default: () => ({})
    },
    showCollapse: {
      type: Boolean,
      default: false
    },

    url: {
      type: String,
      default: ''
    },

    canAddRelationship: {
      type: Boolean,
      default: true
    },
    sourceType: {
      type: String,
      default: 'record',
      validator: val => ['record', 'recordFile', 'sourceFile'].includes(val)
    },
    displayName: {
      type: String,
      default: 'Source Files'
    },
    proxyRecord: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },

    data() {
      return {
        activeRow: {},
        headings: [],
        hoverRow: {},
        concepts: [],
        selection: [],
        sortBy: this.sourceType === 'sourceFile' ? 'name' : 'createdAt',
        limit: 50,
        offset: 0,
        origResponse: [],
        isLoading: false,
        sourceFileCount: 0,
      }
  },

  computed: {
    ...mapState(['filesProxyId', 'dataset', 'relationshipTypes']),

    ...mapGetters([
      'userToken',
      'getModelByName',
      'filesProxyId',
      'getRelationshipTypeDisplayName',
      'getRelationshipTypes',
      'getPermission',
      'config',
      'datasetLocked'
    ]),

    /**
     * when we are dealing with an actual relationship,
     * we can get the count from there.  when we are dealing with
     * source files, we need it from the api endpoint
     */
    totalRowCount: function() {
      return this.relationship.count || this.sourceFileCount
    },

    /**
     * we want to suppress sorting for "recordFile" sourceType because the api doesn't support it
     */
    nonSortableColumns: function() {
      if (this.sourceType === 'recordFile') return ['name', 'subtype', 'createdAt']
      return []
    },

    /**
     * self explanatory
     */
    isSourceFile: function() {
      return this.sourceType === 'sourceFile'
    },

    /**
     * Get API Url for processing packages
     * @returns {String}
     */
    processFileUrl: function() {
      const packageId = propOr('', ['recordId'], this.activeRow)
      return this.config.apiUrl && this.userToken ? `${this.config.apiUrl}/packages/${packageId}/process?api_key=${
          this.userToken
        }` : ''
    },

    /**
     * Determine whether loading state should appear
     * if concepts list is initially populated
     * to figure out whether or not we should show the
     * skeleton loader
     */
    loadTableResults: function() {
      return this.concepts.length === 0 ? true : false
    },

    /**
     * Gets the total number of rows in the table
     * based on total count of results returned in API
     */
    getRowCount: function() {
      return `Showing ${this.concepts.length} of ${this.totalRowCount} Row${this.totalRowCount > 1 ? 's' : ''}`
    },

    /**
     * Compute if the user can add a new file
     * @returns {Boolean}
     */
    canAddNewFile: function() {
      return (
        this.isFilesType && !this.datasetLocked && this.getPermission('editor')
      )
    },

    /**
     * Determines what text to display based on number of files selected
     * in source files and record files table
     */
    selectionText: function() {
      let text = ''
      if (this.selection.length > 1) {
        text = 'Files Selected'
      } else {
        text = 'File Selected'
      }
      return this.sourceType === 'record'
        ? `${this.selection.length} Selected`
        : `${this.selection.length} ${text}`
    },

    selectionCount: function() {
      return this.selection.length
    },
    relationshipText: function() {
      const suffix = this.selectionCount > 1 ? 's' : ''
      return `Delete Relationship${suffix}`
    },
    deleteText: function() {
      const suffix = this.selectionCount > 1 ? 's' : ''
      return `Delete File${suffix}`
    },

    /**
     * Returns boolean based on whether table will render source
     * file data or relationship data
     * @returns {Boolean}
     */
    isFilesType: function() {
      // this seems more complicated than it needs to be...is this not just the former "isRecordFile" or sourceType === 'recordFile'?
      return !this.isSourceFile ? this.relationship.name === 'package' : this.isSourceFile
    },
    relationshipUrl: function() {
      if (!this.url) {
        return ''
      }

      const { sortBy, sortDirection, limit, offset } = this
      const ascending = sortDirection !== 'desc'

      const relationshipOrderBy = 'label'
      let queryParams = `?relationshipOrderBy=${relationshipOrderBy
      }&limit=${limit
      }&offset=${offset
      }&ascending=${ascending
      }&includeIncomingLinkedProperties=true`

      if (this.sortBy !== 'relationship') {
        queryParams += `&recordOrderBy=${this.prefixField(sortBy)}`
      }

      return `${this.url}${queryParams}`
    },

    /**
     * Computed API Url for Record Files table
     * @returns {String}
     */
    filesPagedUrl: function() {
      if (!this.url) {
        return ''
      }

      let queryParams = `?offset=${this.offset}&limit=${this.limit}`
      return `${this.url}${queryParams}`
    },

    /**
     * Computed API Url for Source Files table
     * @returns {String}
     */
    // @TODO Modify this to handle sorting on sources table
    sourceFilesUrl: function() {
      if (!this.url) {
        return ''
      }

      // ...yuck...
      const mungedSortBy = this.sortBy === 'filename' ? 'name' : this.sortBy

      const queryParams = `?order-by=${mungedSortBy
      }&order-by-direction=${this.sortDirection
      }&api_key=${this.userToken
      }&limit=${this.limit
      }&offset=${this.offset}`
      return `${this.url}${queryParams}`

    },

    /**
     * Checks if concepts list is populated
     * @returns {Boolean}
     */
    hasConcepts: function() {
      return this.concepts.length > 0
    }
  },

  mounted: function() {
    this.$store.watch(
      this.getRelationshipTypes,
      this.onWatchRelationshipTypes.bind(this)
    )
  },

  methods: {
    /**
     * Get package display name
     * @params {Object} file
     * @returns {String}
     */
    getPackageDisplayName: function(file) {
      return packageDisplayName(file.name, file.extension, file.children)
    },

    /**
     * Used to download a single source file row
     * @param {Object} row
     *
     */
    onDownloadRow: function(row) {
      EventBus.$emit('trigger-download', [this.proxyRecord], [row])
    },

    /**
     * Used to download multiple source files
     * @param {Object} row
     *
     */
    onDownloadSelection: function() {
      EventBus.$emit('trigger-download', [this.proxyRecord], this.selection)
    },

    /**
     * Method to load the files in
     * a record details table
     */
    loadRecordFiles: function() {
      if (!this.filesPagedUrl){
        this.isLoading = false
        return
      }

      this.sendXhr(this.filesPagedUrl, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        },
      })
        .then(response => {
          this.handleXhrResponse(response.results)
        })
        .catch(this.handleXhrError.bind(this))
    },
    /**
     * Used to load source files of a package
     * for Source Files table
     */
    loadSourceFiles: function() {
      if (!this.sourceFilesUrl) {
        this.isLoading = false
        return
      }

      this.sendXhr(this.sourceFilesUrl)
        .then(response => {
          this.sourceFileCount = response.totalCount
          this.handleXhrResponse(response.results)
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Used to generate the styling for the
     * file status based on the state of
     * that file
     * @param {Object} row
     * @returns {string}
     */
    tableRowClassName: function({ row }) {
      if (this.sourceType === 'recordFile') {
        const statusRows = {
          'Processing': 'processing-row',
          'Failed': 'failed-row',
          'Unprocessed': 'unprocessed-row',
          'Uploading': 'unprocessed-row'
        }
        return statusRows[row.status] !== '' ? statusRows[row.status] : 'no-status-row'
      }

      if (this.sourceType === 'sourceFile') {
        return 'download-row'
      }
    },
    /**
     * Format relationships after relationship types are loaded
     * This resolves a race condition where the
     * table data is loaded before relationshipTypes are
     */
    onWatchRelationshipTypes: function(val) {
      if (Object.keys(val).length > 0 && this.origResponse.length > 0) {
        this.handleTableRefreshResponse(this.origResponse)
      }
    },

    /**
     * Opens delete file dialogue
     */
    onDeleteFiles: function() {
      const fileIds = this.selection.map(record => {
        return {
          content: {
            id: propOr('', 'recordId', record)
          }
        }
      })
      this.$emit('delete-files', fileIds)
    },
    /**
     * Sets the active row for the menu clicked
     */
    setActiveRow: function(row, evt) {
      evt.preventDefault()
      this.activeRow = row
    },
    /**
     * Handler for file menu click
     * @param {String} name
     */
    onFileMenu: function(name) {
      // if (typeof this[name] === 'function') {
      //   this[name]()
      // }

      this[name]()
    },
    /**
     * Emit unlink file event
     */
    unlink: function() {
      const evt = {
        stopPropagation: () => {}
      }
      this.onUnlinkFiles(this.activeRow, evt)
    },
    /**
     * Emit delete file event
     */
    delete: function() {
      const file = {
        content: {
          id: propOr('', 'recordId', this.activeRow)
        }
      }
      this.$emit('delete-files', [file])
    },

    /**
     * Used to process a file if state
     * is set to 'Unprocessed'
     */
    process: function() {
      if (this.processFileUrl === '') {
        return
      }
      this.sendXhr(this.processFileUrl, {
        method: 'PUT',
        header: {
          Authorization: `bearer ${this.userToken}`
        }
      })
        .then(response => {
         this.activeRow.status = 'Processing'
        })
        .catch(this.handleXhrError.bind(this))

    },

    /**
     * Get the arrow direction based on section name and if it is active
     * @param {string} sectionName
     * @returns {string}
     */
    arrowDirection: function(sectionName) {
      if (this.activeSections) {
        const isActive = contains(sectionName, this.activeSections)
        return isActive ? 'down' : 'right'
      }
    },
    /**
     * Handle upload click event for Files table
     * @param {Object} e
     */
    onUploadClick(e) {
      e.preventDefault()
      EventBus.$emit('open-uploader', true)
      this.$store.dispatch('updateUploadDestination', {
        content: this.dataset.content
      })
    },
    /**
     * Handle add relationship click event for any table
     * @param {String} conceptName
     * @param {Object} e
     */
    onAddRelationshipClick(conceptName, e) {
      e.stopPropagation()

      const lockedDataset = propOr(false, 'locked', this.dataset)
      if (lockedDataset) {
        return
      }

      EventBus.$emit('add-relationship', conceptName)
    },
    /**
     * Handle remove relationship click event
     * @param {Object} row
     * @param {Object} e
     */
    onRemoveRelationship(row, e) {
      e.stopPropagation()

      const relationshipInstanceId = row.relationshipInstanceId
      const relationships = [relationshipInstanceId]
      const tableName = this.relationship.name

      this.$emit('remove-relationships', { relationships, tableName })
    },
    /**
     * Handle unlinking a file click event
     * @param {Object} row
     * @param {Object} e
     */
    onUnlinkFiles(row, e) {
      e.stopPropagation()

      const relationships = [row.relationshipInstanceId]
      const tableName = this.relationship.name

      this.$emit('unlink-files', { relationships, tableName })
    },
    /**
     * Emit remove relationships event to Concept Instance component
     * @param {String} relName
     * @param {Object} e
     */
    onRemoveRelationships(relName, e) {
      e.stopPropagation()
      const relationships = this.selection.map(
        obj => obj.relationshipInstanceId
      )
      const tableName = this.relationship.name

      this.$emit('remove-relationships', { relationships, tableName })
    },
    /**
     * Calculate number of items selected in a table
     * @param {String} tableName
     */
    getTableSelectionCount(tableName) {
      const cmp = pathOr(null, [tableName, 0])(this.$refs)
      if (cmp) {
        const table = cmp.$refs.table
        const tableSelection = pathOr([], [`store`, 'states', 'selection'])(
          table
        )
        return tableSelection.length
      }
    },
    /**
     * Handle Table Enter event on initial render
     */
    handleTableEnter: function() {
      if (this.concepts.length > 0) {
        return
      }
      this.isLoading = true;
      switch (this.sourceType) {
        case 'sourceFile':
          this.loadSourceFiles()
          break
        case 'recordFile':
          this.loadRecordFiles()
          break
        default:
         this.sendXhrRequest()
      }
    },

    /**
     * Makes XHR call
     * Takes optional callback to handle sort change responses
     * @param {String} callback
     */
    sendXhrRequest: function(callback = null) {
      if (!this.relationshipUrl) {
        this.isLoading = false
        return
      }

      this.sendXhr(this.relationshipUrl, {
        header: {
          Authorization: `bearer ${this.userToken}`
        }
      })
        .then(data => {
          if (this.isSubmissions) {
            this.getLinkedFiles(data)
            return
          }

          if (typeof callback !== 'function') {
            this.handleXhrResponse(data)
          } else {
            callback(data)
          }
        })
        .catch(this.handleXhrError.bind(this))
    },

    // /**
    //  * For clinical trials, get linked files for submissions
    //  * @param {Array} data
    //  */
    // getLinkedFiles: async function(data) {
    //   await Promise.all(data.map(async (record) => {
    //     // Make request for the record's file, and assign the response as a value
    //     record.file = await this.requestLinkedFiles(record)
    //     return record
    //   }))

    //   this.handleXhrResponse(data)
    // },

    requestLinkedFiles: function(record) {
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const modelName = propOr('', 'name', this.relationship)
      const recordId = compose(
        propOr('', 'id'),
        find(propEq('type', 'submission'))
      )(record)

      const url = `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/${modelName}/instances/${recordId}/files`

      return this.sendXhr(url, {
        header: {
          Authorization: `bearer ${this.userToken}`
        }
      })
        .then(response => {
          return compose(
            defaultTo({}),
            last,
            defaultTo([]),
            head,
            defaultTo([])
          )(response)
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Handles initial xhr request and subsequent load more requests
     * @param {Array} data
     */
    handleXhrResponse: function(data) {
      this.isLoading = false
      let formattedData
      if (data) {
        if (!Array.isArray(data)){
          this.origResponse = data.results
          // set headings state
          this.formatHeaders(data.results)
          // transform response
          formattedData = this.formatResults(data.results)
        } else {
          this.origResponse = data
          // set headings state
          this.formatHeaders(data)
          // transform response
          formattedData = this.formatResults(data)
        }

        this.concepts = formattedData
        // update related files state for files relationship drawer component
        if (this.isFilesType) {
          this.$emit('set-related-files', formattedData)
        }
      }
    },
    /**
     * Format the data for the function that will format the headers :)
     * @param {Array} data
     */
    formatHeaders: function(data) {
      let headingValues

      // creating this pseudo concept objects for the getHeading table function :/
      // again...this "isFilesType" boolean is problematic
      if (!this.isFilesType || this.sourceType === 'sourceFile') {
        const valuesObject = { values: pathOr([], [0, 1, 'values'])(data) }
        headingValues = clone(valuesObject)
        headingValues.values.push(
          this.generateConceptObj('relationship', 'relationship')
        )
        headingValues.values.push(
          this.generateConceptObj('createdAt', 'Date Created')
        )
      } else {
        headingValues = { values: [] }
        headingValues.values.push(this.generateConceptObj('name', 'Name', true))
        headingValues.values.push(this.generateConceptObj('subtype', 'Kind'))
      }

      // Display the file as the last column if available
      if (this.isSubmissions) {
        headingValues.values.push(this.generateConceptObj('bf_submission_file', 'File'))
      }

      this.headings = [headingValues]
    },
    /**
     * Creates mock concpet objects that are included in the getHeaders "headings" input
     * @param {String} name
     * @param {String} displayName
     * @param {Boolean} conceptTitle
     * @return {Object}
     */
    generateConceptObj: function(name, displayName, conceptTitle = false) {
      return {
        conceptTitle,
        default: true,
        displayName: displayName,
        name: name,
        relationship: name === 'relationship'
      }
    },
    /**
     * Handles xhr request response for table sort changes and table refresh
     * @param {Array} data
     */
    handleTableRefreshResponse: function(data) {
      this.isLoading = false
      // set headings state
      this.formatHeaders(data)
      // transform response
      const formattedData = this.formatResults(data)
      // udpate concepts
      this.concepts = formattedData

      if (this.isFilesType) {
        this.$emit('set-related-files', formattedData)
      }
    },
    /**
     * Formats and flattens results before rendering
     * @param {Array} results
     * @returns {Array}
     */
    formatResults: function(results) {
      if (results.hasOwnProperty('results')){
        results = results.results
      }
      const getValues = compose(
        propOr([], 'values'),
        last
      )
      const getRecordId = compose(
        propOr('', 'id'),
        last
      )
      const getContent = compose(
        propOr({}, 'content'),
        last
      )
      const getIcon = compose(
        propOr('', 'icon'),
        last
      )
      const getStorageOrSize = arr => {
        return (arr.size || '') || (arr[arr.length - 1].storage || '')
      }
      const getSubtype = compose(
        propOr('', 'subtype'),
        last
      )
      const getProperties = compose(
        propOr([], 'properties'),
        last
      )
      const getCreatedAt = compose(
        this.formatDate,
        propOr('', 'createdAt')
      )
      const getUpdatedAt = compose(
        this.formatDate,
        propOr('', 'updatedAt')
      )
      const getExtension = compose(
        propOr('', 'extension'),
        last
      )
      const getChildren = compose(
        propOr('', 'children'),
        last
      )

      return (
        results
          // @TODO: remove filter once API is updated to not return files in a DELETING state
          .filter(arr => {
            const record = last(arr)
            const status = pathOr('READY', ['content', 'state'], record)
            return status != 'DELETING'
          })
          .map(arr => {
            const relationship = head(arr)
            const record = last(arr)

            const obj = {
              relationshipInstanceId: propOr('', 'id', relationship)
            }

            // Submissions table
            if (this.isSubmissions) {
              const fileContent = pathOr({}, ['file', 'content'], arr)
              obj.file = fileContent
            }

            // Relationships Table
            const values = getValues(arr)
            if (values.length > 0) {
              const relationshipDisplayName = propOr('', 'displayName', relationship)

              obj.relationship = relationshipDisplayName
              obj.createdAt = getCreatedAt(relationship)
              obj['Date Created'] = {
                dataType: 'Date',
                value: getCreatedAt(relationship)
              }
              obj.updatedAt = getUpdatedAt(relationship)
              obj.recordId = getRecordId(arr)
              values.forEach(res => {
                obj[res.displayName] = {
                  dataType: res.dataType,
                  value: this.formatDisplayValue(res)
                }
              })
            }

            // Files Table
            /**
             * @TODO This badly needs refactored. This work was done when we had the
             * false requirement of a flat object for tables, but that is not the case
             * as `el-table-column` can take a path for its `prop` property
             */
            const content = getContent(arr)
            if (content.id) {
              const { name, state } = content
              const properties = getProperties(arr)

              const fileStates = {
                'ERROR': 'Failed',
                'UPLOADED': 'Unprocessed',
                'PROCESSING': 'Processing',
                'UNAVAILABLE': 'Uploading',
                'RUNNING': 'Processing',
                'PENDING': 'Processing'
              }

              const status = fileStates[state]

              obj.name = name
              obj.recordId = content.id
              obj.createdAt = getCreatedAt(content)
              obj['Date Created'] = getCreatedAt(content)
              obj.updatedAt = getUpdatedAt(content)
              obj.subtype =
                this.getFilePropertyVal(properties, 'subtype') ||
                getSubtype(arr)
              obj.state = state
              obj.status = status
              obj.storage = this.formatMetric(getStorageOrSize(arr))
              obj.icon =
                this.getFilePropertyVal(properties, 'icon') || getIcon(arr)
              obj.extension = getExtension(arr)
              obj.children = getChildren(arr)
            }

            // Source Files Table
            const sourceContent = propOr('', 'content', arr)
            if (sourceContent.id) {
              obj.id = sourceContent.id
              obj.name = sourceContent.name
              obj.filename = sourceContent.filename
              obj.fileType = sourceContent.fileType
              obj.createdAt = getCreatedAt(sourceContent)
              obj.size = this.formatMetric(getStorageOrSize(sourceContent))
              // storage and content specifically for BfDownloadFile.vue
              obj.storage = sourceContent.size
              obj.content = {
                name: sourceContent.name
              }
              obj.updatedAt = getUpdatedAt(sourceContent)
              obj.packageType = sourceContent.objectType
              obj.packageId = sourceContent.packageId
            }

            if (content.packageType === 'ExternalFile') {
            obj.packageType = content.packageType
            obj.subtype = 'External File'
          }

            return obj
          })
      )
    },
    /**
     * Handle sort change
     * @param {String} property
     */
    // @TODO Modify this to handle sorting on sources table
    handleSortChange(property) {
      this.offset = 0;
      this.onTableSort(property)
      this.refreshTable(property)
    },

    /**
     * Checkbox display logic
     * @param {Object} store
     * @param {Object} currentRow
     * @param {Object} hoverRow
     */
    showRowCheckbox(store, currentRow, hoverRow) {
      if (this.datasetLocked) {
        return false
      }

      const tableState = store.states
      let currentRowId = ''
      let hoverRowId = ''
      let rowsMatch = ''

      // check if rows match
      if (this.isSourceFile) {
        currentRowId = propOr('', 'id', currentRow)
        hoverRowId = propOr('', 'id', hoverRow)
        rowsMatch = currentRowId === hoverRowId
      } else {
        currentRowId = propOr('', 'relationshipInstanceId', currentRow)
        hoverRowId = propOr('', 'relationshipInstanceId', hoverRow)
        rowsMatch = currentRowId === hoverRowId
      }

      // check if row is in table state selection array
      const selection = tableState.selection
      if (rowsMatch === true || selection.length > 0) {
        return true
      }
      return false
    },
    /**
     * Handle table selection change
     * @param {Array} selection
     */
    handleTableSelectionChange(selection) {
      this.selection = selection
    },
    /**
     * Handle table cell enter
     * @param {Object} row
     */
    handleTableCellEnter(row) {
      this.hoverRow = row
    },
    /**
     * Handle table cell leave
     * @param {Object} event
     */
    handleTableCellLeave(row, column, cell, event) {
      const nodeName = pathOr('', ['toElement', 'nodeName'])(event)
      const whiteList = ['TD', 'TR']
      // if moving to element other than TD or TR, reset hover row
      if (whiteList.indexOf(nodeName) < 0) {
        this.hoverRow = {}
      }
    },

    /**
     * Gets the property name for the displayName
     * @param {String} displayName
     */
    getProperty: function(displayName) {
      const headings = compose (
        propOr([], 'values'),
        head
      )(this.headings)

      if (displayName === 'Date Created') {
        return 'createdAt'
      }

      return compose(
        propOr(displayName, 'name'),
        find(propEq('displayName', displayName))
      )(headings)
    },
    /**
     * Compute the record url for relationship tables
     * @param {Object} scope
     */
    getRecordUrl: function(scope) {
      const recordId = pathOr('', ['row', 'recordId'])(scope)

      // file relationships
      if (recordId && recordId.includes('package')) {
        return {
          name: 'file-record',
          params: {
            conceptId: this.filesProxyId,
            instanceId: recordId
          }
        }
      }

      // Submissions
      const isFile = this.isFile(scope)
      if (isFile) {
        const fileId = pathOr('', ['row', 'file', 'id'], scope)
        return {
          name: 'file-record',
          params: {
            conceptId: this.filesProxyId,
            instanceId: fileId
          }
        }
      }

      // standard relationships
      const model = this.getModelByName(this.relationship.name)
      if (model && recordId) {
        return {
          name: 'concept-instance',
          params: {
            conceptId: model.id,
            instanceId: recordId
          }
        }
      }
      return ''
    },

    /**
     * Request records data and refresh table
     */
    refreshTable: function(property, state) {
      this.isLoading = true
      switch (this.sourceType) {
        case 'sourceFile':
          this.loadSourceFiles()
          break
        case 'recordFile':
          this.loadRecordFiles(state)
          break
        default:
          // eslint-disable-next-line no-case-declarations
          const count = propOr(0, 'count', this.relationship)
          if (count === 0) {
            this.isLoading = false
            this.concepts = []
          } else {
            this.sendXhrRequest(this.handleTableRefreshResponse)
          }
      }
    },

    isFile: function(scope) {
      if (this.isSubmissions) {
        const columnProp = pathOr('', ['column', 'property'], scope)
        const yo = columnProp === 'bf_submission_file'
        return yo
      }

      return false
      // return has('file', row)
    },

    /**
     * handle changing the page
     * @param {Number} page
     */
    onPaginationPageChange: function(page) {
      this.offset = (page - 1) * this.limit
      this.refreshTable()
    },

    /**
     * handle changing the results per page
     * @param {Number} page
     */
    onUpdateLimit: function(limit) {
      this.offset = 0
      this.limit = limit
      this.refreshTable()
    }
  }
}
</script>

<style lang="scss">
@import '../../../../assets/_variables.scss';

.relationships-text-divider {
  display: inline-block;
  margin: 0 4px;
}

#relationships-table {
  position: relative;
  min-height: 50px;
  transition-property: min-height;
  transition-duration: 0.5s;
  transition-timing-function: ease-in;

  .load-more {
    display: inline-block;
    margin: 8px 0;
    cursor: pointer;
  }

  img.svg-icon {
    height: 24px;
    width: 24px;
  }

  &.has-data {
    min-height: 0;
  }

  .el-collapse {

    .el-collapse-item__wrap {
      border-bottom: solid 1px red;
    }
  }

  .bf-table-header button,
  thead button {
    text-transform: none;
  }
  .el-table__fixed-right,
  .el-table,
  .el-table__fixed {
    &:before {
      background: none;
    }
  }
  .el-table {
    border-radius: 4px 4px 0 0;

    .el-table__append-gutter {
      cursor: pointer;
    }

    .processing-row td:nth-child(3) {
      .cell {
        background: #2760ff;
        color: #fafafa;
        width: fit-content;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        padding-bottom: 1px;
      }
    }

    .unprocessed-row td:nth-child(3) {
      .cell {
        background: #f1f1f3;
        color: #404554;
        width: fit-content;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        padding-bottom: 1px;
      }
    }

    .failed-row td:nth-child(3) {
      .cell {
        background: #e94b4b;
        color: #fafafa;
        width: fit-content;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        padding-bottom: 1px;
      }
    }

    .processed-row td:nth-child(3) {
      .cell {
        background: none;
      }
    }

    .download-row td:last-child {
      .cell {
        display: flex;
        justify-content: flex-end;
      }
    }
    .cell {
      padding: 0 16px;
      word-break: unset;
    }
    .file-selection .cell {
      align-content: center;
      display: flex;
      justify-content: center;
    }
    .column-no-padding .cell {
      padding: 0;
    }
  }

  .empty-state-text {
    margin: 16px 0;
    color: $gray_4;
  }
}

.relationship-title {
  .add-new {
    font-size: 12px;
    margin-left: 8px;
    &.disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
}

.download-source-file-col {
  display: flex;
  justify-content: flex-end;
}

.source-file-table-results-count {
  border-left: solid 1px $gray_2;
  border-right: solid 1px $gray_2;
  border-bottom: solid 1px $gray_2;
  border-top: none;
  padding: 13px 0;
  padding-left: 17px;
  background: $gray_1;
  font-weight: 500;
  color: $gray_6;
  font-size: 13px;
  line-height: 23px;
  margin-top: -3px;
   border-radius: 0 0 4px 4px;
}

.source-file-table-skeleton-loader {
  border-top: solid 1px $gray_2;
  height: 45px;
}

.append-skeleton-loader{
  display: flex;
  flex-direction: row;
}

.source-file-table-load-more {
  cursor: pointer;
  border-top: solid 1px $gray_2;
  width: -webkit-fill-available;
  padding-top: 11px;
  padding-bottom: 18px;
  display: flex;
  justify-content: center;
  height: 18px;
}

.pagination-header {
  align-items: center;
  display: flex;
  justify-content: space-between
}
</style>
