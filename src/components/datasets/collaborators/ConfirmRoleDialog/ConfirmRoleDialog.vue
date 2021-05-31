<template>
  <el-dialog
    class="simple"
    :visible="visible"
    :show-close="false"
    @close="close"
  >
    <bf-dialog-header slot="title" />

    <dialog-body>
      <!-- Role is being updated -->
      <template v-if="role === 'owner'">
        <h2 slot="heading">
          Change dataset owner?
        </h2>

        <p>You are about to change the owner of <strong>{{ datasetName }}</strong>. The new owner of the dataset will be <strong>{{ memberName }}</strong>. Changes will take place immediately and cannot be undone.</p>
        <p>Click the <strong>Change Owner</strong> button to proceed.</p>
      </template>

      <template v-if="role === 'viewer'">
        <template v-if="currentRole === 'manager'">
          <h2 slot="heading">
            Change dataset access to Viewer?
          </h2>

          <p>{{ entityCopy }} will no longer be able to invite organization members to this dataset, edit files, models, and records, or publish to Pennsiseve Discover.</p>
        </template>
        <template v-if="currentRole === 'editor'">
          <h2 slot="heading">
            Change dataset access to Viewer?
          </h2>

          <p>{{ entityCopy }} will no longer be able to create, edit, or delete records and files.</p>
        </template>
      </template>

      <!-- Role is being created -->
      <template v-else>
        <template v-if="role === 'manager'">
          <h2 slot="heading">
            Change dataset access to Manager?
          </h2>

          <p>Managers can invite people and teams to a dataset, edit and delete models, records and files, as well as publish to Pennsieve Discover.</p>
        </template>
        <template v-if="role === 'editor'">
          <h2 slot="heading">
            Change dataset access to Editor?
          </h2>

          <p>Editors can create, edit, and delete records and files.</p>
        </template>
        <template v-if="role === 'blind_reviewer'">
          <h2 slot="heading">
            Add Blind Reviewer User?
          </h2>

          <p>Are you sure you want to add this user?</p>
        </template>
      </template>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="close"
        >
          No
        </bf-button>
        <bf-button @click="$emit('confirm')">
          {{ btnSubmitCopy }}
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
  import { mapState } from 'vuex'
  import {
    pathOr
  } from 'ramda'

  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
  import BfButton from '../../../shared/bf-button/BfButton.vue'

  export default {
    name: 'ConfirmRoleDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton
    },

    props: {
      visible: {
        type: Boolean,
        default: false
      },
      role: {
        type: String,
        default: ''
      },
      currentRole: {
        type: String,
        default: ''
      },
      entity: {
        type: String,
        default: ''
      },
      memberName: {
        type: String,
        default: ''
      }
    },

    computed: {
      ...mapState([
        'dataset'
      ]),

      /**
       * Compute dataset's name
       * @returns {String}
       */
      datasetName: function() {
        return pathOr('Dataset', ['content', 'name'], this.dataset)
      },

      /**
       * Compute submit button copy
       * based on the new role
       * @returns {String}
       */
      btnSubmitCopy: function() {
        return this.role === 'owner'
          ? 'Change Owner'
          : 'Yes'
      },

      /**
       * Compute copy for the entity
       * @returns {String}
       */
      entityCopy: function() {
        return this.entity === 'organizations' || this.entity === 'teams' ?
          'These users' :
          'This user'
      }
    },

    methods: {
      /**
       * Emit event to update the synced property
       */
      close: function() {
        this.$emit('update:visible', false)
      }
    }
  }
</script>

<style scoped>

</style>
