<template>
  <div class="dataset-settings-ignore-files">
    <h4>Ignore Files</h4>
    <p class="mb-16">
      The files listed below will be ignored during publication. Please use the entire source file name and extension. List one filename per line.
      <a
        href="https://help.blackfynn.com/en/articles/4284231"
        target="_blank"
      >
        What's this?
      </a>
    </p>
    <el-input
      v-model="ignoreFiles"
      type="textarea"
      :autosize="{ minRows: 5 }"
      placeholder="Input filenames to ignore e.g. file.txt"
      :disabled="datasetLocked"
      @input="submitIgnoreFilesRequest"
    />
  </div>
</template>

<script>
  import debounce from 'lodash/debounce'
  import { mapGetters, mapState, mapActions } from 'vuex'

  export default {
    name: 'DatasetSettingsIgnoreFiles',

    data() {
      return {
        ignoreFiles: ''
      }
    },

    computed: {
      ...mapState([
        'config',
        'dataset',
        'userToken',
        'datasetIgnoreFiles'
      ]),

      ...mapGetters(['datasetLocked']),

      /**
       * Create properly formatted ignore files DTO, is empty if
       * there are no ignore files
       * @returns {Array}
       */
      ignoreFilesDTO: function() {
        // Account for newlines with no filename
        return this.ignoreFiles ? this.toIgnoreFilesDTO((this.ignoreFiles.split('\n').filter(fileName => fileName.length))) : []
      },

      /**
       * Compute ignore-files endpoint url
       * @returns {String}
       */
      ignoreFilesUrl: function() {
        const datasetId = this.dataset.content.id || ''
        return `${this.config.apiUrl}/datasets/${datasetId}/ignore-files`
      }
    },

    mounted: function() {
      // Set current ignore files in text area
      this.ignoreFiles = this.datasetIgnoreFiles.map(file => file.fileName).join('\n')
    },

    methods: {
      ...mapActions(['setDatasetIgnoreFiles']),

      /**
       * Submit a request with the updated ignore files,
       * debounced to 1 second
       */
      submitIgnoreFilesRequest: debounce(function() {
        fetch(this.ignoreFilesUrl, {
          method: 'PUT',
          body: JSON.stringify(this.ignoreFilesDTO),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${this.userToken}`
          }
        })
        .then(response => {
          if (response.ok) {
            response.json().then(resp => {
              const ignoreFiles = (resp.ignoreFiles || []).map(file => file.fileName)
              this.ignoreFiles = ignoreFiles.join('\n')
              this.setDatasetIgnoreFiles(this.toIgnoreFilesDTO(ignoreFiles))
            })
          }
        }).catch(error => {this.handleXhrError(error)})
      }, 1000),

      /**
       * Convert array of ignore filenames to proper DTO in the shape
       * [{fileName: "file1.txt"}, {fileName: "file2.txt"}]
       * @param {Array}
       * @returns {Array}
       */
      toIgnoreFilesDTO: function(ignoreFiles) {
        return ignoreFiles.map(fileName => ({ fileName }))
      }
    }
  }
</script>

<style lang="scss" scoped>
p {
  color: #000;
}
</style>
