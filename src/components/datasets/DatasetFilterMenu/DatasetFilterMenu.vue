<template>
  <div>
    <el-popover
      ref="roleMenu"
      v-model="isRoleMenuOpen"
      popper-class="no-padding dataset-filter-sub-menu scroll"
      placement="right-start"
      width="170"
      trigger="hover"
      :offset="-8"
      transition=""
      :open-delay="100"
      :visible-arrow="false"
    >
      <div class="bf-menu scroll-menu">
        <ul>
          <li
            v-for="role in roles"
            :key="role.value"
          >
            <a
              href="#"
              class="bf-menu-item"
              :data-menu-item="`role-${role.value}`"
              @click.prevent="onMenuSelect(role)"
            >
              {{ role.name }}
              <svg-icon
                v-if="datasetSearchParams.withRole === role.value"
                icon="icon-check"
                class="item-icon-check"
                width="20"
                height="20"
              />
            </a>
          </li>
        </ul>
      </div>
    </el-popover>

    <el-popover
      ref="collectionMenu"
      v-model="isCollectionMenuOpen"
      popper-class="no-padding dataset-filter-sub-menu scroll"
      placement="right-start"
      width="170"
      trigger="hover"
      :offset="-8"
      transition=""
      :open-delay="100"
      :visible-arrow="false"
    >
      <div class="bf-menu scroll-menu">
        <ul>
          <li
            v-for="collection in collections"
            :key="collection.name"
          >
            <a
              href="#"
              class="bf-menu-item status-item"
              :data-menu-item="`collection-${collection.name}`"
              @click.prevent="onMenuSelect(collection)"
            >
              <span class="status-label">
                {{ collection.name }}
              </span>
              <svg-icon
                v-if="datasetSearchParams.collectionId === collection.id"
                icon="icon-check"
                class="item-icon-check"
                width="20"
                height="20"
              />
            </a>
          </li>
        </ul>
      </div>
    </el-popover>

    <el-popover
      ref="statusMenu"
      v-model="isStatusMenuOpen"
      popper-class="no-padding dataset-filter-sub-menu scroll"
      placement="right-start"
      width="170"
      trigger="hover"
      :offset="-8"
      transition=""
      :open-delay="100"
      :visible-arrow="false"
    >
      <div class="bf-menu scroll-menu">
        <ul>
          <li
            v-for="status in filterOrgStatusList"
            :key="status.name"
          >
            <a
              href="#"
              class="bf-menu-item status-item"
              :data-menu-item="`status-${status.name}`"
              @click.prevent="onMenuSelect(status)"
            >
              <span
                class="dot"
                :style="{
                  backgroundColor: status.color
                }"
              />
              <span class="status-label">
                {{ status.displayName }}
              </span>
              <svg-icon
                v-if="datasetSearchParams.status === status.name"
                icon="icon-check"
                class="item-icon-check"
                width="20"
                height="20"
              />
            </a>
          </li>
        </ul>
      </div>
    </el-popover>

    <el-popover
      ref="datasetFilterMenu"
      v-model="isDatasetFilterMenuOpen"
      popper-class="no-padding"
      placement="bottom-start"
      width="200"
      trigger="click"
      transition=""
      :visible-arrow="false"
    >
      <div class="bf-menu">
        <ul>
          <li
            v-for="filter in filters"
            :key="filter.value"
          >
            <a
              class="bf-menu-item"
              href="#"
              :data-menu-item="`filter-${filter.value}`"
              @click="onMenuSelect(filter)"
            >
              {{ filter.name }}
              <svg-icon
                v-if="isShowingAllDatasets"
                icon="icon-check"
                class="item-icon-check"
                width="20"
                height="20"
              />
            </a>
          </li>
        </ul>

        <hr>

        <ul>
          <li>
            <a
              v-popover:collectionMenu
              class="bf-menu-item icon-item"
              href="#"
              @click.prevent
            >
              Collection
              <svg-icon
                icon="icon-arrow-right"
                width="10"
                height="10"
              />
            </a>
          </li>
        </ul>

        <hr>

        <ul>
          <li>
            <a
              v-popover:roleMenu
              class="bf-menu-item icon-item"
              href="#"
              @click.prevent
            >
              Permission
              <svg-icon
                icon="icon-arrow-right"
                width="10"
                height="10"
              />
            </a>
          </li>
        </ul>

        <hr>

        <ul>
          <li>
            <a
              v-popover:statusMenu
              class="bf-menu-item icon-item"
              href="#"
              @click.prevent
            >
              Status
              <svg-icon
                icon="icon-arrow-right"
                width="10"
                height="10"
              />
            </a>
          </li>
        </ul>
      </div>
    </el-popover>

    <button
      v-popover:datasetFilterMenu
      class="dataset-filter-dropdown el-dropdown-link"
    >
      <span class="el-dropdown-text-link">
        Show {{ filterLabel }}
      </span>
      <svg-icon
        class="ml-8 arrow-style"
        name="icon-arrow-up"
        :dir="menuArrowDir"
        height="10"
        width="10"
      />
    </button>
  </div>
</template>

