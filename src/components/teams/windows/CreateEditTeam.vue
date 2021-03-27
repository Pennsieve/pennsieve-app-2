<template>
  <el-dialog
    :show-close="false"
    :visible.sync="dialogVisible"
    @open="autoFocus"
    @close="resetForm('teamForm')"
  >
    <bf-dialog-header
      slot="title"
      :title="modalTitle"
    />

    <dialog-body>
      <el-form
        ref="teamForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="createEditTeam('teamForm')"
      >
        <el-form-item
          label="Team Name"
          prop="name"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input
              v-model="ruleForm.name"
              autofocus
            />
          </a11y-keys>
        </el-form-item>
      </el-form>
    </dialog-body>

    <span
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
        class="primary"
        @click="createEditTeam('teamForm')"
      >
        <span v-if="!isEditing">
          Create
        </span>
        <span v-if="isEditing">
          Save
        </span>
      </bf-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import A11yKeys from '../../shared/a11y-keys/A11yKeys.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import Request from  '../../../mixins/request'
import AutoFocus from '../../../mixins/auto-focus'
import EventBus from '../../../utils/event-bus'
import { propOr, path, pathOr, pathEq } from 'ramda'

export default {
  name: 'CreateEditTeam',

  components: {
    BfButton,
    A11yKeys,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    Request,
    AutoFocus
  ],

  computed: {
    ...mapGetters([,
      'activeOrganization',
      'userToken',
      'config',
      'teams'
    ])
  },

  props: {
    team: {
      type: Object,
      default: function() {
        /* istanbul ignore next */
        return {}
      }
    }
  },

  data() {
    /* istanbul ignore next */
    const checkForUniqueness = (rule, value, callback) => {
      if (value.length === 0) {
        return callback('Team name is required')
      } else if (this.teamNameExists(value)) {
        return callback('Team names must be unique')
      }
      return callback()
    }
    return {
      modalTitle: 'Create team',
      isEditing: false,
      dialogVisible: false,
      ruleForm: {
        name: ''
      },
      rules: {
        name: [
          { validator: checkForUniqueness, trigger: 'false' }
        ]
      }
    }
  },

  mounted() {
    EventBus.$on('open-create-team', this.onOpenTeam.bind(this))
    EventBus.$on('open-edit-team', this.onOpenTeam.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('open-create-team', this.onOpenTeam.bind(this))
    EventBus.$off('open-edit-team', this.onOpenTeam.bind(this))
  },

  methods: {
    /**
     * Handles key-pressed event
     * @param {Object} evt
     */
    onHandleKeyPressed: function(evt) {
      evt.preventDefault()
      this.createEditTeam('teamForm')
    },
    /**
     * Handles open-edit-team and open-create-team events
     * @param {Object} team
     */
    onOpenTeam: function(team) {
      this.dialogVisible = true

      const teamName = pathOr('', ['team', 'name'], team)
      if (teamName.length > 0) {
        this.isEditing = true
        this.modalTitle = 'Update team'
        this.ruleForm.name = teamName
      }
    },
    /**
     * Verifies that team name is unique
     * @param {String} name
     * @returns {Boolean}
     */
    teamNameExists: function(name) {
      const existingTeams = this.teams.filter(pathEq(['team', 'name'], name))
      return existingTeams.length > 0
    },
    /**
     * Create a team url
     * @param {String} method
     * @returns {String}
     */
    createUrl: function(method) {
      const teamId = method === 'PUT' ? `/${this.team.team.id}` : ''
      return `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}/teams${teamId}?api_key=${this.userToken}`
    },
    /**
     * Closes remove member dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    },
    /**
     * Makes XHR call to create/edit a team
     */
    createEditTeam: function(formName) {
      const teamName = path(['team', 'name'], this.team)
      this.$refs[formName].validate(valid => {
        if (!valid) {
          return
        } else if (this.ruleForm.name === teamName) {
          return this.closeDialog()
        }
        this.submitRequest()
      })
    },
    /**
     * Makes XHR call to create a team
     */
    submitRequest: function() {
      const method = this.team.team ? 'PUT' : 'POST'
      const msg = method === 'PUT' ? 'updated' : 'created'
      const url = this.createUrl(method)
      const teamId = pathOr(0, ['team', 'id'], this.team)
      this.sendXhr(url, {
        method,
        body: {
          name: this.ruleForm.name
        }
      })
      .then(team => {
        const responseId = path(['team', 'id'], team)
        const updatedTeam = {
          team: {
            id: method === 'PUT' ? teamId : responseId,
            name: this.ruleForm.name
          }
        }
        this.$emit(`team-${msg}`, updatedTeam)
        EventBus.$emit('toast', {
          detail: {
            type: 'MESSAGE',
            msg: `${this.ruleForm.name} ${msg}`
          }
        })
        this.closeDialog()
      })
      .catch(this.handleXhrError.bind(this))
    },
    /**
     * Resets form fields and validations
     * @param {String} formName
     */
    resetForm: function(formName) {
      this.$refs[formName].resetFields()
    },
  }
}
</script>
