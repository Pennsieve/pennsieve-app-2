<template>
  <div class="directory-tree">
    <v-jstree 
      :data="directoryData" 
      whole-row
      :allow-transition="false"
      @item-click="itemClick" 
    >
      <template slot-scope="_">
        <div style="display: inherit; width: 200px">
          <i
            v-if="_.model.children && _.model.children.length"
            :class="_.vm.themeIconClasses"
            role="presentation" 
          />
          <svg-icon
            v-else
            name="icon-file"
          />
          {{ _.model.text }}
        </div>
      </template>
    </v-jstree>
  </div>
</template>

<script>

const VJstree = require('@/components/shared/vue-jstree/dist/vue-jstree.js')['vue-jstree'].default

  export default {
    name: 'DirectoryTree',
    components: { VJstree },
    props: {
      directoryData: {
        type: Array,
        default: () => []
      },
      title: {
        type: String,
        default: ''
      },
    },

    methods: {
      /**
       * emit item-click event and item object when clicking a tree node
       */
      itemClick: function(vueComponent, item) {
        this.$emit('item-click', item)
      }
    }
  }

</script>

<style lang="scss" scoped>
  .directory-tree {
    transform: translateZ(0);
    /deep/ .tree-wholerow-clicked, /deep/ .tree-wholerow-hovered {
      z-index: 0;
      opacity: .5;
    }
  }
</style>
