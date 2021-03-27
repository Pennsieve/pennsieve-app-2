<template>
  <div>
    <el-row
      type="flex"
      class="team"
      :gutter="32"
    >
      <el-col
        :sm="17"
        class="team-col"
      >
        <div class="team-info">
          <circle-icon
            class="team-avatar"
            icon="icon-team"
          />
          <div class="team-details">
            <div class="name">
              <router-link
                v-if="!removeFromList"
                :to="{ name: 'team-members-list', params: { id: createTeamId(item) }}"
              >
                {{ teamName }}
              </router-link>
              <span v-if="removeFromList">
                {{ teamName }}
              </span>
            </div>
            <div class="members">
              {{ memberCount }}
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :sm="17"
        class="team-col"
      >
        <div class="team-info">
          <div class="team-details">
            <div class="members">
              <span>{{ systemTeamType }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :sm="7"
        class="align-right"
      >
        <button
          v-if="removeFromList"
          class=""
          @click="openDeleteDialog(item)"
        >
          <svg-icon
            name="icon-remove"
            class="tools"
            height="10"
            width="10"
          />
        </button>
        <el-dropdown
          v-if="hasAdminRights"
          trigger="click"
          placement="bottom-end"
          @command="onTeamMenu"
        >
          <span class="btn-file-menu el-dropdown-link">
            <svg-icon
              name="icon-menu"
              height="20"
              width="20"
            />
          </span>
          <el-dropdown-menu
            slot="dropdown"
            class="bf-menu"
            :offset="9"
          >
            <el-dropdown-item command="changeRoute">
              Update team
            </el-dropdown-item>
            <el-dropdown-item
              v-if="!systemTeamType"
              command="openDeleteDialog"
            >
              Delete team
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
@import '../../../assets/variables';

.team {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  a {
    cursor: pointer;
  }

  .name {
    color: #000;
    font-weight: 600
  }
}

.team-col {
  display: flex;
  align-items: center;
}

.team-info {
  display: flex;
  align-items: center;
}

.team-avatar {
  margin-right: 16px;
}
</style>

<script src="./team.js"></script>
