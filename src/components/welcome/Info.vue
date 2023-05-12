<template>
  <bf-page>

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >
      <div class="logo-wrapper">
        <img
          src="../../../static/images/pennsieve-logo-full.svg"
          class="logo"
          alt="Logo for Pennsieve"
        >
      </div>


      <data-card
        ref="descriptionDataCard"
        class="compact purple infocard"
        title="Pennsieve Platform Information"
        :is-expandable="true"
        :padding="false"
      >

        <markdown-editor
          ref="markdownEditor"
          :value="publishingInfo.info"
          :is-editing="false"
          :is-saving="false"
          empty-state=""
          :is-loading="false"
        />
      </data-card>

      <data-card
        ref="descriptionDataCard"
        class="compact purple infocard"
        title="Funding"
        :is-expandable="true"
        :padding="false"
      >

        <markdown-editor
          ref="markdownEditor"
          :value="publishingInfo.funding"
          :is-editing="false"
          :is-saving="false"
          empty-state=""
          :is-loading="false"
        />
      </data-card>

      <data-card
        ref="descriptionDataCard"
        class="compact purple infocard"
        title="Acknowledgements"
        :is-expandable="true"
        :padding="false"
      >

        <markdown-editor
          ref="markdownEditor"
          :value="publishingInfo.acknowledgements"
          :is-editing="false"
          :is-saving="false"
          empty-state=""
          :is-loading="false"
        />
      </data-card>


    </bf-stage>
  </bf-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import DataCard from "@/components/shared/DataCard/DataCard.vue"
import MarkdownEditor from '@/components/shared/MarkdownEditor/MarkdownEditor.vue'


export default {
  name: 'Info',

  components: {
    DataCard,
    MarkdownEditor
  },

  mixins: [
  ],

  props: {

  },

  data() {
    return {
      publishingInfo: {
        info: "",
        funding: "",
        acknowledgements: ""
      },
      isLoading: false,
    }
  },

  mounted () {
    this.getInfo()
  },

  computed: {
    ...mapGetters('repositoryModule', ['getPublishingInfo']),
  },

  watch: {
  },

  methods: {
    ...mapActions('repositoryModule', ['fetchPublishingInfo']),

    getInfo: function() {
      console.log("Info::getInfo()")
      this.fetchPublishingInfo()
        .then(_ => this.loadInfo())
        .catch(err => {console.log(`Info::getInfo() err: ${err}`)})
    },

    loadInfo: function() {
      console.log("Info::loadInfo()")
      const infoTypes = ['info', 'funding', 'acknowledgements']

      for (const infoType of infoTypes) {
        console.log(`Info::loadInfo() infoType: ${infoType}`)
        let publishingInfo = this.getPublishingInfo(infoType)
        console.log("Info::loadInfo() publishingInfo:")
        console.log(publishingInfo)
        if (publishingInfo && publishingInfo.url) {
          this.loadText(publishingInfo.url)
            .then(result => this.publishingInfo[infoType] = result)
            .catch(err => {console.log(`Info::loadInfo( ${infoType} ) err: ${err}`)})
        } else {
          console.log(`Info::loadInfo() publishingInfo for ${infoType} not found`)
        }
      }
    },

    loadText: async function(url) {
      console.log(`Info::loadText() url: ${url}`)
      let result = ""
      let response = await fetch(url)
        if (response.ok) {
          result = await response.text()
        }
      return result
    }
  }
}
</script>

<style scoped lang="scss">

h1 {
  font-size: 22px;
  margin-bottom: 8px;
}

p {
  max-width: 760px;
}

.infocard {
  margin-bottom: 16px;
}

.logo {
  margin-bottom: 24px;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 380px;
  margin: 48px 0px;
}
.logo {
  width: 300px;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
}

.content {
  margin-top: 40px
}

.data-usage {
  text-align: right;
}
.col-spacer {
  height: 17px;
}
.pagination-header {
  display: flex;
  justify-content: space-between
}
</style>