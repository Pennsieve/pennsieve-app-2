<template>
  <div class="image-viewer">
    <el-row
      type="flex"
      justify="center"
    >
      <el-col>
        <img
          :hidden="isLoading"
          :src="getFileUrl"
        >
      </el-col>
    </el-row>
  </div>
</template>

<script>
import StaticViewer from '../../mixins/static-viewer'

export default {
  name: 'ImageViewer',

  mixins: [
    StaticViewer
  ],

  props: {
    pkg: Object,
    idx: Number
  }
}
</script>

<style lang="scss" scoped>
  .image-viewer {
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    height: 100%;
  }

  img {
    display: block;
    height: auto;
    max-width: 100%;
    margin: 0 auto;
  }

  @-moz-document url-prefix() {
    /* Firefox doesn't respect max-width in certain situations */
    img { width: 100%; max-width: -moz-max-content; }
  }
</style>
