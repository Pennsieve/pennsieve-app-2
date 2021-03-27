<template>
  <content-loader
    class="dataset-settings-publishing-loader"
    :height="64"
    :width="260"
    :speed="2"
    primary-color="#d8d8d8"
    secondary-color="#ecebeb"
  >
    <rect
      x="0"
      y="0"
      rx="0"
      ry="0"
      width="20"
      height="20"
    />
    <rect
      x="28"
      y="2"
      rx="0"
      ry="0"
      width="65"
      height="16"
    />
    <rect
      x="97"
      y="2"
      rx="0"
      ry="0"
      width="125"
      height="16"
    />
    <rect
      x="0"
      y="28"
      rx="0"
      ry="0"
      width="260"
      height="14"
    />
    <rect
      x="0"
      y="50"
      rx="0"
      ry="0"
      width="170"
      height="14"
    />
  </content-loader>
</template>

<script>
  import { ContentLoader } from 'vue-content-loader'

  export default {
    name: 'DatasetSettingsPublishingLoader',

    components: {
      ContentLoader
    }
  }
</script>

<style lang="scss" scoped>
  .dataset-settings-publishing-loader {
    width: 260px;
  }
</style>
