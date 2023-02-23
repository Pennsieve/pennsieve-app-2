<template>
  <div class="repository-list-item" @click="openInfoPanel">

    <el-row
      type="flex"
      align="middle"
      class="info"
    >
      <el-col
        :sm="24"
      >
        <el-row
          type="flex"
          align="middle"
        >
          <div class="repository-type" >
            {{isPrivateStr}}
          </div>

        </el-row>

        <el-row>
          <div class="repository-title" >
            {{repository.displayName}}
          </div>
        </el-row>
        <el-row>
          <p class="repository-description">
            {{repository.description}}
          </p>
        </el-row>
      </el-col>
      <el-col
        :sm="16">
        <el-row
          type="flex"
          align="right"
          class="logo-wrapper">
          <img
            :src=logoPath
            class="logo"
            alt="Logo for Pennsieve"
          />
        </el-row>

      </el-col>
    </el-row>






  </div>


  <!--  </div>-->
</template>

<script>

import {
  mapActions, mapState,
} from 'vuex'
import {find, propEq, propOr} from "ramda";
import FormatDate from '@/mixins/format-date'
import Avatar from '../../shared/avatar/Avatar.vue'
import PsSwitch from '../../shared/PsSwitch/PsSwitch.vue'

export default {
  name: 'RepositoryListItem',

  components: {
    Avatar,
    PsSwitch
  },
  mixins: [
    FormatDate,
  ],

  props: {
    repository: {
      type: Object,
      default: () => ({})
    },
  },

  computed: {
    isPrivateStr: function() {
      if (this.repository.isPublic) {
        return "ACCEPTING DATASETS"
      }
      return  "PRIVATE"
    },
    logoPath: function() {
      if (this.repository) {
        // return "../../../../static/images/" + this.repository.logo
        return this.repository.logo
      }
      return ""
    }
  },

  data: function () {
    return {
    }
  },
  mounted() {
  },
  watch: {
  },
  methods: {
    ...mapActions('repositoryModule',[
        'updateModalVisible',
        'setSelectedRepo'
      ]
    ),
    openInfoPanel: function(ev) {
      this.setSelectedRepo(this.repository)
      this.updateModalVisible(true)
    }

  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/_variables.scss';

.logo-wrapper {
  justify-content: flex-end;
  .logo {
    height: 40px;
    width: auto;
  }
}

.repository-menu {
  width: 24px;
}

.repository-list-item {
  border: 1px solid $gray_3;
  margin: 0 0 16px 0;
  //padding:  16px 24px 8px 24px;
  background-color: white;
  display:flex;
  flex-direction: column;
  cursor: pointer;

  :hover {
    background-color: $purple-tint;
  }

  .info {
    padding:  16px 24px 8px 24px;
  }

}
.repository-title {
  font-size: 16px;
  margin-bottom: 8px;
  color: $purple_3;
}

.repository-type {
  color: $gray_5;
  font-weight: 500;
  font-size: 12px;
}

.repository-description {
  font-size: 12px;
  color: $gray_5;
  min-height: 3em;
  max-width: 650px;
}

.list-item-col-spacer {
  padding-top: 32px;
}

</style>
