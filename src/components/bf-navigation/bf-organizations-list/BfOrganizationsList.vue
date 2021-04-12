<template>
  <div class="bf-organizations-list">
    <el-input
      ref="filterName"
      v-model="filterName"
      class="org-filter"
      :placeholder="placeholder"
    >
      <svg-icon
        slot="prefix"
        name="icon-magnifying-glass"
        dir="up"
        color="currentColor"
      />
    </el-input>

    <div class="organizations-wrap">
      <bf-navigation-item
        v-for="org in filteredOrganizations"
        :key="org.organization.id"
        :active="computeActive(org.organization.id)"
        :label="org.organization.name"
        :item="org"
        @click="onHandleClick"
      />
    </div>
  </div>
</template>

<script>
  import BfNavigationItem from '../bf-navigation-item/BfNavigationItem.vue'
  import { mapGetters } from 'vuex'
  import EventBus from '../../../utils/event-bus'
  import { pathOr, defaultTo } from 'ramda'
  import InputPlaceholderHandler from '../../../mixins/input-placeholder-handler'

  export default {
    name: 'BfOrganizationsList',

    components: {
      BfNavigationItem
    },

    mixins: [
      InputPlaceholderHandler
    ],

    data: function() {
      return {
        filterName: '',
        placeholder: 'Filter by Name...'
      }
    },

    computed: {
      ...mapGetters([
        'organizations',
        'activeOrganization'
      ]),

      /**
       * Compute organizations based off of filter
       * @return {Array}
       */
      filteredOrganizations: function() {
        return this.organizations.filter(organization => {
          return organization.organization.name.toLowerCase().indexOf(this.filterName.toLowerCase()) > -1
        })
      }
    },

    watch: {
      /**
       * Dynamically set placeholder value (uses InputPlaceholder mixin)
       * @param {String} name
       */
      filterName: function(name) {
        this.updatePlaceholder(this.filterName, 'Filter by Name...')
      }
    },

    mounted: function() {
      // Focus on the filter input
      this.$refs.filterName.focus()
    },

    methods: {
      onHandleClick: function(item) {
        // Hide org list
        this.$emit('hide-org-list')

        EventBus.$emit('switch-organization', item)
      },
      /**
       * Compute active organization
       * @param {String} orgId
       * @returns {Boolean}
       */
      computeActive: function(orgId) {
        const activeOrgId = pathOr('', ['organization', 'id'], this.activeOrganization)
        return activeOrgId === orgId
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .bf-organizations-list {
    background: $purple_1;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 85px);
    left: 0;
    margin: 0;
    padding: 0 8px;
    position: absolute;
    width: 100%;
    z-index: 1;
    .bf-navigation-item {
      margin: 1px 0;
    }
  }
  .organizations-wrap {
    flex: 1;
    padding-bottom: 8px;
    overflow: scroll;
  }
  .org-filter {
    margin: 16px 0;
    .el-input__prefix {
      align-items: center;
      display: flex;
      left: 8px;
    }
    &.el-input--prefix .el-input__inner {
      padding-left: 32px;
    }
    .el-input__inner {
      background: #1F53E4;
      border: none;
      border-radius: 2px;
      color: $white;
      height: 32px !important;
      padding: 0 8px;
      &::placeholder {
        color: rgba(255,255,255,.65)
      }
    }
    .svg-icon {
      color: $white;
      height: 16px;
      width: 16px;
    }
  }
</style>
