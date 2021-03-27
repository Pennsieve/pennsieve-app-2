<template>
  <div class="concept-instance-property concept-instance-linked-property">
    <el-row
      type="flex"
      :gutter="32"
      align="middle"
    >
      <el-col
        class="name"
        :sm="11"
        :md="9"
        :lg="8"
      >
        {{ label }}
        <template v-if="Boolean(property.to.recordId)">
          <button
            class="icon-prop button-edit"
            :disabled="datasetLocked"
            @click="editLinkedProperty"
          >
            <svg-icon
              class="icon-pencil"
              name="icon-pencil"
              height="16"
              width="16"
            />
          </button>
          <button
            class="icon-prop button-unlink"
            :disabled="datasetLocked"
            @click="removeLinkedProperty"
          >
            <svg-icon
              class="icon-unlink"
              name="icon-unlink"
              height="16"
              width="16"
            />
          </button>
        </template>
      </el-col>
      <el-col
        :sm="11"
        :md="11"
        :lg="11"
      >
        <a
          v-if="!Boolean(property.to.recordId) && !datasetLocked"
          href="#"
          @click.prevent="editLinkedProperty"
        >
          Select a {{ property.to.modelDisplayName }}
        </a>
        <div v-else>
          <router-link
            :to="{
              name: 'concept-instance',
              params: {
                conceptId: property.to.modelId,
                instanceId: property.to.recordId
              }
            }"
          >
            {{ property.to.recordDisplayName }}
          </router-link>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { find, propEq, propOr } from 'ramda'

  import FormatDate from '../../../../mixins/format-date'

  export default {
    name: 'ConcpetInstanceLinkedProperty',

    mixins: [
      FormatDate
    ],

    props: {
      label: String,
      user: String,
      date: String,
      value: String,
      property: {
        type: Object,
        default: function() {
          return {}
        }
      }
    },

    computed: {
      ...mapGetters([
        'orgMembers', 'datasetLocked'
      ]),

      /**
       * Compute user name from state
       * @returns {String}
       */
      userName: function() {
        const user = find(propEq('id', this.user), this.orgMembers)
        const firstName = propOr('', 'firstName', user)
        const lastName = propOr('', 'lastName', user)

        return `${firstName} ${lastName}`
      },

      /**
       * Compute formatted property value
       * @returns {String}
       */
      displayPropertyValue: function() {
        return this.date ? this.formatDate(this.date) : this.value
      },
    },

    methods: {
      /**
       * Open linked property drawer
       */
      editLinkedProperty: function() {
        this.$emit('edit-linked-property', this.property)
      },

      /**
       * Open remove linked property dialog
       */
      removeLinkedProperty: function() {
        this.$emit('confirm-remove-linked-property', this.property)
      }
    }
  }

</script>

<style lang="scss">
  @import '_concept-instance-property';

  .concept-instance-linked-property {
    .button-edit,
    .button-unlink {
      color: $glial;
      &:hover {
        color: $app-primary-color
      }
    }

    .button-edit {
      right: 24px !important;
    }
  }

</style>
