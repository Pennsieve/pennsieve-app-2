<template>
  <el-dialog
    class="create-relationship-type-dialog"
    :visible="visible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      :title="title"
    />

    <dialog-body>
      <el-form
        ref="form"
        :model="relationship"
        :rules="rules"
        @submit.native.prevent="create"
      >
        <el-form-item prop="originModel">
          <template slot="label">
            Originating Model <span class="label-helper">
              required
            </span>
          </template>
          <el-select
            v-if="!editing"
            v-model="relationship.originModel"
            filterable
            placeholder="Select an Origin Model"
            autofocus
            popper-class="bf-menu"
            default-first-option
          >
            <el-option
              v-for="concept in concepts"
              :key="concept.id"
              :label="concept.displayName"
              :value="concept.name"
            />
          </el-select>

          <div
            v-else
            class="text-disabled icon"
          >
            <div class="value">
              {{ relationship.originModelDisplayName }}
            </div>
            <svg-icon
              name="icon-lock-filled"
              height="20"
              width="20"
              color="#DADADA"
            />
          </div>
        </el-form-item>

        <el-form-item prop="relationshipName">
          <template slot="label">
            Relationship Name <span class="label-helper">
              required
            </span>
          </template>
          <relationship-input
            ref="relationshipInput"
            v-model="relationship.relationshipName"
            :options="relationshipNames"
          />
        </el-form-item>

        <el-form-item prop="destinationModel">
          <template slot="label">
            Destination Model <span class="label-helper">
              required
            </span>
          </template>
          <el-select
            v-if="!editing"
            v-model="relationship.destinationModel"
            filterable
            placeholder="Select a Destination Model"
            autofocus
            popper-class="bf-menu"
            default-first-option
          >
            <el-option
              v-for="concept in concepts"
              :key="concept.id"
              :label="concept.displayName"
              :value="concept.name"
            />
          </el-select>

          <div
            v-else
            class="text-disabled icon"
          >
            <div class="value">
              {{ relationship.destinationModelDisplayName }}
            </div>
            <svg-icon
              name="icon-lock-filled"
              height="20"
              width="20"
              color="#DADADA"
            />
          </div>
        </el-form-item>
      </el-form>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        :disabled="createDisabled"
        :processing="isCreating"
        processing-text="Saving"
        @click="createRelationshipType"
      >
        <template v-if="!editing">
          Create
        </template>
        <template v-else>
          Save
        </template>
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import { pathOr, values, propOr, prop, uniqBy, find, propEq, reject } from 'ramda'
  import snakeCase from 'lodash.snakecase'
  import uuidv1 from 'uuid/v1'

  import BfButton from '../../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import DialogBody from '../../../../shared/dialog-body/DialogBody.vue'
  import RelationshipInput from '../../../explore/RelationshipInput/RelationshipInput.vue'

  import Request from '../../../../../mixins/request'

  export default {
    name: 'CreateRelationshipTypeDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton,
      RelationshipInput
    },

    mixins: [
      Request
    ],

    props: {
      visible: {
        type: Boolean,
        default: false
      },
      relationshipTypeEdit: {
        type: Object,
        default: () => {
          return {}
        }
      },
      relationshipTypes: {
        type: Array,
        default: function() {
          return []
        }
      },
      url: {
        type: String,
        default: ''
      }
    },

    data: function() {
      return {
        relationship: {
          originModel: '',
          relationshipName: '',
          destinationModel: ''
        },
        rules: {
          originModel: [
            { required: true, trigger: 'false', message: 'Please select an originating model' },
          ],
          relationshipName: [
            { required: true, trigger: 'false', message: 'Please select a relationship name' },
          ],
          destinationModel: [
            { required: true, trigger: 'false', message: 'Please select a destination model' },
          ]
        },
        isCreating: false
      }
    },

    computed: {
      ...mapGetters([
        'getModelByName'
      ]),

      ...mapState([
        'concepts',
        'userToken'
      ]),

      /**
       * Compute if the create button is disabled,
       * based on all form fields being filled in
       * @returns {Boolean}
       */
      createDisabled: function() {
        const vals = values(this.relationship)
        const validValues = vals.filter(Boolean)
        return vals.length !== validValues.length
      },

      /**
       * Compute if the user is editing an existing relationship
       * @returns {Boolean}
       */
      editing: function() {
        return Object.keys(this.relationshipTypeEdit).length > 0
      },

      /**
       * Compute the title of the dialoh based on if the user is editing
       * @returns {String}
       */
      title: function() {
        return this.editing === false ?
          'Create Relationship Type' :
          'Update Relationship Type'
      },

      /**
       * Compute unique relationship names
       * @returns {Array}
       */
      relationshipNames: function() {
        // removing file relationship belongs_to as it should not be visible to users
        const sansFileRelationship = reject(propEq('name', 'belongs_to'), this.relationshipTypes)
        return uniqBy(prop('displayName'), sansFileRelationship)
      }
    },

    watch: {
      relationshipTypeEdit: {
        handler: function(relationshipTypeEdit) {
          if (Object.keys(relationshipTypeEdit).length > 0) {
            this.$nextTick(() => {
              this.relationship = Object.assign({}, relationshipTypeEdit)
            })
          }
        },
        immediate: true
      }
    },

    methods: {
      /**
       * Closes the dialog and resets form
       */
      closeDialog: function() {
        this.$emit('update:visible', false)
        this.$emit('update:relationshipTypeEdit', {})
        this.relationship = {}
        this.$emit('close')
        this.isCreating = false

        this.$refs.form.resetFields()
      },

      getRelationshipByProp: function(prop, val) {
        return find(propEq(prop, val), this.relationshipTypes)
      },

      /**
       * Create relationship type if form is valid
       */
      createRelationshipType: function() {
        this.$refs.form.validate((valid) => {
          if (!valid) {
            return
          }

          const originModelId = propOr('', 'id', this.getModelByName(this.relationship.originModel))
          const destinationModelId = propOr('', 'id', this.getModelByName(this.relationship.destinationModel))

          const relationshipType = this.getRelationshipByProp('name', this.relationship.relationshipName)

          const displayName = propOr(this.relationship.relationshipName, 'displayName', relationshipType)

          let url = this.url
          let method = 'POST'

          // appending uuid to comply with API restriction on unique relationship names
          const name = `${snakeCase(displayName)}_${uuidv1()}`

          if (this.editing) {
            method = 'PUT'
            url += `/${this.relationship.id}`
          }
          const payload = {
            name,
            displayName,
            description: "",
            from: originModelId,
            to: destinationModelId,
            schema: []
          }

          this.isCreating = true

          this.sendXhr(url, {
            method: method,
            header: {
              'Authorization': `bearer ${this.userToken}`
            },
            body: payload
          })
          .then(response => {
            if (this.editing === false) {
              this.$emit('add-relationship-type', response)
            } else {
              this.$emit('update-relationship-type', response)
            }
            this.closeDialog()
          })
          .catch(error => {
            // @TODO Show error state to user
            this.isCreating = false
            this.handleXhrError(error)
          })
        })
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../../../assets/_variables.scss';

  .create-relationship-type-dialog {
    .el-select {
      width: 100%
    }

    .text-disabled.icon .svg-icon {
      right: 12px
    }

    .button-spinner {
      height: 20px;
      margin: -3px 8px -3px 0;
      width: 20px;
    }
  }
</style>
