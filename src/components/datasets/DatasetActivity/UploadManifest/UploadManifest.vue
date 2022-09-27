<template>
  <div>
    <el-row
      type="flex"
      class="member"
      align="middle"
      :gutter="32"
    >
      <el-col
        :sm="1"
        class="member-col info"
      >
          <svg-icon
            class="toggle-files"
            name="icon-arrow-down"
            height="12"
            width="12"
            @click="toggleFiles"
            />

      </el-col>

      <el-col
        :sm="4"
        class="member-col info"
      >
        <avatar
          :user="getOrgMemberByIntId(item.user)"
          :tooltip="true"
        />
      </el-col>

      <el-col
        :sm="12"
        class="member-col"
      >
        {{ item.id }}
      </el-col>

      <el-col
        :sm="8"
        class="member-col col-spacer"
      >
      {{ formatDate(item.date_created*1000) }}
      </el-col>
      <el-col
        :sm="8"
        class="member-col col-spacer"
      >
      {{ item.status }}
      </el-col>
      <el-col
        :sm="2"
        class="member-col menu"
      >
        <el-dropdown
          trigger="click"
          placement="bottom-end"
          @command="handleCommand"
        >
          <span class="el-dropdown-link">
            <svg-icon
              name="icon-menu"
              height="20"
              width="20"
            />
          </span>
          <el-dropdown-menu
            slot="dropdown"
            :offset="9"
            class="bf-menu"
          >
            <el-dropdown-item
              command="remove"
              class="bf-menu-item"
            >
              Download
            </el-dropdown-item>
            <el-dropdown-item
              command="remove"
              class="bf-menu-item"
            >
              Archive
            </el-dropdown-item>
          </el-dropdown-menu>

        </el-dropdown>
      </el-col>
    </el-row>
    <div v-if="showFiles">
      <UploadManifestFiles

        :item="item"
      />
    </div>

  </div>

</template>

<script>
import Avatar from '../../../shared/avatar/Avatar'
import Request from '../../../../mixins/request'
import { mapGetters } from 'vuex'
import FormatDate from '../../../../mixins/format-date'
import UploadManifestFiles from "../UploadManifestFiles/UploadManifestFiles";

export default {
  name: 'UploadManifest',

  components: {
    UploadManifestFiles,
    Avatar
  },

  mixins: [
    Request,
    FormatDate

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

.el-dropdown {
  margin-left: 16px;
}

.el-dropdown-link {
  cursor: pointer;
}

.toggle-files {
  cursor: pointer;
}


</style>
