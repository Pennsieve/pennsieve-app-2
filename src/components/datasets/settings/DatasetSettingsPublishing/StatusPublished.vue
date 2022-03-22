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
        <a
          target="_blank"
          :href="discoverLink"
          class="discover-link"
        >
          View on Discover
        </a>
      </p>
    </div>
    <!-- insert markdown editor here -->
    <data-card
      ref="descriptionDataCard"
      class="grey compact"
      title="Changelog"
      :is-expandable="true"
      :padding="false"
    >
      <template slot="title-aux">
        <button
          v-if="isEditingMarkdown"
          class="linked mr-8"
          @click="isEditingMarkdown = false"
        >
          Cancel
        </button>
        <button
          v-if="isEditingMarkdown"
          class="linked"
          :disabled="datasetLocked"
          @click="isSavingMarkdown = true"
        >
          Save
        </button>
        <button
          v-else
          slot="title-aux"
          class="linked"
          :disabled="datasetLocked"
          @click="isEditingMarkdown = true"
        >
          Update
        </button>
      </template>
      <markdown-editor
        ref="markdownEditor"
        :value="datasetDescription"
        :is-editing="isEditingMarkdown"
        :is-saving="isSavingMarkdown"
        :empty-state="datasetDescriptionEmptyState"
        :is-loading="isLoadingDatasetDescription"
        <!--check syntax -->
        @save="onChangelogSave", "proceedWithSubmit"
      />
    </data-card>
    <div v-if="hasCompletedChangelog">
      <p>You have successfully saved the changelog and the dataset is ready to be submitted for review.</p>
    </div>
    <div v-else>
      <p>You have not yet saved a changelog file. Please consider completing and saving a changelog file.</p>
    </div>
    <div class="published-btn-wrap mb-16">
      <submit-for-publication
        :has-dataset="true"
        :can-publish="canPublish"
        :dataset-id="datasetId"
      />
    </div>
    <p
      v-if="!hasPublishingPermission"
      class="sharing-blurb"
    >
      Editing capabilities such as releasing a new version or making a dataset private are restricted to owners only.
      To change the owner of your dataset, please contact
      <a :href="`mailto:${datasetOwnerEmail}?subject=Dataset Publishing Permissions`">
        {{ datasetOwnerName }}
      </a>
    </p>
  </div>
</template>

<script>
import SubmitForPublication from './SubmitForPublication'
import { PublicationTabs } from '../../../../utils/constants'
#may need to change file path
import MarkdownEditor from 'src/components/shared/MarkdownEditor/MarkdownEditor.vue'

export default {
  components: {
    SubmitForPublication,
  },
  props: {
    datasetId: {
      type: String,
      required: true,
    },
    discoverLink: {
      type: String,
      required: true,
    },
    canPublish: {
      type: Boolean,
      required: true,
    },
    hasCompletedChangelog: {
      type: Boolean,
      required: true,
    },
    hasPublishingPermission: {
      type: Boolean,
      required: true,
    },
    datasetOwnerName: {
      type: String,
      required: true,
    },
    datasetOwnerEmail: {
      type: String,
      required: true,
    },
    publishedDate: {
      type: String,
      required: true,
    }
  },
  computed: {
    PublicationTabs: function() {
      return PublicationTabs
    }
  },
  methods: {
    /**
     * On Changelog save, emitted from the MarkdownEditor
     * Make a request to the API to save the changelog. TO DO
     * @params {String} markdown
     */
    onChangelogSave: function(markdown) {
      fetch(this.datasetReadmeUrl, {
        body: JSON.stringify({
          readme: markdown
        }),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': this.datasetDescriptionEtag,
        }
      })
        .then(response => {
          if (response.ok) {
            this.setDatasetDescriptionEtag(response.headers.get('etag'))
            this.setDatasetDescription(markdown).finally(() => {
              this.isSavingMarkdown = false
              this.isEditingMarkdown = false
            })
          } else if (response.status === 412) {
            this.isSavingMarkdown = false
            this.$refs.staleUpdateDialog.dialogVisible = true
          } else {
            throw response
          }
        })
        .catch(this.handleXhrError.bind(this))
    },

    proceedWithSubmit: function(){
      "hasCompletedChangelog" = true;
    }

  }
}
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
