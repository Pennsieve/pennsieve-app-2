<template>
  <div>
    <el-row
      type="flex"
      class="member"
      align="middle"
      :gutter="40"
    >

      <el-col
        :sm="20"
        class="member-col"
      >
        <img
          class="svg-icon icon-item mr-16"
          :src="fileIcon(item.icon, item.file_type)"
        >
        {{ item.file_path }}/{{item.file_name}}
      </el-col>
      <el-col
        :sm="8"
        class="member-col col-spacer"
      >
      {{ item.file_type }}
      </el-col>
      <el-col
        :sm="12"
        class="member-col col-spacer"
      >
      {{ item.status}}
      </el-col>
      <el-col
        :sm="8"
        class="member-col col-spacer"
      />
    </el-row>
  </div>

</template>

<script>
import Avatar from '../../../shared/avatar/Avatar'
import Request from '../../../../mixins/request'
import { mapGetters } from 'vuex'
import FormatDate from '../../../../mixins/format-date'
import UploadManifestFiles from "../UploadManifestFiles/UploadManifestFiles";
import FileIcon from '../../../../mixins/file-icon/index'

export default {
  name: 'UploadManifestFile',

  components: {
  },

  mixins: [
    Request,
    FormatDate,
    FileIcon

  ],

  props: {
    item: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },

  data() {
    return {
      showFiles: false
    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'config',
      'userToken',
      'profile',
      'hasFeature',
      'getOrgMemberByIntId'
    ]),

    fileIconStr: function() {
      return this.toPackageType(this.item.file_type)
    }
  },

  methods: {

    toggleFiles: function() {
      this.showFiles = !this.showFiles
    },

    /**
     * Handles dropdown menu selections
     * @param {String} memberId
     */
    handleCommand: function(command) {
      const commands = {
        // 'remove': () => this.removeMember(this.item),
        // 'promote-admin': () => this.setAdminStatus(this.item, 'administer'),
        // 'demote-admin': () => this.setAdminStatus(this.item, 'delete'),
        // 'reset-password': () => this.resetPassword(this.item),
        // 'edit-member': () => this.editMember(this.item)
      }
      if (typeof commands[command] === 'function') {
        commands[command]()
      }
    },
  }
}
</script>


<style scoped lang="scss">
@import '../../../../assets/variables';

.member-col {
  color: $gray_4;
  al

  &.menu {
    display: flex;
    justify-content: flex-end;
  }
}

.no-shrink {
  flex-shrink: 0;
}

.member {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0
}

.member-status {
  display: inline-block;
  text-transform: uppercase;
  border: solid 1px transparent;
  border-radius: 2px;
  font-size: 10px;
  line-height: 24px;
  height: 24px;
  width: 57px;
  text-align: center;
  margin-right: 16px;

  &.pending {
    color: #634B09;
    background-color: #FFC727;
  }
  &.expired {
    color: #404554;
    background-color: #BDBDBD;
  }
}

.svg-icon.menu {
  height: 8px;
  width: 24px;
}

.svg-icon {
  flex-shrink: 0;
  height: 24px;
  width: 24px;
}

.el-dropdown {
  margin-left: 16px;
}

.el-dropdown-link {
  cursor: pointer;
}
</style>
