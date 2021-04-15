<template>
  <transition name="dialog-fade">
    <div class="bf-upload-info">
      <div
        v-if="uploadRemaining"
        class="copy"
      >
        <strong>Uploading {{ uploadCopy }}</strong>

        <bf-progress-bar
          :loaded="loaded"
          :total="totalUploadSize"
        />
      </div>
      <div
        v-else
        class="copy"
      >
        {{ uploadCopy }}
      </div>
      <div class="upload-details">
        <button
          class="show-details"
          @click="showUpload"
        >
          Show details
        </button>
        <div v-if="uploadRemaining">
          <strong>{{ currentTotal }}</strong>
          of {{ total }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { propOr } from 'ramda'
import BfProgressBar from '../../../shared/bf-progress-bar/bf-progress-bar.vue'
import BfStorageMetrics from '../../../../mixins/bf-storage-metrics'
import EventBus from '../../../../utils/event-bus'

export default {
  name: 'BfUploadInfo',

  components: {
    BfProgressBar
  },

  mixins: [BfStorageMetrics],

  data() {
    return {
      packages: {},
      loaded: 0,
      currentTotal: '10GB',
      uploadTotal: ''
    }
  },

  computed: {
    ...mapGetters(['uploadRemaining', 'uploadCount']),

    ...mapState(['totalUploadSize']),

    /**
     * Compute copy based on how many files are being uploaded
     * @returns {String}
     */
    uploadCopy: function() {
      if (!this.uploadRemaining) {
        this.$store.dispatch('updateTotalUploadSize', 0)
        this.$store.dispatch('updateUploadCount', 0)
        return 'All Files have finished uploading.'
      }
      const file = this.uploadCount > 1 ? 'files' : 'file'
      return `${this.uploadCount} ${file}`
    },

    /**
     * Computes total upload size of all files
     * @returns {String}
     */
    total: function() {
      return this.formatMetric(this.totalUploadSize)
    }
  },

  mounted() {
    EventBus.$on('total-uploaded', this.displayTotalUploaded.bind(this))
  },

  methods: {
    /**
     * Show uploader
     * @returns {String}
     */
    showUpload: function() {
      EventBus.$emit('open-uploader', false)
    },

    /**
     * Dismiss status bar and clear uploaded files in bf-upload
     */
    onDismiss: function() {
      EventBus.$emit('dismiss-upload-info')
      EventBus.$emit('close-uploader')
    },

    /**
     * Displays current total uploaded
     * @param {Object} packageInfo
     */
    displayTotalUploaded: function(packageInfo) {
      const totalUploaded = propOr(0, 'total', packageInfo)
      const packageName = propOr('name', 'name', packageInfo)
      this.packages[packageName] = totalUploaded
      // sum all the packages uploading
      const values = Object.values(this.packages)
      this.loaded = values.reduce((acc, item) => (acc += item), 0)
      // format totals
      this.currentTotal = this.formatMetric(this.loaded)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';

.bf-upload-info {
  background: $gray_1;
  border-radius: 4px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.21), 0 0 5px 0 rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
  font-size: 13px;
  margin-left: -240px;
  left: 50%;
  padding: 8px 16px;
  position: absolute;
  top: 8px;
  width: 480px;
  z-index: 10;

  .bf-progress-bar {
    display: block !important;
    margin: 4px 0;
    width: 100% !important;
  }
}
button {
  color: $app-primary-color;
  text-decoration: underline;
}
.upload-details {
  display: flex;
  margin-top: 4px;
}
.show-details {
  flex: 1;
  text-align: left;
}
</style>
