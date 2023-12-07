<template>
  <div
    class="bf-upload"
    @dragenter="setIsDragging(true)"
    @dragover.prevent="setIsDragging(true)"
    @dragleave="setIsDragging(false)"
    @drop.prevent="onDrop"
  >
    <bf-dialog
      :title="dialogTitle"
      :open="isOpen"
      @close="onClose"
      @overlay-click="onOverlayClick"
    >
      <div slot="body" class="bf-upload-body" @dragenter="setIsDragging(true)">
        <template v-if="isAddingFiles">
          <div
            v-if="!errorPreflight"
            ref="bfUpload"
            class="bf-upload-dropzone"
            :class="[
              isDragging ? 'is-dragging' : '',
              hasItems(fileList) ? 'condensed' : ''
            ]"
          >
            <div class="dropzone-content upload-content">
              <div class="upload-icons-wrap">
                <img
                  class="svg-icon icon-item pdf icon-upload-extra outside"
                  :src="fileIcon('PDF', 'PDF')"
                />

                <img
                  class="svg-icon icon-item timeseries icon-upload-extra outside"
                  :src="fileIcon('Timeseries', 'TimeSeries')"
                />

                <iron-icon class="icon-upload" icon="blackfynn:icon-upload" />

                <img
                  class="svg-icon icon-item image icon-upload-extra outside"
                  :src="fileIcon('Image', 'Image')"
                />

                <img
                  class="svg-icon icon-item slide icon-upload-extra outside"
                  :src="fileIcon('Microscope', 'Slide')"
                />
              </div>
              <h3>
                Drag and drop files here or
                <a href="#" @click.prevent="triggerInputFile">
                  choose your files
                </a>
                .
              </h3>
              <p v-if="!hasItems(fileList)">
                If you're uploading large amounts of data, please use the
                <a href="https://docs.pennsieve.io/" target="_blank">
                  Pennsieve API
                </a>
                .
              </p>
            </div>

            <input
              ref="inputFile"
              class="visuallyhidden"
              type="file"
              multiple="multiple"
              @change="onInputFileChange"
            />
          </div>

          <div v-if="showWarnings" class="bf-upload-warning-wrap">
            <p v-if="hasWarnings">
              We've detected some errors. Continuing may affect your ability to
              use built-in viewers for some data.
            </p>
          </div>

          <div
            v-if="
              (hasItems(fileList) || hasItems(packageList)) && !errorPreflight
            "
            ref="packageWrap"
            class="bf-upload-packages-wrap"
            :class="[hasWarnings ? 'has-warnings' : '']"
          >
            <div v-if="hasWarnings" class="warning-packages-wrap">
              <bf-upload-package
                v-for="item in warningPackages"
                :key="item.uploadId"
                :item="item"
                :name="item.packageName"
                :show-path="true"
                @remove-package="removePackage"
                @toggle-files="checkOverflow($refs.packageWrap)"
              />
            </div>

            <div class="good-packages-wrap">
              <bf-upload-package
                v-for="item in goodPackages"
                :key="item.uploadId"
                :item="item"
                :name="item.packageName"
                :is-uploaded="item.isUploaded"
                :show-path="true"
                @remove-package="removePackage"
                @toggle-files="checkOverflow($refs.packageWrap)"
              />

              <bf-upload-package
                v-for="file in filesProcessing"
                :key="file.uploadId"
                :item="file"
                :name="file.fileName"
                :processing="file.processing"
                :show-path="true"
                @remove-package="removePackage"
                @toggle-files="checkOverflow($refs.packageWrap)"
              />
            </div>
          </div>

          <div class="uploading-info" :class="showInfo ? 'show-info' : ''">
            <div class="uploading-info-copy">
              <h2>Uploading to Pennsieve</h2>
              <p>
                When you upload certain types of data, we attempt to combine
                them into
                <strong>Packages</strong>
                . Packages allow you to use our interactive viewers to playback,
                zoom, annotate and discuss directly on your data. If we can’t
                determine how to process your data, we’ll upload your file in a
                generic format.
              </p>

              <div class="uploading-info-actions">
                <bf-button class="secondary" @click="dismissInfo">
                  Got it
                </bf-button>
                <p>
                  <a
                    href="https://docs.pennsieve.io/docs/supported-file-formats"
                    target="_blank"
                  >
                    Learn More About Packages
                  </a>
                </p>
              </div>
            </div>
            <div class="uploading-info-image">
              <img
                src="/static/images/illustrations/illo-data-management.svg"
                alt="packages illustration"
              />
            </div>
          </div>

          <div v-if="errorPreflight" class="uploading-error upload-content">
            <div>
              <iron-icon icon="blackfynn:warning-circle" />
              <h3>
                {{
                  errorPreflight === 'error'
                    ? 'File processing has failed'
                    : 'Experiencing Heavy Traffic'
                }}
              </h3>
              <p>
                {{
                  errorPreflight === 'error'
                    ? 'We had a problem attempting to process your files. There is either a problem with your Internet connection or our servers aren’t responding. You can retry or cancel your upload.'
                    : `We're experiencing heavy traffic and cannot complete the upload request at this time.  Please try again later or cancel your upload.`
                }}
              </p>
              <div>
                <bf-button class="secondary" @click="cancelQueue">
                  Cancel
                </bf-button>
                <bf-button class="upload-retry" @click="retryGetPackages">
                  Retry
                </bf-button>
              </div>
            </div>
            <a class="contact-us" href="#">Need help? Contact Us</a>
          </div>
        </template>

        <template v-if="!isAddingFiles">
          <div ref="uploadWrap" class="bf-upload-packages-wrap">
            <bf-upload-package
              v-for="item in uploadList"
              :key="item.uploadId"
              :item="item"
              :name="item.packageName"
              :submitted="true"
              :is-uploaded="item.isUploaded"
              :has-error="item.error"
              @remove-package="cancelPackageUpload"
              @toggle-files="checkOverflow($refs.uploadWrap)"
            />
          </div>
        </template>
      </div>

      <template v-if="isAddingFiles && !errorPreflight" slot="footer">
        <bf-button class="secondary" @click="cancelQueue">Cancel</bf-button>
        <bf-button :disabled="packageList.length === 0" @click="startUpload">
          Start Upload
        </bf-button>
      </template>

      <template v-if="!isAddingFiles && !errorPreflight" slot="footer">
        <bf-button class="secondary" @click="onClose">Hide</bf-button>
        <bf-button @click="uploadMoreFiles">Upload More Files</bf-button>
      </template>
    </bf-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import qq from 'fine-uploader/lib/core'
