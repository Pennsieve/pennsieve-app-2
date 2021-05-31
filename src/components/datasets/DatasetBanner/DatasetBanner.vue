<template>
  <div class="dataset-banner">
    <content-loader
      v-if="isLoadingDatasetBanner"
      class="dataset-banner-loader"
      :height="100"
      :width="100"
      :speed="2"
      primary-color="#d8d8d8"
      secondary-color="#ecebeb"
    >
      <rect
        x="0"
        y="0"
        rx="0"
        ry="0"
        width="100"
        height="100"
      />
    </content-loader>

    <template v-else>
      <img
        v-if="hasDatasetBanner"
        :src="datasetBanner"
        :alt="datasetBannerAlt"
      >

      <div
        v-else
        class="empty-state-wrap"
      >
        <div class="empty-state">
          <img
            class="img-upload mb-8"
            src="/static/images/illustrations/illo-add-files.svg"
            alt="Upload an image"
          >
          <p class="mb-0">
            {{ emptyStateText }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { pathOr } from 'ramda'
  import { ContentLoader } from 'vue-content-loader'

  export default {
    name: 'DatasetBanner',

    components: {
      ContentLoader
    },

    props: {
      emptyStateText: {
        type: String,
        default: 'Drag and drop to upload your image.'
      }
    },

    computed: {
      ...mapState([
        'dataset',
        'datasetBanner',
        'isLoadingDatasetBanner'
      ]),

      /**
       * Compute banner image alt text
       * @returns {String}
       */
      datasetBannerAlt: function() {
        const datasetName = pathOr('Dataset', ['content', 'name'], this.dataset)
        return `Banner image for ${datasetName}`
      },

      /**
       * Compute if the dataset has a banner
       * @returns {Boolean}
       */
      hasDatasetBanner: function() {
        return this.datasetBanner !== ''
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';
  .dataset-banner {
    border: 1px solid $gray_2;
    border-radius: 3px;
    &:hover, &.is-dragging {
      border-color: $app-primary-color;
    }
  }
  img {
    height: 100%;
    width: 100%;
  }
  .empty-state-wrap {
    align-items: center;
    height: 100%;
    display: flex;
    justify-content: center;
    text-align: center;
    width: 100%;
  }
  .empty-state {
    color: $gray_4;
    cursor: pointer;
    font-size: 12px;
  }

  .img-upload {
    height: 81px;
    width: 119px;
  }
  .empty-state {
    width: 120px;
  }
</style>
