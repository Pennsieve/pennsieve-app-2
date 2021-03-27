<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Add a dataset reference"
    />
    <dialog-body>
      <p class="info-blurb">
        List references to other items that are associated with this dataset
        (e.g Publications, Protocols, and Other Datasets).
      </p>
      <div>
        <el-form
          ref="referenceForm"
          :model="ruleForm"
          :rules="rules"
        >
          <el-form-item prop="doi">
            <el-input
              ref="inputDOI"
              v-model="ruleForm.doi"
              class="mb-8 doi-input"
              placeholder="Enter a DOI to add citation"
              :disabled="datasetLocked"
              @blur="previewCitation"
            >
              <svg-icon
                slot="prefix"
                name="icon-document"
                height="20"
                width="20"
                color="#000"
              />
            </el-input>
            <div
              v-if="notFound"
              class="not-found"
            >
              <p class="doi-wrap-item__content--unavailable-doi">
                {{ ruleForm.doi }}
              </p>
              <p class="doi-wrap-item__content--error-message">
                {{ doi }}
                <a
                  href="#"
                  @click.prevent="previewCitation"
                >
                  <svg-icon
                    name="icon-try-again"
                    height="20"
                    width="20"
                    color="E94B4B"
                  />
                  Try Again
                </a>
              </p>
            </div>
            <div
              v-else
              class="citation"
            >
              <span v-html="$sanitize(doi.citation, ['i', 'b'])" />
              <a
                :href="doi.doiUrl"
                target="blank"
              >
                {{ doi.doiUrl }}
              </a>
            </div>
            <p
              v-if="hasError"
              class="error"
            >
              Sorry, an error has occurred. Please try again.
            </p>
            <p
              v-if="invalidDOI"
              class="error"
            >
              The input is not a valid DOI.
            </p>
          </el-form-item>
          <el-form-item prop="reference">
            <el-select
              v-model="ruleForm.reference"
              placeholder="Select a reference type"
              class="reference-select"
            >
              <el-option
                v-for="item in referenceTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </dialog-body>
    <div slot="footer">
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        class="primary"
        @click="onAdd()"
      >
        Add Reference
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { propEq, propOr, find } from 'ramda'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader'
import BfButton from '@/components/shared/bf-button/BfButton'
import DialogBody from '@/components/shared/dialog-body/DialogBody'
import Request from '@/mixins/request/index'
import { referenceTypeOptions } from '@/utils/constants'
export default {
  name: 'ReferenceTypesDialog',
  components: {
    BfDialogHeader,
    BfButton,
    DialogBody
  },
  mixins: [Request],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputDOI: '',
      notFound: false,
      invalidDOI: false,
      hasError: false,
      isLoading: false,
      doi: '',
      referenceTypeOptions,
      referenceTypeValue: '',
      ruleForm: {
        doi: '',
        reference: ''
      },
      rules: {
        doi: [{ required: true, message: 'Required', trigger: 'blur' }],
        reference: [{ required: true, message: 'Required', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters(['datasetLocked']),
    ...mapState(['userToken', 'config']),

    /**
     * Preview citation url
     * @returns {String}
     */
    previewCitationUrl: function() {
      return `${this.config.apiUrl}/datasets/external-publications/citation?doi=${this.ruleForm.doi}`
    }
  },
  methods: {
    /**
     * Trigger add functionality after checking form
     */
    onAdd: function() {
      this.$refs['referenceForm'].validate(valid => {
        if (valid) {
          this.addNewReference()
        }
      })
    },

    /**
     * Adds new reference
     */
    addNewReference: function() {
      if (!this.notFound && !this.hasError && !this.invalidDOI) {
        const relationship = find(
          propEq('value', this.ruleForm.reference),
          this.referenceTypeOptions
        )
        const relationshipTypeLabel = propOr('', 'label', relationship)
        const relationshipTypeValue = propOr('', 'value', relationship)
        this.$emit(
          'add-reference',
          this.ruleForm.doi,
          relationshipTypeLabel,
          relationshipTypeValue
        )
        this.closeDialog()
      }
    },

    /**
     * Closes dialog
     */
    closeDialog: function() {
      this.resetForm()
      this.doi = ''
      this.invalidDOI = ''
      this.notFound = false
      this.$emit('update:visible', false)
    },

    /**
     * Resets form
     */
    resetForm: function() {
      this.$refs['referenceForm'].resetFields()
    },

    /**
     * Previews DOI citation that will be added to dataset
     */
    previewCitation: function() {
      this.hasError = false
      this.invalidDOI = false
      this.notFound = false
      this.isLoading = true
      this.doi = ''
      let url = ''
      if (this.ruleForm.doi !== '') {
        url = this.previewCitationUrl + `&api_key=${this.userToken}`

        this.sendXhr(url)
          .then(response => {
            this.isLoading = false
            this.doi = this.formatResponse(response)
          })
          .catch(err => {
            if (err.status === 400) {
              this.invalidDOI = true
            } else if (err.status === 404) {
              this.notFound = true
              this.doi = 'Citation information for this DOI is not yet available'
            }
            else {
              this.hasError = true
              this.invalidDOI = false
            }
            this.isLoading = false
          })
      }
    },

    /**
     * Formats citation response
     * @param {Object} response
     * @returns {Object}
     */
    formatResponse: function(response) {
      let citation = response.citation
      const index = response.citation.indexOf('https')
      const doiUrl = index
        ? response.citation.substring(index, response.length)
        : ''

      // this is added to remove the url from the response
      // so that the url that is added to the list could be properly hyperlinked
      citation = citation.replace(doiUrl, '')
      return {
        citation,
        doiUrl
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
.info-blurb {
  margin-bottom: 21px;
  color: #000;
}

.reference-select {
  width: 100%;
}

.error {
  color: $error-color;
  margin-top: -11px;
}

.citation {
  font-size: 12px;
  color: #000;
  line-height: 18px;
}

.doi-wrap-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  &__content {
    display: flex;
    flex-direction: row;
    &--error-message {
      color: $synapse;
      margin-top: -10px;
      margin-bottom: -12px;
      a {
        color: $synapse;
        text-decoration: underline;
      }
      .svg-icon {
        margin-top: 0;
        text-decoration: none;
      }
    }
    &--unavailable-doi {
      font-weight: 500;
      line-height: 16px;
      margin-bottom: 7px;
    }
  }
}
</style>
