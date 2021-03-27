<template>
  <div class="bf-upload-menu">
    <el-dropdown
      trigger="click"
      placement="bottom-end"
      @visible-change="onVisibleChange"
      @command="onMenuClick"
    >
      <bf-button :disabled="datasetLocked">
        Add File
        <svg-icon
          slot="suffix"
          class="icon-caret"
          icon="icon-arrow-up"
          color="#fff"
          :dir="arrowDir"
          height="10"
          width="10"
        />
      </bf-button>
      <el-dropdown-menu
        slot="dropdown"
        class="bf-menu"
      >
        <el-dropdown-item
          class="bf-menu-item"
          command="file"
        >
          Upload File
        </el-dropdown-item>
        <el-dropdown-item
          class="bf-menu-item"
          command="external-file"
        >
          Link to External File
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
  import BfButton from '../../../shared/bf-button/BfButton.vue';
  import { mapGetters } from 'vuex';

  export default {
  name: 'BfUploadMenu',

  components: {
    BfButton
  },

  props: {
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isOpen: false
    }
  },

  computed: {
    ...mapGetters(['datasetLocked']),

    /**
     * Compute direction of the dropdown arrow based on open state
     * @returns {String}
     */
    arrowDir: function() {
      return this.isOpen ? 'up' : 'down'
    },
  },

  methods: {
    /**
     * On menu click, close menu and emit event about option clicked
     * @param {String} command
     */
    onMenuClick: function(command) {
      this.isOpen = false
      this.$emit('upload-menu-click', command)
    },

    /**
     * Hanlde visible-change event
     */
    onVisibleChange: function(visible) {
      this.isOpen = visible
    }
  }
}
</script>
