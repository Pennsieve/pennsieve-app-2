<template>
  <div class="getting-started">
    <div class="heading">
      <h2>Getting Started Guide</h2>
      <p>Make the most out of your account with these steps.</p>
      <button
        class="btn-close"
        @click="$emit('close-menu')"
      >
        <svg-icon
          name="icon-remove"
          height="10"
          width="10"
        />
      </button>
    </div>

    <div class="steps-wrap">
      <getting-started-step
        v-for="data in gettingStartedData"
        :key="data.id"
        class="mb-16"
        :link="data.link"
        :heading="data.heading"
        :copy="data.blurb"
      >
        <img
          v-if="data.icon.type === 'img'"
          slot="img"
          :src="data.icon.iconUrl"
          :alt="data.icon.alt"
          :height="data.icon.height"
          :width="data.icon.width"
          :name="data.icon.name"
        >
        <svg-icon
          v-else
          slot="img"
          :color="data.icon.color"
          :alt="data.icon.alt"
          :name="data.icon.name"
          :height="data.icon.height"
          :width="data.icon.width"
        />
      </getting-started-step>
    </div>
  </div>
</template>

<script>
import GettingStartedStep from '../GettingStartedStep/GettingStartedStep.vue'

export default {
  name: 'GettingStarted',

  components: {
    GettingStartedStep
  },

  data() {
    return {
      gettingStartedData: [
        {
          id: 1,
          link: 'https://docs.pennsieve.io/docs/creating-and-deleting-datasets#creating-datasets',
          name: 'Dataset',
          heading: 'Create a Dataset',
          blurb: 'Create your first dataset or get started with a public dataset.',
          visible: true,
          icon: {
            type: 'img',
            iconUrl: '/static/file-icons/icon-folder.svg',
            alt: 'Icon of a folder',
            height: '36',
            width: '36'
          }
        },
        {
          id: 2,
          link: 'https://docs.pennsieve.io/docs/creating-metadata-models',
          name: 'Graph',
          heading: 'Set Up Your Graph',
          blurb: 'Create a knowledge graph unique to your metadata.',
          visible: true,
          icon: {
            type: 'svg',
            alt: 'Icon of a graph',
            name: 'icon-graph',
            color: '#404554',
            width: '29',
            height: '29'
          }
        },
        {
          id: 3,
          link: 'https://docs.pennsieve.io/docs/uploading-files',
          name: 'Files',
          heading: 'Add Your Data',
          blurb: 'Go beyond file storage with our viewers and with record management.',
          visible: true,
          icon: {
            type: 'img',
            iconUrl: '/static/file-icons/icon-tabular.svg',
            alt: 'Icon of a grid',
            width: '31',
            height: '31'
          }
        },
        {
          id: 4,
          link: 'https://docs.pennsieve.io/',
          name: 'Tools',
          heading: 'Install Developer Tools',
          blurb: 'Integrate our client libraries into your workflow.',
          visible: true,
          icon: {
            type: 'img',
            iconUrl: '/static/file-icons/icon-code.svg',
            alt: 'Icon for code',
            width: '32',
            height: '32'
          }
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';
@import '../../bf-navigation/bf-navigation.scss';

.btn-close {
  color: $gray_4;
  position: absolute;
  right: 16px;
  top: 8px;
}

h2 {
  margin: 0 0 8px;
}

p {
  color: $gray_4;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
}

.steps-wrap {
  padding: 16px;
}

.heading {
  padding: 16px 16px 0;
  position: relative;
}
</style>
