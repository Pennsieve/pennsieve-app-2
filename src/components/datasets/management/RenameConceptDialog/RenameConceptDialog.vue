<template>
  <el-dialog
    :visible="visible"
    class="add-concept-dialog"
    :show-close="false"
    @open="onOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Rename Model"
    />

    <dialog-body>
      <el-form
        ref="conceptForm"
        :model="concept"
        :rules="rules"
        @submit.native.prevent="renameConcept"
      >
        <el-form-item prop="displayName">
          <template slot="label">
            Display Name <span class="label-helper">
              required
            </span>
          </template>
          <el-input
            v-model="concept.displayName"
            placeholder="For example Name, Type, Species"
            autofocus
          />
        </el-form-item>

        <el-form-item prop="name">
          <template slot="label">
            Model Identifier
          </template>
          <el-input
            v-model="concept.name"
            disabled
          />
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
      <bf-button @click="renameConcept">
        Rename Model
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import { propOr, clone, path, propEq, findIndex } from 'ramda'
  import { mapGetters, mapActions } from 'vuex'

  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
  import Request from '../../../../mixins/request/index'
  import AutoFocus from '../../../../mixins/auto-focus'
  import Sorter from '../../../../mixins/sorter'
  import EventBus from '../../../../utils/event-bus'

  export default {
    name: 'RenameConceptDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton
    },

    mixins: [
      Request,
      AutoFocus,
      Sorter
    ],

    props: {
      visible: Boolean,
      updatingConcept: Object
    },

    data: function() {
      return {
        concept: {
          displayName: '',
          name: ''
        },
        rules: {
          displayName: [
            { required: true, message: 'Please provide a display name', trigger: 'false' },
          ]
        }
      }
    },

    computed: {
      ...mapGetters([
        'userToken',
        'config',
        'concepts'
      ])
    },

    watch: {
      updatingConcept: function(concept) {
        this.concept = clone(concept)
      }
    },

    methods: {
      ...mapActions([
        'updateConcepts'
      ]),

      /**
       * On open, focus on first field and set concept object
       */
      onOpen: function() {
        this.autoFocus()

        this.concept = clone(this.updatingConcept)
      },

      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.$emit('update:visible', false)
        this.$refs.conceptForm.resetFields()
      },

      /**
       * Send concept to API to create it
       */
      renameConcept: function() {
        this.$refs.conceptForm.validate((valid) => {
          const datasetId = path(['params', 'datasetId'], this.$route)
          const conceptId = path(['params', 'conceptId'], this.$route)
          if (!valid || !conceptId || !datasetId) {
            return
          }

          const url = `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/${conceptId}`

          const concept = Object.assign({}, this.updatingConcept, this.concept)

          this.sendXhr(url, {
            header: {
              'Authorization': `bearer ${this.userToken}`
            },
            method: 'PUT',
            body: concept
          })
          .then(response => {
            // Update state
            let concepts = clone(this.concepts)
            const index = findIndex(propEq('id', response.id), concepts)
            concepts[index] = response

            const sortedConcepts = this.returnSort('displayName', concepts, 'asc')
            this.updateConcepts(sortedConcepts)

            this.$emit('update:visible', false)

            EventBus.$emit('toast', {
              type: 'success',
              msg: `${concept.displayName} renamed`
            })
          })
          .catch(response => {
            this.handleXhrError(response)
          })

          this.closeDialog()
        })
      }
    }
  }
</script>
