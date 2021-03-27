<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    @open="handleOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Create an API Key"
    />

    <dialog-body>
      <el-form
        ref="apiKeyForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="onFormSubmit"
      >
        <el-form-item
          label="API Key"
          prop="apiKey"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input
              v-model="ruleForm.apiKey"
              autofocus
            />
          </a11y-keys>
        </el-form-item>
        <div class="sub-title">
          Key names must be unique
        </div>
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
      <bf-button @click="onFormSubmit">
        Confirm
      </bf-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { path, pathOr, prop, compose, toLower, map, not, contains, indexOf, defaultTo } from 'ramda'

import A11yKeys from '../../shared/a11y-keys/A11yKeys.vue'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'

import Request from '../../../mixins/request'
import AutoFocus from '../../../mixins/auto-focus'
import EventBus from '../../../utils/event-bus'

export default {
  name: 'CreateApiKey',

  components: {
    A11yKeys,
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    AutoFocus,
    Request
  ],

  data() {
    const validateApiKey = (rule, value, callback) => {
      if (!value) {
        callback(new Error('Please provide an API key'))
      }

      const isUnique = this.checkUniqueName(this.apiKeys, ['name'], value, '')
      if (isUnique === false) {
        callback(new Error('Please provide unique API key'))
      } else {
        callback()
      }
    }

    return {
      dialogVisible: false,
      labelPosition: 'right',
      apiKeys: [],
      ruleForm: {
        apiKey: ''
      },
      rules: {
        apiKey: [
          { validator: validateApiKey, trigger: 'false' },
        ]
      }
    }
  },

  computed: {
    ...mapGetters([
      'profile',
      'activeOrganization',
      'userToken',
      'config'
    ]),
    apiKeyUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const userToken = prop('userToken', this)

      if (!url || !userToken) {
        return ''
      }
      return `${url}/token?api_key=${userToken}`
    }
  },

  methods: {
    ...mapActions([
      'updateProfile'
    ]),
    /**
     * Handles key-pressed event for last input in form
     */
    onHandleKeyPressed: function(e) {
      this.onFormSubmit(e)
    },
    /**
     * Handles submit event
     */
    onFormSubmit: function(e) {
      e.preventDefault()

      this.$refs.apiKeyForm
        .validate((valid) => {
          if (!valid) {
            return
          }
          this.sendRequest()
        })
    },
    /**
     * Makes XHR call to create api key
     */
    sendRequest: function() {
      this.sendXhr(this.apiKeyUrl, {
        method: 'POST',
        body: {
          name: this.ruleForm.apiKey
        }
      })
      .then(this.handleXhrSucces.bind(this))
      .catch(this.handleXhrError.bind(this))
    },
    /**
     * Handles successful two factor xhr response
     * @param {Object} response
     */
    handleXhrSucces: function(response) {
      this.closeDialog()

      EventBus.$emit('toast', {
        detail: {
          type: 'MESSAGE',
          msg: 'API key successfully added'
        }
      })
      this.$emit('api-key-created', { apiKey: response, type: 'CREATED' })
    },
    /**
     * Resets form fields and validations
     */
    handleOpen: function() {
      this.labelPosition = 'right'
      this.apiKeys = []
      this.autoFocus()
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.$refs.apiKeyForm.resetFields()
    },
    /**
     * Gets all items from an array by path and returns as lowercase string
     * @param {Array} path
     * @return {Array}
     */
    getItemsLower: (p) => compose(
      toLower(),
      path(p),
      defaultTo([])
    ),
    /**
     * Checks if items in an array are unique compared to the input
     * @param {Array} list
     * @param {Array} path
     * @param {string} name
     * @param {string} exclude
     * @return {Boolean}
     */
    checkUniqueName: function(list, p, name, exclude) {
      let filteredNames = map(this.getItemsLower(p), list);

      // Remove name from list if excluding
      if(exclude) {
        const index = indexOf(toLower(exclude), filteredNames);
        if(index >= 0) {
          filteredNames.splice(index, 1);
        }
      }

      return not(contains(toLower(name), filteredNames));
    }
  }
}
</script>
