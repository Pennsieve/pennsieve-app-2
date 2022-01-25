<template>
  <div class="dataset-card">
    <div class="dataset-content">
      <div class="image mr-16">
        <dataset-banner-image :src="dataset.banner" />
      </div>
      <div class="dataset-content-wrap">
        <div class="content-header">
          <a v-bind:href="config.discoverAppUrl + '/datasets/' + dataset.id ">
            {{ visibleName }}
          </a>
        </div>
        <div class="subtitle">
          {{ dataset.description }}
        </div>
      </div>
    </div>
    <div class="dataset-details-wrap mt-16">
      <div class="details">
        <div class="detail">
          <svg-icon name="icon-files" height="16" width="16" />
          <span v-if="dataset.fileCount > 0 && dataset.fileCount !== 1">
            <strong>{{ formatNumber(dataset.fileCount) }}</strong> Files
          </span>
          <span v-else-if="dataset.fileCount === 1">
            <strong>{{ dataset.fileCount }}</strong> File
          </span>
          <span v-else>No Files</span>
        </div>
        <div class="detail">
          <svg-icon name="icon-storage" height="16" width="16" />
          <strong>{{ formatMetric(dataset.size) }}</strong>
        </div>
        <div class="detail">
          <svg-icon name="icon-document" height="16" width="16" />
          <span v-if="dataset.recordCount > 0 && dataset.recordCount !== 1">
            <strong>{{ formatNumber(dataset.recordCount) }}</strong> Records
          </span>
          <span v-else-if="dataset.recordCount === 1">
            <strong>{{ dataset.recordCount }}</strong> Record
          </span>
          <span v-else>No Records</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { propOr, take } from 'ramda'

import DatasetBannerImage from '@/components/DatasetBannerImage/DatasetBannerImage.vue'

import { getLicenseAbbr } from '@/utils/license-util'
import FormatMetric from '@/mixins/bf-storage-metrics'
import FormatDate from '@/mixins/format-date'
import {mapGetters} from "vuex";

export default {
  name: 'PublicDataset',

  components: {
    DatasetBannerImage
  },

  mixins: [FormatDate, FormatMetric],

  props: {
    dataset: {
      type: Object,
      default: () => {
        return {
          arn: '',
          banner: '',
          contributors: [],
          createdAt: '',
          description: '',
          doi: '',
          embargo: false,
          embargoReleaseDate: null,
          fileCount: null,
          firstPublishedAt: '',
          id: null,
          license: '',
          modelCount: [],
          name: '',
          organizationName: '',
          ownerFirstName: '',
          ownerLastName: '',
          ownerOrcid: '',
          readme: '',
          recordCount: null,
          revisedAt: '',
          size: null,
          status: '',
          tags: [],
          updatedAt: '',
          uri: '',
          version: null,
          versionPublishedAt: ''
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'config'
    ]),
    visibleName() {

      const maxLength = 100

      //trim the string to the maximum length
      let trimmedString = this.dataset.name.substr(0, maxLength);



      if (trimmedString.length < this.dataset.name.length) {
        //re-trim if we are in the middle of a word
        trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
        return trimmedString + '...'
      } else {
        return trimmedString
      }
    },
    /** Formats the embargoed release date
     * @returns {String}
     */
    getEmbargoReleaseDate() {
      return this.formatDate(this.dataset.embargoReleaseDate)
    },
    /**
     * Compute sponsor status for dataset
     * @returns {boolean}
     */
    hasSponsor() {
      return !!this.dataset.sponsorship
    },

    /**
     * Compute first three tags
     * @returns {Array}
     */
    firstThreeTags() {
      const tags = propOr([], 'tags', this.dataset)
      return take(3, tags)
    },

    /**
     * Compute abbreviation for license
     * @returns {String}
     */
    licenseAbbreviation() {
      const license = propOr('', 'license', this.dataset)
      return getLicenseAbbr(license)
    },

    /**
     * Compute the dataset owner's name
     * @returns {String}
     */
    datasetOwnerName() {
      const firstName = propOr('', 'ownerFirstName', this.dataset)
      const lastName = propOr('', 'ownerLastName', this.dataset)
      return `${firstName} ${lastName}`
    },

    /**
     * Get formatted last updated date
     * @return {String}
     */
    lastUpdatedDate() {
      const date = this.dataset.revisedAt || this.dataset.versionPublishedAt
      return this.formatDate(date)
    }
  },

  methods: {
    /**
     * Formats the number to include commas
     * @param {String} number
     */
    formatNumber(number) {
      return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/_variables.scss';

.dataset-card {
  border: solid 1px $gray_4;
  border-radius: 3px 3px 0 0;
  width: 350px;
}

.dataset-content-wrap {
  flex: 1;
  overflow: hidden;
  .content-header {
    text-overflow: ellipsis;
  }
  a {
    font-weight: 500;
    font-size: 14px;
  }
}
h3 {
  color: #2760ff;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 8px;
  word-break: break-word;
}

.subtitle {
  color: #000;
  font-size: 14px;
  font-weight: normal;
  line-height: 24px;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dataset-details-wrap {
  display: flex;
  flex-direction: column;
  margin: 8px;
  @media (min-width: 992px) {
    align-items: flex-end;
    flex-direction: row;
  }
}
.details {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 11px;
  @media (min-width: 992px) {
    margin-bottom: 0;
  }
  .detail {
    align-items: center;
    display: flex;
    padding-right: 24px;
    color: #404554;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0px;
    line-height: 16px;
    .svg-icon {
      margin-right: 8px;
    }
  }
}

.dataset-content {
  display: flex;
  flex-direction: row;
  padding: 24px 16px;
  height: 100px;

  img {
    display: block;
    width: 86px;
    height: 86px;
  }
}

.meta {
  border-top: solid 1px $gray_6;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 16px;
  .author {
    font-size: 12px;
    line-height: 14px;
  }
  .tags {
    font-size: 12px;
    line-height: 14px;
  }
}

a {
  &:focus {
    color: #1c46bd;
  }
}
</style>