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
          value="datasetDescription"
          :is-editing="false"
          :is-saving="false"
          empty-state="datasetDescriptionEmptyState"
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
          value="datasetDescription"
          :is-editing="false"
          :is-saving="false"
          empty-state="datasetDescriptionEmptyState"
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
          value="datasetDescription"
          :is-editing="false"
          :is-saving="false"
          empty-state="datasetDescriptionEmptyState"
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
      isLoading: false
    }
  },

  computed: {
    ...mapGetters([

    ]),
  },


  watch: {
  },


  methods: {
    ...mapActions([]),

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