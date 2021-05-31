<template>
  <div class="sidebar-collapsible-item">
    <el-collapse
      v-model="models"
      @change="collapseDropdown"
    >
      <el-collapse-item :name="view.name">
        <div
          slot="title"
          class="collapse-item-title"
        >
          <svg-icon
            class="icon-collapse"
            name="icon-arrow-up"
            :dir="arrowDirection(view.name)"
            height="10"
            width="10"
            color="#404554"
          />
          <h2>{{ view.name }}</h2>
          <button @click.stop="toggleSnapshotSidebar">
            <svg-icon
              class="snapshot-icon"
              :name="icon"
              height="20"
              width="20"
            />
          </button>
        </div>
        <div
          v-for="item in view.models"
          :key="item.id"
        >
          <div class="table-title">
            {{ item.name }}
          </div>
          <div
            v-for="prop in item.props"
            :key="prop.id"
          >
            <a
              class="prop-link"
              @click="getModelInfo(item.name, prop.name)"
            >
              {{ prop.name }}
            </a>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
  import { contains } from 'ramda'
  import EventBus from '../../../utils/event-bus'

  export default {
    name: 'SidebarCollapsibleItem',
    props: {
      view: {
        type: Object,
        default: () => {}
      },
      modelName: {
        type: String,
        default: ''
      },
      icon: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        models: []
      }
    },
    methods: {
      collapseDropdown: function() {
        // logic goes here
      },

      getModelInfo: function(modelName, propName) {
        EventBus.$emit('insert-model-info', {view: this.view, model: modelName, prop: propName})
      },

       /**
       * Get the arrow direction based on section name and if it is active
       * @param {string} sectionName
       * @returns {string}
       */
      arrowDirection: function(sectionName) {
        const isActive = contains(sectionName, this.models)
        return isActive ? 'up' : 'down'
      },

      toggleSnapshotSidebar: function() {
        EventBus.$emit('toggle-snapshots', { view: this.view, toggle: true })
      }
    },
  }
</script>

<style scoped lang="scss">
  @import '../../../assets/_variables.scss';
  .sidebar-collapsible-item {
    .collapse-item-title {
      h2 {
        margin-top: -29px;
        margin-left: 20px;
      }
      .icon-label {
        display: inline-block;
        margin-right: 24px;
        width: 20px;
        height: 20px;
        color: "#404554";
      }
      .active-icon-label {
        display: inline-block;
        margin-right: 24px;
        width: 20px;
        height: 20px;
        color: $purple_1;
      }

      .snapshot-icon {
        margin-top: -93px;
        margin-left: 209px;
      }
    }

    .table-title {
      font-weight: 600;
      padding: 5px 0;
    }
  }

  .prop-link {
    &:hover {
      cursor: pointer;
    }
  }

</style>

<style lang="scss">
  .sidebar-collapsible-item {
    .el-collapse {
      .el-collapse-item__header {
        border-bottom: none;
      }
      .el-collapse-item__wrap {
        border-bottom: none;
      }
    }
  }
</style>