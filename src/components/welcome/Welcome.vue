<template>
  <bf-page class="bf-people-list">

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >

      <img
        src="../../../static/images/pennsieve-logo-full.svg"
        class="logo"
        alt="Logo for Pennsieve"
      >

      <div class="content">
        <h1>Welcome to Pennsieve!</h1>
        <p> Pennsieve is a cloud-based data management and publication platform which supports several public repositories as well as private consortium workspaces.</p>

        <div class="buttons">

          <bf-button>Visit Documentation Hub</bf-button>
          <bf-button>Submit a Dataset</bf-button>

        </div>

        <h1>Repositories</h1>
        <p> Pennsieve is a cloud-based data management and publication platform which supports several public repositories as well as private consortium workspaces.</p>


      </div>

      <div
        v-if="repositories.length > 0"
        class="integration-list"
      >
        <repository-list-item
          v-for="repo in repositories"
          :key="repo.id"
          :repository="repo"
        />
      </div>


    </bf-stage>
    <repository-info
      :visible.sync="repositoryModalVisible"
      :repository="selectedRepoForRequest"
    />
  </bf-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'

import BfRafter from '../shared/bf-rafter/BfRafter.vue'
import BfButton from '../shared/bf-button/BfButton.vue'
import RepositoryInfo from '@/components/welcome/repository-info/RepositoryInfo.vue'

import PaginationPageMenu from '../shared/PaginationPageMenu/PaginationPageMenu'
import RepositoryListItem from './repository-list-item/RepositoryListItem'

export default {
  name: 'Welcome',

  components: {
    BfRafter,
    BfButton,
    PaginationPageMenu,
    RepositoryListItem,
    RepositoryInfo
  },

  mixins: [
  ],

  props: {
    repositories: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      isLoading: false,
    }
  },

  computed: {
    ...mapState('repositoryModule', [
      'repositoryModalVisible',
      'selectedRepoForRequest'
    ]),
    ...mapGetters([

    ]),
  },


  watch: {
  },

  // beforeRouteEnter(to, from, next) {
  //   next(vm => {
  //     if (vm.hasFeature('sandbox_org_feature')) {
  //       vm.$router.push({name: 'create-org'})
  //     }
  //   })
  // },

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