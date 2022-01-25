<template>
  <div class="dataset-list">
      <public-dataset
        v-for="dataset in visibleCards"
        :key="dataset.id"
        class="mb-8"
        :dataset="dataset"
      />
  </div>
</template>

<script>
import PublicDataset from './PublicDataset.vue'
import {mapGetters} from "vuex";
import Request from '../../mixins/request/index'

export default {
  name: 'PublicDatasetsGrid',

  components: {
    PublicDataset
  },

  // props: {
  //   datasets: {
  //     type: Array,
  //     default: () => []
  //   }
  // },

  computed: {
    ...mapGetters([
      'config'
    ]),
    visibleCards: function(){
      let cardWidth = 352; // 350  wide + 1px border
      let nrRows = 3
      let nrCards = nrRows * Math.floor((this.windowWidth - 16) /cardWidth)
      return this.datasets.slice(0, nrCards)
    }
  },

  mounted() {
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', this.onResize)

    let url = `${this.config.discoverUrl}/datasets?limit=${this.pageSize}&offset=0`
    this.sendXhr(url)
      .then(response => {
        this.datasets = response.datasets
      })
      .catch(response => {
        this.handleXhrError(response)
      })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  mixins: [
    Request
  ],

  data: function() {
    return {
      pageSize: 16,
      windowWidth: 0,
      datasets:[]
    }
  },

  methods: {
    onResize: function() {
      this.windowWidth = window.innerWidth
    }



    // try {
    //   let url = `${process.env.discover_api_host}/datasets?limit=${pageSize}&offset=0`
    //   const tagsUrl = `${process.env.discover_api_host}/tags`
    //   const token = $cookies.get('user_token')
    //   if (token) {
    //     url = `${url}&api_key=${token}`
    //     // @TODO add back in when endpoint issue has been resolved.
    //     // tagsUrl = `${tagsUrl}&api_key=${token}`
    //   }
    //
    //   const datasetRes = await $axios.$get(url)
    //   const tagsRes = await $axios.$get(tagsUrl)
    //   return {
    //     datasets: datasetRes.datasets,
    //     totalDatasetCount: datasetRes.totalCount,
    //     tags: tagsRes,
    //     resetTags: tagsRes.map((tag) => ({ ...tag })) // this is for when we reset the tags on clear
    //   }
    // } catch (err) {
    //   error({ message: err.message })
    // }
  }
}
</script>

<style lang="scss">

  .dataset-list {
    display: flex;
    flex-wrap: wrap;
    margin: 24px 8px;
    justify-content: space-around;
  }

</style>





