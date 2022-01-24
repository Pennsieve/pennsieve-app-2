<template>
  <img
    ref="img"
    :src="bannerSrc"
    class="dataset-image"
    alt="Dataset Banner Image"
  />
</template>

<script>
export default {
  name: 'DatasetBannerImage',
  props: {
    src: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      bannerSrc: ''
    }
  },

  watch: {
    src: {
      handler(val) {
        this.bannerSrc = val
      },
      immediate: true
    }
  },

  mounted() {
    // Add listener for onerror
    this.$refs.img.onerror = this.onError
  },

  methods: {
    /**
     * Set the source as the brokenImage URL
     */
    onError() {
      this.bannerSrc = '~/assets/images/illustrations/icon-broken-image.svg'
    }
  }
}
</script>
