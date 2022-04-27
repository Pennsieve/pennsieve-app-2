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
    <div v-if="hasCompletedChangelog">
      <p>You have successfully saved the changelog and the dataset is ready to be submitted for review.</p>
    </div>
    <div v-else>
      <p>You have not yet saved a changelog file. Please consider completing and saving a changelog file below.</p>


    <data-card
      ref="changelogDataCard"
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
          @click="isSavingMarkdown = true"
        >
          Save
        </button>
        <button
          v-else
          slot="title-aux"
          class="linked"
          @click="isEditingMarkdown = true"
        >
          Update
        </button>
      </template>
    <markdown-editor
      ref="markdownEditor"
      :value="changelogText"
      :is-editing="isEditingMarkdown"
      :is-saving="isSavingMarkdown"
      :empty-state="changelogTextEmptyState"
      :is-loading="isLoadingChangelog"
      @save="onChangelogSave"
    />
    </data-card>
    </div>
    <br>
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
 // may need to change file path
import DataCard from '../../../shared/DataCard/DataCard.vue'
import MarkdownEditor from '../../../shared/MarkdownEditor/MarkdownEditor'
import changelogDescriptionEmptyState from './changelog-description-empty-state'

export default {
  components: {
    SubmitForPublication,
    DataCard,
    MarkdownEditor,
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
  data() {
    return {
      hasCompletedChangelog: false,
      changelogText: '',
      isEditingMarkdown: false,
      isSavingMarkdown: false,
      changelogTextEmptyState: '',
      isLoadingChangelog: false
    }
  },
  computed: {
    PublicationTabs: function() {
      return PublicationTabs
    },
    datasetChangelogUrl: function() {
      //need to fetch this properly
      return `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}/datasets/${this.datasetId}/changelog-component/?api_key=${this.userToken}`
    },
    //USE THIS ONE INSTEAD
    datasetChangelogUrl: function() {
      return this.userToken
        ? `${this.config.apiUrl}/datasets/${this.datasetId}/changelog?api_key=${
            this.userToken
          }`
        : ''
    }
  },
  methods: {
    ...mapActions(['setChangelog']),
    /**
     * On Changelog save, emitted from the MarkdownEditor
     * Make a request to the API to save the changelog
     * PUT request: URL, but it has a body with one element: changelog
     * @params {String} markdown
     */
    onChangelogSave: function(markdown) {
      fetch(this.datasetChangelogUrl, {
        body: JSON.stringify({
          changelog: markdown
        }),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      //LEFT OFF HERE
        .then(response => {
          if (response.ok) {
            //CHANGE THIS... set the changelog.body here
            this.setChangelog(markdown).finally(() => {
              this.isSavingMarkdown = false
              this.isEditingMarkdown = false
              this.hasCompletedChangelog = true
            })
          } else if (response.status === 412) {
            this.isSavingMarkdown = false
            this.$refs.staleUpdateDialog.dialogVisible = true
          } else {
            throw response
          }
        })
        .catch(this.handleXhrError.bind(this))
    }
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
