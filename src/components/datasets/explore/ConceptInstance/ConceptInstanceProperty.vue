<template>
  <div
    class="concept-instance-property"
    :class="[ editing ? 'editing' : '' ]"
  >
    <el-row
      type="flex"
      :gutter="32"
    >
      <el-col
        class="name"
        :sm="11"
        :md="9"
        :lg="8"
      >
        <span
          v-if="property.locked"
          ref="propertyLabel"
          class="property-label"
          @mouseover="showLabel"
          @mouseout="hideLabel"
        >
          {{ displayName(property) }}
        </span>

        <el-tooltip
          v-else
          placement="top"
          :content="displayName(property)"
          :disabled="!visibility"
        >
          <label
            ref="propertyLabel"
            :for="`input-${property.name}`"
            @mouseover="showLabel"
            @mouseout="hideLabel"
          >
            <span class="property-label">
              {{ displayName(property) }}
            </span>
            <span
              v-if="(property.required || property.conceptTitle) && editing"
              class="required"
            >
              *
            </span>
          </label>
        </el-tooltip>

        <svg-icon
          v-if="!editing && property.locked"
          class="icon-prop"
          name="icon-lock-filled"
          height="16"
          width="16"
        />

        <button
          v-if="!editing && !property.locked && canEdit && !datasetLocked && getPermission('editor')"
          class="icon-prop button-edit"
          @click="onEdit"
        >
          <svg-icon
            class="icon-pencil"
            name="icon-pencil"
            height="16"
            width="16"
          />
        </button>
      </el-col>
      <el-col
        class="property-value"
        :class="dataType.toLowerCase()"
        :sm="editing ? 13 : 11"
        :md="11"
        :lg="editing ? 10 : 11"
      >
        <template v-if="editing">
          <div class="input-wrapper">
            <template v-if="hasMultiValues && propertyList.length > 0">
              <concept-instance-property-input
                v-for="prop in propertyList"
                :key="prop.id"
                :property="prop"
                :required="isConceptTitle"
                :autofocus="isConceptTitle"
                :has-multi-values="hasMultiValues"
                :is-enum="isEnum"
                :string-subtypes="stringSubtypes"
                @remove-multi-value-by-index="handleRemoveMultiValueByIndex"
              />
            </template>
            <template v-else>
              <concept-instance-property-input
                :property="property"
                :required="isConceptTitle"
                :autofocus="isConceptTitle"
                :has-multi-values="hasMultiValues"
                :is-enum="isEnum"
                :string-subtypes="stringSubtypes"
              />
            </template>
            <div
              v-if="hasMultiValues && !property.locked"
              class="add-another-input"
              @click="addAnotherInput"
            >
              <svg-icon
                name="icon-plus"
                class="icon-plus"
                height="24"
                width="24"
                color="#2760FF"
              /> Add another value...
            </div>
          </div>
        </template>

        <template v-else>
          <!-- display saved multi values -->
          <template v-if="hasMultiValues">
            <ul class="multi-value-list">
              <li
                v-for="value in property.value"
                :key="value.name"
                :item="value"
              >
                <span
                  v-if="dataType === 'String'"
                  v-html="$sanitize(formatUniqueDisplayValues(property, value), ['a'])"
                />
                <span v-else>
                  {{ formatUniqueDisplayValues(property, value) }}
                </span>
              </li>
            </ul>
          </template>
          <!-- display single value -->
          <template v-else>
            <span
              v-if="dataType === 'String'"
              v-html="$sanitize(formatUniqueDisplayValues(property), ['a'])"
            />
            <span v-else>
              {{ formatUniqueDisplayValues(property) }}
            </span>
          </template>
        </template>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import { propOr, defaultTo, clone, find, propEq, pathEq, path, pluck } from 'ramda'
  import AsyncValidator from 'async-validator'

  import ConceptInstancePropertyInput from './ConceptInstancePropertyInput.vue'
  import CheckOverflow from '../../../../mixins/check-overflow'
  import DataType from '../../../../mixins/data-type'
  import FormatUniqueDisplayValues from './format-display-value'
  import EventBus from '../../../../utils/event-bus'

  export default {
    name: 'ConceptInstanceProperty',

    components: {
      ConceptInstancePropertyInput
    },

    mixins: [
      FormatUniqueDisplayValues,
      CheckOverflow,
      DataType,
    ],

    props: {
      property: {
        name: '',
        displayName: '',
        value: '',
        locked: false,
        dataType: '',
        description: ''
      },
      editing: {
        type: Boolean,
        default: false
      },
      canEdit: {
        type: Boolean,
        default: true
      },
      stringSubtypes: {
        type: Array,
        default: () => []
      }
    },

    data() {
      return {
        propertyList: [],
        visibility: false
      }
    },

    computed: {
      ...mapState([
        'dataset'
      ]),

      ...mapGetters([
        'getPermission',
        'datasetLocked'
      ]),

      /**
       * Computes data type of property
       * @returns {String}
       */
      dataType: function() {
        return this.formatDataType(this.property)
      },
      /**
       * Computes whether property is concept title
       * @returns {Boolean}
       */
      isConceptTitle: function() {
        return propOr(false, 'conceptTitle', this.property)
      },
      /**
       * Computes whether property accepts multiple values
       * @returns {Boolean}
       */
      hasMultiValues: function() {
        return pathEq(['dataType', 'type'], 'array', this.property)
      },
      /**
       * Computes whether or not enum field is present
       * @returns {Boolean}
       */
      isEnum: function() {
        return Boolean(path(['dataType', 'items', 'enum'], this.property))
      },
    },

    watch: {
      property: {
        handler: function(property) {
          const valName = propOr('', 'name', property)
          const inList = find(propEq('name', valName), this.propertyList)
          if (inList) {
            return
          }
          const propertyValues = propOr('', 'value', property)
          if (Array.isArray(propertyValues)) {
            propertyValues.forEach((val, idx) => {
              const prop = clone(property)
              prop.value = val
              prop.arrayIndex = idx
              this.propertyList.push(prop)
            })
          } else {
            this.propertyList.push(property)
          }
        },
        immediate: true
      },
      propertyList: {
        handler: function(list) {
          const key = path([0, 'name'], list)
          if (!key || !this.hasMultiValues) {
            return
          }
          const obj = {}
          obj[key] = pluck('value', list)
          this.$emit('add-property-value', obj)
        },
        immediate: true,
        deep: true
      }
    },

    methods: {
      /**
       * Determines if label should be visible
       */
      showLabel: function() {
        const elem = this.$refs.propertyLabel
        this.visibility = this.checkWidth(elem)
      },
      /**
       * Hides tooltip
       */
      hideLabel: function() {
        this.visibility = false
      },
      /**
       * Generates display name
       */
      displayName: function(val) {
        const displayName = propOr('', 'displayName', val)
        const name = propOr('', 'name', val)
        return defaultTo(name, displayName)
      },
      /**
       * Trigger edit mode
       */
      onEdit: function(){
        this.$emit('edit-instance', this)
      },
      /**
       * Handles adding mulitple inputs for a given field
       */
      addAnotherInput: function() {
        const newProp = clone(this.property)
        newProp.id = Math.random().toString(36).substr(2, 9) // just to have a temp id for now
        newProp.arrayIndex = this.propertyList.length
        newProp.value = null
        this.propertyList.push(newProp)
      },
      /**
       * Removes multi-property by index from propertyList
       * @param {Number} idx
       */
      handleRemoveMultiValueByIndex: function(idx) {
        this.propertyList = this.propertyList.filter(prop => prop.arrayIndex !== idx)
      }
    }
  }

</script>

<style lang="scss">
  @import '_concept-instance-property';

  .add-another-input {
    align-items: center;
    background: transparent;
    border: 1px dashed $light-gray;
    box-sizing: border-box;
    color: $dark-gray;
    cursor: pointer;
    display: flex;
    height: 38px;
    margin-top: 16px;
    max-width: 476px;
    padding-left: 8px;
  }

  .concept-instance-property {
    .multi-value-list {
      margin: 0;
      padding: 0 0 0 16px;
      li {
        line-height: 24px;
      }
    }
  }
</style>
