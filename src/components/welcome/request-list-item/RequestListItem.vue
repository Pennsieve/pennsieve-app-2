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
            {{statusStr}}
          </div>

        </el-row>

        <el-row>
          <div class="repository-title" >
            {{datasetRequest.name}}
          </div>
        </el-row>
        <el-row>
          <p class="repository-description">
            {{datasetRequest.description}}
          </p>
        </el-row>
      </el-col>
      <el-col
        class = "option-col"
        :sm="8"
        >
        <template v-if="datasetRequest.status === 'DRAFT'">
          <a
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.REVISION)"
          >
            Edit Request
          </a>
        </template>
        <template v-if="datasetRequest.status === 'ACCEPTED'">
          <a
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.REVISION)"
          >
            Open Dataset
          </a>
        </template>
        <template v-if="datasetRequest.status === 'SUBMITTED' || datasetRequest.status === 'REJECTED' ">
          <a
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.REVISION)"
          >
            Retract Request
          </a>
        </template>
        <template v-if="datasetRequest.status === 'REJECTED'">
          <a
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.REVISION)"
          >
            Resubmit To...
          </a>
        </template>
        <template v-if="datasetRequest.status === 'DRAFT'">
          <a
            href="#"
            @click.prevent="triggerRequest(PublicationStatus.ACCEPTED, PublicationType.REVISION)"
          >
            Remove Request
          </a>
        </template>

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
  mapActions, mapGetters,
} from 'vuex'
import {find, propEq, propOr} from "ramda";
import FormatDate from '@/mixins/format-date'
import PsSwitch from '../../shared/PsSwitch/PsSwitch.vue'

export default {
  name: 'RequestListItem',

  components: {
    PsSwitch
  },
  mixins: [
    FormatDate,
  ],

  props: {
    datasetRequest: {
      type: Object,
      default: () => ({})
    },
  },

  computed: {
    ...mapGetters('repositoryModule',[
      'getRepositoryById',
    ]),
    logoPath: function() {
      if (this.datasetRequest) {
        return "../../../../static/images/" + this.getRepositoryById(this.datasetRequest.repositoryId).logo
      }
      return ""
    },
    statusStr: function() {
      return this.datasetRequest.status.toUpperCase();
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
        'updateRequestModalVisible',
        'setRepositoryDescription',
      ]
    ),
    openInfoPanel: function(ev) {
      console.log(ev)
      this.$emit("open", ev)
      // this.updateRequestModalVisible(true)
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

.option-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 24px;
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