import { mapActions, mapGetters, mapState } from 'vuex'
import BfButton from '../shared/bf-button/BfButton.vue'
import BfDialog from '../shared/bf-dialog/bf-dialog.vue'
import BfUploadPackage from './bf-upload-package/bf-upload-package.vue'
import CheckOverflow from '../../mixins/check-overflow/index'
import Sorter from '../../mixins/sorter'
import Request from '../../mixins/request'
import FileIcon from '../../mixins/file-icon'
import debounce from 'lodash/debounce'
import uuidv1 from 'uuid/v1'
import {
  compose,
  defaultTo,
  equals,
  filter,
  find,
  findIndex,
  init,
  pathOr,
  pluck,
  prop,
  propEq,
  propOr,
  split,
  sum
} from 'ramda'
import EventBus from '../../utils/event-bus'
import { fetchRetry } from '../../typescript/lib/fetch-retry'

const transformPath = compose(
  init,
  filter(i => i),
  split('/')
)

export default {
  name: 'BfUpload',

  components: {
    BfButton,
    BfDialog,
    BfUploadPackage
  },

  mixins: [Sorter, CheckOverflow, Request, FileIcon],

  data: function() {
    return {
      isOpen: false,
      isDragging: false,
      showInfo: false,
      droppedFiles: [],
      uploader: {},
      fileList: [],
      packageList: [],
      uploadList: [],
      errorPreflight: '',
      shouldUpload: true,
      isAddingFiles: true,
      packageListBorders: false,
      recordId: '',
      uploadListId: -1 // start at -1 because this is incremented for every file added
    }
  },

  computed: {
    ...mapGetters(['config', 'userToken', 'uploadDestination']),
    ...mapState(['onboardingEvents', 'activeOrganization', 'dataset']),

    /**
     * Compute dialog title based on isAddingFiles
     * @returns {string}
     */
    dialogTitle: function() {
      return this.isAddingFiles ? 'Add Files to Upload' : 'File Upload Status'
    },

    /**
     * Compute files that are being processed
     * @returns {Array}
     */
    filesProcessing: function() {
      return filter(propEq('processing', true), this.fileList)
    },

    /**
     * Compute if there are warning/error meessages to show
     * @returns {Boolean}
     */
    showWarnings: function() {
      return this.hasWarnings
    },

    /**
     * Compute if any of the queued packages have warnings
     * @returns {Boolean}
     */
    hasWarnings: function() {
      return this.warningPackages.length > 0
    },

    /**
     * Compute packages that have warnings
     * @returns {Array}
     */
    warningPackages: function() {
      return this.packageList.filter(item => {
        return item.warnings.length
      })
    },

    /**
     * Compute packages that do not have warnings
     * @returns {Array}
     */
    goodPackages: function() {
      return this.packageList.filter(item => {
        return item.warnings.length === 0
      })
    },

    onboardingEventsUrl() {
      const apiUrl = propOr('', 'apiUrl', this.config)
      if (apiUrl && this.userToken) {
        return `${apiUrl}/onboarding/events?api_key=${this.userToken}`
      }
    }
  },

  watch: {
    fileList: function(newFileList, oldFileList) {
      // Only get package preview if adding a file to the list
      if (newFileList.length > oldFileList.length) {
        // Show onboarding info if first time
        const hasSeenInfo = localStorage.getItem('seen-upload-info')
        if (!hasSeenInfo) {
          this.showInfo = true
        }

        this.getPackages()
      }

      this.checkOverflow(this.$refs.packageWrap)
    },

    packageList: function() {
      this.checkOverflow(this.$refs.packageWrap)
    },

    uploadList: function() {
      this.checkOverflow(this.$refs.uploadWrap)
    },

    isOpen: function() {
      // Look at the conceptId & instanceId query params and update locate state
      const modelId = pathOr('', ['params', 'conceptId'])(this.$route)
      const recordId = pathOr('', ['params', 'instanceId'])(this.$route)

      if (modelId && recordId) {
        this.modelId = modelId
        this.recordId = recordId
      }
    }
  },

  methods: {
    ...mapActions(['updateOnboardingEvents']),

    /**
     * Compute if array has items
     */
    hasItems: function(list) {
      return list && list.length > 0 ? true : false
    },

    /**
     * Set is dragging property if the user is adding files
     * @param {Boolean} isDragging
     */
    setIsDragging: function(isDragging) {
      if (this.isAddingFiles) {
        this.isDragging = isDragging
      }
    },

    /**
     * Dismiss onboarding info
     */
    dismissInfo: function() {
      this.showInfo = false
      localStorage.setItem('seen-upload-info', true)
    },

    /**
     * Cancel queueing files for upload
     */
    cancelQueue: function() {
      this.uploader.clearStoredFiles()
      this.resetQueue()
      this.onClose()
    },

    /**
     * Close dialog callback
     */
    onClose: function() {
      this.isOpen = false
      this.errorPreflight = ''
      this.showInfo = false
      this.modelId = ''
      this.recordId = ''
      this.clearUploadedFiles()
    },

    onOverlayClick: function() {
      if (this.isAddingFiles) {
        this.cancelQueue()
      } else {
        this.onClose()
      }
    },

    /**
     * Trigger input file click
     */
    triggerInputFile: function() {
      this.$refs.inputFile.click()
    },

    /**
     * Callback when file input has changed
     * @param {Object} Event
     */
    onInputFileChange: function(e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files || !files.length) {
        return
      }

      this.transformFiles(Array.from(files))

      // Reset file input
      this.$refs.inputFile.value = ''
    },

    onDrop: function(e) {
      if (this.isAddingFiles) {
        this.handleDataTransfer(e.dataTransfer || e.target).then(() => {
          this.transformFiles(this.droppedFiles)

          // Reset droppedFiles
          this.droppedFiles = []

          // Reset isDragging state
          this.isDragging = false
        })
      }
    },

    transformFiles: function(files) {
      const fileList = files.map((file, index) => {
        const uploadId = (this.uploadListId += 1)

        file.uploadId = uploadId

        return {
          uploadId,
          fileName: file.name,
          size: file.size,
          filePath: file.filePath,
          importId: index + uuidv1(),
          processing: true,
          file
        }
      })

      this.fileList = [...this.fileList, ...fileList]
    },

    /**
     * Traverse file tree to get all files in directories
     * @param {Object} entry
     * @returns {Promise}
     */
    traverseFileTree: function(entry) {
      const parseEntryPromise = new qq.Promise()
      if (entry.isFile) {
        entry.file(
          file => {
            file.filePath = transformPath(entry.fullPath)
            this.droppedFiles.push(file)
            parseEntryPromise.success()
          },
          fileError => {
            parseEntryPromise.failure()
          }
        )
      } else if (entry.isDirectory) {
        this.getFilesInDirectory(entry).then(
          entries => {
            let entriesLeft = entries.length
            qq.each(entries, (idx, entry) => {
              this.traverseFileTree(entry).done(() => {
                entriesLeft -= 1
                if (entriesLeft === 0) {
                  parseEntryPromise.success()
                }
              })
            })
            if (!entries.length) {
              parseEntryPromise.success()
            }
          },
          fileError => {
            parseEntryPromise.failure()
          }
        )
      }
      return parseEntryPromise
    },

    /**
     * Get files in directory
     * @param {Object} entry
     * @param {Object} reader
     * @param {Array} accumEntries
     * @param {Promise} existingPromise
     * @returns {Promise}
     */
    getFilesInDirectory: function(
      entry,
      reader,
      accumEntries,
      existingPromise
    ) {
      const promise = existingPromise || new qq.Promise()
      const dirReader = reader || entry.createReader()
      dirReader.readEntries(entries => {
        const newEntries = accumEntries ? accumEntries.concat(entries) : entries
        if (entries.length) {
          setTimeout(() => {
            this.getFilesInDirectory(entry, dirReader, newEntries, promise)
          }, 0)
        } else {
          promise.success(newEntries)
        }
      }, promise.failure)
      return promise
    },

    /**
     * Get files from dropped items
     * @param {Array} dataTransfer
     * @returns {Promise}
     */
    handleDataTransfer: function(dataTransfer) {
      const pendingFolderPromises = []
      const handleDataTransferPromise = new qq.Promise()

      this.droppedFiles = []

      if (qq.isFolderDropSupported(dataTransfer)) {
        qq.each(dataTransfer.items, (idx, item) => {
          const entry = item.webkitGetAsEntry()
          if (entry) {
            if (entry.isFile) {
              this.droppedFiles.push(item.getAsFile())
            } else {
              pendingFolderPromises.push(
                this.traverseFileTree(entry).done(() => {
                  pendingFolderPromises.pop()
                  if (pendingFolderPromises.length === 0) {
                    handleDataTransferPromise.success()
                  }
                })
              )
            }
          }
        })
      } else {
        this.droppedFiles = dataTransfer.files
      }

      if (pendingFolderPromises.length === 0) {
        handleDataTransferPromise.success()
      }

      return handleDataTransferPromise
    },

    /**
     * Remove package
     * @param {Object} item
     */
    removePackage: function(item) {
      // Remove from packageList
      const index = this.packageList.indexOf(item)
      this.packageList.splice(index, 1)

      // Remove from fileList
      item.files.forEach(file => {
        const index = findIndex(
          propEq('uploadId', file.uploadId),
          this.fileList
        )
        this.fileList.splice(index, 1)
      })
    },

    /**
     * Get fine uploader ID by uploadId
     * @param {Object} file
     * @param {Array} list
     * @returns {Number}
     */
    getFineUploaderId: (file, list) =>
      compose(
        prop('id'),
        defaultTo({}),
        find(propEq('uploadId', file.uploadId))
      )(list),

    /**
     * Cancel package upload
     * @param {Object} item
     */
    cancelPackageUpload: function(item) {
      const uploads = this.uploader.getUploads()
      const files = propOr([], 'files', item)
      files.forEach(file => {
        const uploadId = this.getFineUploaderId(file, uploads)
        this.uploader.cancel(uploadId)
      })
    },

    /**
     * Retry get packages
     */
    retryGetPackages: function() {
      this.errorPreflight = ''
      this.getPackages()
    },

    /**
     * Get packages based off of files
     * @param {Array} fileList
     */
    getPackages: debounce(function() {
      /*
       * Add dataset ID and destination ID as query params
       * The endpoint will use this for lookups and package verification
       */
      const datasetId = pathOr('', ['content', 'intId'], this.dataset)
      let dataParams = `append=false&dataset_id=${datasetId}`

      // If uploading to a collection
      if (this.uploadDestination.packageType !== 'DataSet') {
        const destinationId = propOr('', 'id', this.uploadDestination)
        dataParams += `&destinationId=${destinationId}`
      }

      const organizationId = pathOr(
        '',
        ['organization', 'id'],
        this.activeOrganization
      )
      this.sendXhr(
        `${
          this.config.apiUrl
        }/upload/preview/organizations/${organizationId}?${dataParams}`,
        {
          method: 'POST',
          header: {
            Authorization: `bearer ${this.userToken}`
          },
          body: {
            files: this.fileList
          }
        }
      )
        .then(this.onGetPackages.bind(this))
        .catch(this._handleGetPackagesError.bind(this))
    }, 500),

    /**
     * Callback on get package preview from API
     * @param {Object} response
     */
    onGetPackages: function(response) {
      let packages = response.packages

      // Loop through response and set each file's processing prop to false
      packages.forEach((item, itemIndex) => {
        item.files.forEach((file, index) => {
          const fileListItem = find(
            propEq('uploadId', file.uploadId),
            this.fileList
          )
          fileListItem.processing = false
          fileListItem.isUploaded = false
          fileListItem.file.importId = item.importId
          fileListItem.file.chunkedUpload = file.chunkedUpload

          // Add package ID to file for lookup
          file.importId = item.importId
        })
      })
      this.packageList = this.returnSort('previewPath', packages, 'asc')
    },

    /**
     * Error getting packages
     * @param {Object} response
     */
    _handleGetPackagesError: function(response) {
      if (response.status === 401) {
        EventBus.$emit('logout')
      } else {
        this.errorPreflight = response.status === 429 ? 'throttle' : 'error'
      }
    },

    /**
     * Start uploading stored files
     */
    startUpload: function() {
      // Add files to fine uploader
      this.uploader.addFiles(pluck('file', this.fileList))

      // Add to uploadList
      const packageList = this.packageList.slice()
      packageList.forEach(thePackage => {
        thePackage.uploadDestination = this.uploadDestination
        // Set recordId and modelId properties on the package
        if (this.modelId && this.recordId) {
          thePackage.recordId = this.recordId
          thePackage.modelId = this.modelId
        }
      })

      this.uploadList.push(...packageList)

      this.uploader.setCustomHeaders({
        Authorization: `bearer ${this.userToken}`
      })

      // Get credentials to upload for queued files
      // this.getCreds()

      // Set shouldUpload flag to start upload when credentials are received
      // this.shouldUpload = true

      this.uploader.uploadStoredFiles()

      // Set uploading state
      this.$store.dispatch('updateUploadStatus', true)

      // Add file size
      const totalSize = sum(pluck('groupSize', packageList))
      this.$store.dispatch('updateUploadRemainingAdd', totalSize)
      this.$store.dispatch('updateTotalUploadSize', totalSize)

      // Add file count
      this.$store.dispatch('uploadCountAdd', this.fileList.length)

      // Reset the queue
      this.resetQueue()

      // Change view to upload status
      this.isAddingFiles = false

      // Clear recordId state
      this.recordId = ''
    },

    /**
     * Reset upload queue
     */
    resetQueue: function() {
      this.fileList = []
      this.packageList = []
      this.errorPreflight = ''
    },

    /**
     * Set state to upload queue to allow user to upload more files
     */
    uploadMoreFiles: function() {
      this.isAddingFiles = true
    },

    /**
     * Clear out packages that have been uploaded and hide bf-upload-info
     */
    clearUploadedFiles: function() {
      this.packageList = this.packageList.filter(item => !item.isUploaded)
      this.uploadList = this.uploadList.filter(item => !item.isUploaded)
      if (this.uploadList.length === 0) {
        this.isAddingFiles = true
        EventBus.$emit('dismiss-upload-info')
      } else {
        this.isAddingFiles = false
      }
    },

    /**
     * Get uploadList file based off of file ID
     * @param {number} id
     * @returns {Object}
     */
    getUploadListFile: function(id) {
      const file = this.uploader.getFile(id)
      const thePackage = find(
        propEq('importId', file.importId),
        this.uploadList
      )
      const filesArray = propOr([], 'files', thePackage)

      return find(propEq('uploadId', file.uploadId), filesArray)
    },

    /**
     * Set error state for package
     * @param {number} packageIndex
     */
    _onPackageCompleteError: function(packageIndex) {
      const updatedItem = pathOr({}, [packageIndex], this.uploadList)
      updatedItem.error = true
      this.uploadList.splice(packageIndex, 1, updatedItem)
    },

    /**
     * Add files to queue
     * @param {Array} files
     */
    addFilesToQueue: function(files) {
      this.uploader.addFiles(files)
    },

    /**
     * Sends onboarding event
     */
    sendOnboardingEventsRequest: function() {
      if (this.onboardingEventsUrl) {
        this.sendXhr(this.onboardingEventsUrl, {
          method: 'POST',
          body: 'AddedFile',
          header: {
            Authorization: `bearer ${this.userToken}`
          }
        })
          .then(response => {
            const onboardingEvents = [...this.onboardingEvents, 'AddedFile']
            this.updateOnboardingEvents(onboardingEvents)
          })
          .catch(this.handleXhrError.bind(this))
      }
    },

    /**
     * Update files list when a file has completed uploading
     * @params {Array}
     */
    updateFilesList: function(response) {
      response.forEach(item => {
        // add package dto to each item in uploadList
        const uploadListPkg = find(
          propEq('importId', item.manifest.importId),
          this.uploadList
        )

        // Add file to files list if uploading to current collection
        const packageDTO =
          uploadListPkg.previewPath === null
            ? propOr({}, 'package', item)
            : pathOr({}, ['package', 'parent'], item)

        EventBus.$emit('add-uploaded-file', {
          packageDTO,
          uploadDestination: this.uploadDestination
        })

        uploadListPkg.package = item.package
      })
    }
  },

  mounted: function() {
    let customheaders = {}

    // Set header if userToken is available
    if (this.userToken) {
      customheaders = {
        Authentication: `bearer ${this.userToken}`
      }
    }

    this.uploader = new qq.FineUploaderBasic({
      element: this.$refs.bfUpload,
      button: this.$refs.btnUpload,
      autoUpload: false,

      request: {
        customheaders
      },

      validation: {
        allowEmpty: true
      },

      chunking: {
        enabled: true,
        /**
         * Set part size for each file
         * This is set per file, from data received by the preview endpoint
         * @param {Integer} id
         */
        partSize: id => {
          const file = this.uploader.getFile(id)
          const chunkSize = pathOr(200000, ['chunkedUpload', 'chunkSize'], file)
          return chunkSize
        },
        mandatory: true
      },

      retry: {
        enableAuto: true,
        maxAutoAttempts: 5
      },

      resume: {
        enabled: false
      },

      objectProperties: {
        key: id => {
          const file = this.uploader.getFile(id)
          const name = file.name
          const importId = file.importId

          return qq.format(
            '{}/{}',
            `${this.$store.state.profile.email}/${importId}`,
            name
          )
        },
        bucket: this.$store.state.config.bucketName
      },

      callbacks: {
        onUpload: id => {
          // Get file to get import ID
          const file = this.uploader.getFile(id)
          const importId = file.importId
          const organizationId = pathOr(
            '',
            ['organization', 'id'],
            this.activeOrganization
          )
          const uploadListFile = this.getUploadListFile(id)

          const multipartId = propOr('', 'multipartUploadId', uploadListFile)
          const endpoint = `${
            this.config.apiUrl
          }/upload/fineuploaderchunk/organizations/${organizationId}/id/${importId}?multipartId=${multipartId}`

          // Set endpoint for file
          this.uploader.setEndpoint(endpoint, id)

          Vue.set(uploadListFile, 'uploading', true)
        },

        onAllComplete: (succeeded, failed) => {
          this.$store.dispatch('updateUploadStatus', false)
        },

        /**
         * Callback when a file has completed uploading
         * @param {number} id
         */
        onComplete: (id, name, response) => {
          // Check if all files in a package, and let API know
          const file = this.uploader.getFile(id)
          const importId = prop('importId', file)

          // Check if all files in package are done
          const packageIndex = findIndex(
            propEq('importId', importId),
            this.uploadList
          )

          // If the response failed, show an error message for the file
          if (!response.success) {
            this._onPackageCompleteError(packageIndex)
            return
          }

          // Set uploading and complete properties
          const uploadListFile = this.getUploadListFile(id)
          Vue.set(uploadListFile, 'complete', true)
          Vue.set(uploadListFile, 'uploading', false)

          // Remove files count from state
          this.$store.dispatch('uploadCountRemove', 1)

          // Remove file size
          this.$store.dispatch('updateUploadRemainingRemove', file.size)

          if (uploadListFile && importId) {
            const packageGroup = this.uploadList[packageIndex]
            const completeFiles = filter(
              propEq('complete', true),
              packageGroup.files
            )
            const datasetId = propOr(
              prop('id', this.uploadDestination),
              'datasetId',
              this.uploadDestination
            )

            if (equals(completeFiles, packageGroup.files)) {
              let dataParams = `datasetId=${datasetId}`

              // If uploading to a collection
              if (packageGroup.uploadDestination.packageType !== 'DataSet') {
                dataParams += `&destinationId=${
                  packageGroup.uploadDestination.id
                }`
              }

              const options = {
                method: 'POST',
                headers: {
                  Authorization: `bearer ${this.userToken}`,
                  'X-SESSION-ID': this.userToken
                },
                retries: 3,
                retryDelay: 1000,
                retryBackoff: 2,
                retryOn: [429, 503]
              }

              // If adding a relationship to a record
              if (packageGroup.modelId && packageGroup.recordId) {
                options.body = {
                  conceptId: packageGroup.modelId,
                  instanceId: packageGroup.recordId,
                  targets: [
                    {
                      linkTarget: packageGroup.recordId,
                      relationshipType: 'belongs_to',
                      relationshipDirection: 'FromTarget'
                    }
                  ]
                }
              }

              // Send info to API
              const organizationId = pathOr(
                '',
                ['organization', 'id'],
                this.activeOrganization
              )
              fetchRetry(
                `${
                  this.config.apiUrl
                }/upload/complete/organizations/${organizationId}/id/${importId}?${dataParams}`,
                options
              )
                .then(response => response.json())
                .then(response => {
                  // update relationship table on record page
                  if (
                    packageGroup.modelId &&
                    packageGroup.recordId &&
                    packageGroup.recordId === this.$route.params.instanceId
                  ) {
                    EventBus.$emit('refresh-table-data', {
                      name: 'package',
                      displayName: 'Files',
                      count: 1,
                      type: 'Add'
                    })
                  }

                  this.packageList = this.packageList.map(item => {
                    if (item.importId === importId) {
                      item.isUploaded = true
                    }
                    return item
                  })

                  this.uploadList = this.uploadList.map(item => {
                    if (item.importId === importId) {
                      item.isUploaded = true
                    }
                    return item
                  })

                  // update files list
                  response.forEach(item => {
                    // add package dto to each item in uploadList
                    const uploadListPkg = find(
                      propEq('importId', item.manifest.importId),
                      this.uploadList
                    )

                    // Add file to files list
                    const packageDTO =
                      uploadListPkg.previewPath === null
                        ? propOr({}, 'package', item)
                        : pathOr({}, ['package', 'parent'], item)

                    EventBus.$emit('add-uploaded-file', {
                      packageDTO,
                      uploadDestination: this.uploadDestination
                    })

                    this.$set(uploadListPkg, 'package', item.package)
                  })

                  // check for onboarding event state for uploading a file
                  if (this.onboardingEvents.indexOf('AddedFile') === -1) {
                    // make post request
                    this.sendOnboardingEventsRequest()
                  }

                  // track file
                  EventBus.$emit('track-event', {
                    name: 'File Uploaded'
                  })
                })
                .catch(err => {
                  this._onPackageCompleteError(packageIndex)
                })
            }
          }
        },

        onProgress: (id, name, uploadedBytes, totalBytes) => {
          const uploadListFile = this.getUploadListFile(id)

          Vue.set(uploadListFile, 'totalUploaded', uploadedBytes)
        },

        /**
         * Callback when item has been canceled
         */
        onCancel: (id, name) => {
          if (this.isAddingFiles) {
            // Remove from fileList
            const index = findIndex(propEq('uploadId', id), this.fileList)
            this.fileList.splice(index, 1)
          } else {
            const uploadListFile = this.getUploadListFile(id)
            Vue.set(uploadListFile, 'canceled', true)

            const file = this.uploader.getFile(id)
            const packageIndex = findIndex(
              propEq('importId', file.importId),
              this.uploadList
            )
            const packageGroup = this.uploadList[packageIndex]

            const canceledFiles = filter(
              propEq('canceled', true),
              packageGroup.files
            )

            // If all files for the package have been canceled, remove package from uploadList
            if (equals(canceledFiles, packageGroup.files)) {
              this.uploadList.splice(packageIndex, 1)
            }
          }
        },

        onSubmit: (id, name) => {
          const file = this.uploader.getFile(id)
          const upload = this.uploader.getUploads({ id })
          upload.uploadId = file.uploadId
        }
      }
    })
  }
}
</script>

<style src="./BfUpload.scss" scoped lang="scss"></style>
<style lang="scss">
@import '../../assets/_variables.scss';
.bf-upload .bf-dialog .bf-dialog-wrap {
  height: 590px;
  margin: -295px 0 0 -350px;
  width: 700px;
}
</style>
