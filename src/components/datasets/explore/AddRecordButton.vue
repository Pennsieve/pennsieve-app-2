<template>
  <el-dropdown
    v-if="unlockedConcepts.length > 0"
    trigger="click"
    placement="bottom-end"
    @command="createInstance"
  >
    <span class="el-dropdown-link">
      <bf-button
        class="add-new"
        :disabled="editingInstance"
        :processing="processing"
        data-cy="btnNewRecord"
      >
        New Record
      </bf-button>
    </span>
    <el-dropdown-menu
      slot="dropdown"
      :offset="9"
      class="bf-menu add-record-menu"
      :arrow-offset="90"
    >
      <el-dropdown-item
        v-for="concept in unlockedConcepts"
        :key="concept.id"
        class="bf-menu-item"
        :item="concept"
        :command="concept.id"
      >
        {{ concept.displayName }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { propOr, filter, propEq } from 'ramda'

  import BfButton from '../../shared/bf-button/BfButton.vue'
  import Request from '../../../mixins/request'

  export default {
    name: 'AddRecordButton',

    components: {
      BfButton
    },

    mixins: [
      Request
    ],

    computed: {
      ...mapGetters([
        'concepts',
        'editingInstance',
        'config',
        'userToken'
      ]),

      /**
       * Compute list of all unlocked concepts
       * @returns {Array}
       */
      unlockedConcepts: function() {
        return filter(propEq('locked', false), this.concepts)
      }
    },

    data: function() {
      return {
        processing: false
      }
    },

    methods: {
      ...mapActions([
        'updateEditingInstance'
      ]),

      /**
       * Create concept instance and open page
       * @param {String} modelId
       */
      createInstance: function(modelId) {
        this.$router.push({
          name: 'concept-instance',
          params: {
            conceptId: modelId,
            instanceId: 'new'
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .bf-button {
    &.add-new {
      background: #11369C;
      padding: 8px 27px;
      position: relative;
      top: -2px;

      &:hover, &:focus {
        background: #0F308C;
      }

      &[disabled] {
        background: #7187C4;
      }
    }
  }

  .add-record-menu {
    max-height: calc(100vh - 125px);
  }
</style>
