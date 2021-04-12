<template>
  <sidebar-message
    class="copy-concept-id"
    title="Model Id"
  >
    <p slot="copy">
      You can use the ID or name to access this model type and related data using the API.
    </p>
    <el-tooltip
      placement="top"
      :content="tooltipContent"
      :value="visibility"
      :manual="true"
    >
      <el-input
        class="concept-id-field"
        :disabled="true"
        :value="conceptId"
      >
        <i
          slot="suffix"
          class="copy-icon-wrapper"
        >
          <button
            class="copy-icon-button"
            @click="copyId"
          >
            <svg-icon
              name="icon-document"
              height="20"
              width="20"
              color="#fff"
            />
          </button>
        </i>
      </el-input>
    </el-tooltip>
  </sidebar-message>
</template>

<script>
import SidebarMessage from '../../../shared/SidebarMessage/SidebarMessage.vue'

export default {
  name: 'CopyConceptId',

  components: {
    SidebarMessage
  },

  props: {
    conceptId: {
      type: String,
      default: ''
    },
  },

  data() {
    return {
      visibility: false,
    }
  },

  computed: {
    /**
     * Computes copy success message
     * @returns {String}
     */
    tooltipContent: function() {
      return `'${this.conceptId}' copied!`
    }
  },

  methods: {
    /**
     * Copies the concept id to clipboard
     */
    copyId: function() {
      this.$clipboard(this.conceptId)
      this.displayMessage()
    },
    /**
     * Displays success copy message for 2s
     */
    displayMessage: function() {
      this.visibility = true
      setTimeout(() => {
        this.visibility = false
      }, 2000)
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/variables';

  .copy-concept-id {
    p {
      margin-bottom: 24px;
    }
  }

  .concept-id-field {
    height: 40px;
    width: 264px;
  }

  .copy-icon-wrapper {
    background: $purple_1;
    border: solid 1px transparent;
    border-radius: 0 2px 2px 0;
    cursor: pointer;
    width: 34px;
    height: 38px;
    line-height: 34px;
    text-align: center;
    position: absolute;

    .copy-icon-button {
      height: 100%;
      width: 100%;
    }

    &:hover {
      background: $purple_3;
    }
  }
</style>
