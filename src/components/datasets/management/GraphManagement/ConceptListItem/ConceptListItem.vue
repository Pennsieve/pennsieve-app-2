<template>
  <el-row
    class="concept"
    type="flex"
    :gutter="32"
    align="middle"
  >
    <el-col
      class="concept-info"
      :span="8"
    >
      <div class="info">
        <el-tooltip
          placement="top"
          :content="concept.displayName"
          :open-delay="300"
        >
          <router-link
            :to="{
              name: 'model',
              params: { conceptId: concept.id }
            }"
          >
            {{ concept.displayName }}
          </router-link>
        </el-tooltip>

        <svg-icon
          v-if="concept.locked"
          icon="icon-lock-filled"
        />
      </div>
      Created {{ formatDate(concept.createdAt) }}
    </el-col>
    <el-col
      class="concept-info"
      :span="4"
    >
      <div class="info">
        {{ concept.propertyCount }}
      </div>
      <template v-if="concept.propertyCount > 1">
        Properties
      </template>
      <template v-else>
        Property
      </template>
    </el-col>
    <el-col
      class="concept-info"
      :span="4"
    >
      <div class="info">
        {{ concept.count }}
      </div>
      <template v-if="concept.count > 1">
        Records
      </template>
      <template v-else>
        Record
      </template>
    </el-col>
    <el-col
      class="align-right menu-col"
      :span="8"
    >
      <el-dropdown
        trigger="click"
        placement="bottom-end"
        @command="onMenuSelect"
      >
        <span class="btn-file-menu el-dropdown-link">
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
          <template v-if="!concept.locked">
            <el-dropdown-item
              :disabled="datasetLocked"
              command="configure"
            >
              Configure
            </el-dropdown-item>
            <el-dropdown-item
              v-if="concept.count === 0"
              command="archive"
              :disabled="datasetLocked"
            >
              Delete
            </el-dropdown-item>
            <el-dropdown-item
              v-if="concept.propertyCount > 0"
              :disabled="datasetLocked"
              command="newRecord"
            >
              Create new {{ modelDisplayName }}
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
  </el-row>
</template>

<script>
  import { propOr } from 'ramda'
  import { mapGetters, mapState } from 'vuex';

  import FormatDate from '../../../../../mixins/format-date'

  export default {
    name: 'ConceptListItem',

    mixins: [
      FormatDate
    ],

    props: {
      concept: {
        type: Object,
        default: {}
      }
    },

    computed: {
      ...mapState([
        'dataset'
      ]),

      ...mapGetters([
        'datasetLocked'
      ]),

      /**
       * @returns {String}
       */
      modelId: function() {
        return propOr('', 'id', this.concept)
      },
      /**
       * @returns {String}
       */
      modelDisplayName: function() {
        return propOr('', 'displayName', this.concept)
      }
    },

    methods: {
      onMenuSelect: function(command) {
        const commandsList = {
          'configure': () => this.openConcept(),
          'archive': () => this.$emit('archive-concept', this.concept),
          'newRecord': () => this.$router.push({ name: 'concept-instance', params: { conceptId: this.modelId, instanceId: 'new' }})
        }
        const cmd = commandsList[command]
        if (typeof cmd === 'function') {
          cmd()
        }
      },

      /**
       * Navigate to concept management page
       */
      openConcept: function() {
        const conceptId = propOr('', 'id', this.concept)

        this.$router.push({
          name: 'concept-management',
          params: {
            conceptId
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../../../assets/_variables.scss';

  .concept {
    padding: 16px 0;
    border-top: 1px solid $gray_2;
    &:first-child {
      border: none;
    }
  }
  .concept-info {
    color: $gray_4;
    .info {
      color: #000;
      display: flex;
      margin-bottom: 8px;
      a {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .svg-icon {
        color: $gray_4;
        margin-left: 8px;
      }
    }
  }
</style>
