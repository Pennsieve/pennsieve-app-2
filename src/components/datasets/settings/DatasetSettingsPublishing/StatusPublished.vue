<template>
  <div>
    <p class="sharing-blurb">
      Request to publish a new version of your dataset to Pennsieve Discover.
    </p>
    <p class="sharing-blurb">This requires approval by the Publishing team.</p>
    
    <div class="sharing-status mb-16">
      <p class="published-blurb">
        <svg-icon
          class="icon-status"
          name="icon-globe-check"
          height="24"
          width="24"
          color="#000"
        />
        Published on {{ publishedDate }}
        <a target="_blank" :href="discoverLink" class="discover-link">
          View on Discover
        </a>
      </p>
    </div>
    <br />
    <div class="published-btn-wrap mb-16">
      <submit-for-publication
        :has-dataset="true"
        :can-publish="canPublish"
        :dataset-id="datasetId"
      />
    </div>
    <p v-if="!hasPublishingPermission" class="sharing-blurb">
      Editing capabilities such as releasing a new version or making a dataset
      private are restricted to owners only. To change the owner of your
      dataset, please contact
      <a
        :href="
          `mailto:${datasetOwnerEmail}?subject=Dataset Publishing Permissions`
        "
      >
        {{ datasetOwnerName }}
      </a>
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SubmitForPublication from './SubmitForPublication'
import { PublicationTabs } from '../../../../utils/constants'

export default {
  components: {
    SubmitForPublication
  },
  props: {
    datasetId: {
      type: String,
      required: true
    },
    discoverLink: {
      type: String,
      required: true
    },
    canPublish: {
      type: Boolean,
      required: true
    },
    hasPublishingPermission: {
      type: Boolean,
      required: true
    },
    datasetOwnerName: {
      type: String,
      required: true
    },
    datasetOwnerEmail: {
      type: String,
      required: true
    },
    publishedDate: {
      type: String,
      required: true
    }
  },
  computed: {
    PublicationTabs: function() {
      return PublicationTabs
    }
  },
  methods: {
    ...mapState(['config', 'userToken'])
  }
}
//TO UPDATE, need to perform a GET and modify with a PUT
</script>

<style scoped lang="scss">
.sharing-blurb {
  margin-bottom: 3px;
  color: #000;
}

.published-blurb {
  margin-top: 16px;
  color: #000;
}
</style>
<template>
  <div>
    <p class="sharing-blurb">
      Request to publish a new version of your dataset to Pennsieve Discover.
    </p>
    <p class="sharing-blurb">This requires approval by the Publishing team.</p>
    <div class="sharing-status mb-16">
      <p class="published-blurb">
        <svg-icon
          class="icon-status"
          name="icon-globe-check"
          height="24"
          width="24"
          color="#000"
        />
        Published on {{ publishedDate }}
        <a target="_blank" :href="discoverLink" class="discover-link">
          View on Discover
        </a>
      </p>
    </div>
    <br />
    <div class="published-btn-wrap mb-16">
      <submit-for-publication
        :has-dataset="true"
        :can-publish="canPublish"
        :dataset-id="datasetId"
      />
    </div>
    <p v-if="!hasPublishingPermission" class="sharing-blurb">
      Editing capabilities such as releasing a new version or making a dataset
      private are restricted to owners only. To change the owner of your
      dataset, please contact
      <a
        :href="
          `mailto:${datasetOwnerEmail}?subject=Dataset Publishing Permissions`
        "
      >
        {{ datasetOwnerName }}
      </a>
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SubmitForPublication from './SubmitForPublication'
import { PublicationTabs } from '../../../../utils/constants'

export default {
  components: {
    SubmitForPublication
  },
  props: {
    datasetId: {
      type: String,
      required: true
    },
    discoverLink: {
      type: String,
      required: true
    },
    canPublish: {
      type: Boolean,
      required: true
    },
    hasPublishingPermission: {
      type: Boolean,
      required: true
    },
    datasetOwnerName: {
      type: String,
      required: true
    },
    datasetOwnerEmail: {
      type: String,
      required: true
    },
    publishedDate: {
      type: String,
      required: true
    }
  },
  computed: {
    PublicationTabs: function() {
      return PublicationTabs
    }
  },
  methods: {
    ...mapState(['config', 'userToken'])
  }
}
//TO UPDATE, need to perform a GET and modify with a PUT
</script>

<style scoped lang="scss">
.sharing-blurb {
  margin-bottom: 3px;
  color: #000;
}

.published-blurb {
  margin-top: 16px;
  color: #000;
}
</style>
