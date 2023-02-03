<template>
  <bf-page class="bf-people-list">

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >

     Submit Datasets


    </bf-stage>
  </bf-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'



export default {
  name: 'SubmitDatasets',

  components: {
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