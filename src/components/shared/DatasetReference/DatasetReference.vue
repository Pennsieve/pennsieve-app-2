<template>
  <div v-loading="isLoading">
    <div
      class="citation"
      v-html="$sanitize(citation, ['i', 'b'])"
    />
    <template v-if="hasError">
      Sorry, an error has occurred
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Request from '@/mixins/request'

export default {
  name: 'DatasetReference',

  mixins: [
    Request
  ],

  props: {
    doi: {
      type: String,
      default: ''
    }
  },

  data() {
    return  {
      citation: '',
      isLoading: false,
      hasError: false
    }
  },

  computed: {
    ...mapState([
      'config',
      'userToken'
    ]),

    /**
     * Compute URL for DOI endpoint
     * @returns {String}
     */
    doiUrl: function() {
      return `${this.config.apiUrl}/datasets/external-publications/citation?doi=${this.doi}&api_key=${this.userToken}`
    }
  },

  watch: {
    doiUrl: {
      handler: function(val) {
        if (val) {
          this.getCitation()
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Get citation for DOI
     */
    getCitation: function() {
      this.isLoading = true
      this.hasError = false

      this.sendXhr(this.doiUrl)
        .then(response => {
          this.citation = response.citation
        })
        .catch(() => {
          this.hasError = true
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.citation {
  word-break: break-word;
}
</style>