<script>
import {
  mapState
} from 'vuex'
import {
  compose,
  find,
  propOr,
  propEq
} from 'ramda'

/**
 * Return the name property from a list of statuses
 * @param {Array} statuses
 * @param {String} status
 * @returns {String}
 */
const getStatusLabel = (statuses, status) => compose(
  propOr('', 'displayName'),
  find(propEq('name', status))
)(statuses)

/**
 * Return label based on if the user
 * is showing only their datasets
 * @param {Boolean} isOnlyMyDatasets
 * @returns {Boolean}
 */
const getNonStatusLabel = (isOnlyMyDatasets) => {
  return isOnlyMyDatasets
    ? 'My Datasets'
    : 'All Datasets'
}

export default {
  name: 'DatasetFilterMenu',

  data: function() {
    return {
      isDatasetFilterMenuOpen: false,
      filters: [
        {
          value: 'ALL_DATASETS',
          name: 'All Datasets',
          type: 'owner'
        }
      ],
      roles: [
        {
          name: 'Owner',
          value: 'owner',
          type: 'role'
        },
        {
          name: 'Manager',
          value: 'manager',
          type: 'role'
        },
        {
          name: 'Editor',
          value: 'editor',
          type: 'role'
        },
        {
          name: 'Viewer',
          value: 'viewer',
          type: 'role'
        }
      ],
      isStatusMenuOpen: false,
      isRoleMenuOpen: false,
      isCollectionMenuOpen: false
    }
  },

  computed: {
    ...mapState([
      'orgDatasetStatuses',
      'datasetFilters'
    ]),

    ...mapState('datasetModule', [
      'datasetSearchParams'
    ]),

    ...mapState('collectionsModule', [
      'collections'
    ]),

    /**
     * Compute if the dataset filter checkbox
     * should be displayed based on the filter
     * @param {Object} filter
     * @returns {Boolean}
     */
    isShowingAllDatasets: function() {
      const status = propOr('', 'status', this.datasetSearchParams)
      const withRole = propOr('', 'withRole', this.datasetSearchParams)
      const collection = propOr('', 'collectionId', this.datasetSearchParams)

      return status === '' && withRole === '' && collection === ''
    },

    /**
     * Filters empty status names from orgDatasetStatuses
     * @returns {Array}
     */
    filterOrgStatusList: function() {
      return this.orgDatasetStatuses.filter(status => {
        return status.displayName !== ''
      })
    },

    /**
     * Compute dataset filter arrow direction
     * @returns {String}
     */
    menuArrowDir: function() {
      return this.isDatasetFilterMenuOpen ? 'up' : 'down'
    },

    /**
     * Compute filter label
     * @returns {String}
     */
    filterLabel: function() {
      const isOnlyMyDatasets = propOr(false, 'onlyMyDatasets', this.datasetSearchParams)
      const status = propOr(false, 'status', this.datasetSearchParams)

      // this check is when you select a status
      if (status !== '') {
        return getStatusLabel(this.orgDatasetStatuses, status)
      } else {
        if (this.datasetFilters.filterName !== '') {
          return this.datasetFilters.filterName
        } else {
          return getNonStatusLabel(isOnlyMyDatasets)
        }

      }

    }
  },

  mounted () {
     const isOnlyMyDatasets = propOr(false, 'onlyMyDatasets', this.datasetSearchParams)
     const doesStatusExist = this.orgDatasetStatuses.some(
        el => (el.name === status)
     )

     if (!doesStatusExist && this.datasetFilters.filterName === '') {
        const owner = {
          name: 'All Datasets',
          type: 'owner',
          value: 'ALL_DATASETS'
        }
        this.$emit("select", owner)
        return getNonStatusLabel(isOnlyMyDatasets)
      } else {
        return this.datasetFilters.filterName
      }
  },

  methods: {
    /**
     * On menu select, emit select event
     * and hide the menus
     * @param {Object} item
     */
    onMenuSelect: function(item) {
      if (!item.hasOwnProperty('type') && !item.hasOwnProperty('color')) {
        // this is collection and not a status object
        item.type = 'collection'
      }
      this.$emit('select', item)
      this.closeMenus()
    },

    /**
     * Close all menus
     */
    closeMenus: function() {
      this.isDatasetFilterMenuOpen = false
      this.isStatusMenuOpen = false
      this.isRoleMenuOpen = false
      this.isCollectionMenuOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.bf-menu hr {
  margin: 8px 0
}
.dot {
  height: 10px;
  width: 10px;
  margin-right: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dataset-no-status-item .dot{
  background-color: #d2d2d2;
}

.dataset-wip-item .dot {
  background-color: $dopamine;
}

.dataset-in-review-item .dot {
  background-color: $orange;
}

.dataset-completed-item .dot {
  background-color: $nucleus;
}

.status-item {
  align-items: center;
  display: flex;
}
.status-label {
  flex: 1;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-dropdown-text-link {
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  margin-top: 4px;
}

.arrow-style {
  margin-top: -7px;
}
</style>
<style lang="scss">
  .dataset-filter-sub-menu {
    margin-left: 0 !important;
  }
</style>
