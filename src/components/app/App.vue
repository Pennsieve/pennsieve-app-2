<template>
  <div id="app">
    <div id="app-wrap">
      <router-view name="header" />

      <div id="main-wrap">
        <router-view
          v-show="primaryNavOpen"
          name="navigation"
        />
        <router-view
          v-show="secondaryNavOpen"
          name="navigationSecondary"
        />
        <router-view
          id="page"
          name="page"
        />
      </div>
    </div>

    <blackfynn-app
      ref="blackfynnApp"
      class="visually-hidden"
      :is-uploading="$store.state.uploading"
    />

    <bf-upload ref="bfUpload" />

    <bf-feedback />
    <bf-analytics />
    <check-active-user />
    <bf-notifications />
    <bf-download-file ref="downloadFile" />
    <bf-upload-external-file
      :visible="isUploadExternalFileModalOpen"
      :external-file="externalFile"
    />
    <search-all-data
      :visible.sync="searchModalVisible"
    />

    <office-365-dialog />

    <link-orcid-dialog
      v-if="userToken"
      :visible.sync="isLinkOrcidDialogVisibleWrapper"
    />
  </div>
</template>

<script src="./app.js"></script>

<style lang="scss">
  @import '../../assets/_variables.scss';
  @import '../../assets/_svg-icon';

  html, body {
    font-family: $system-font;
    font-size: 14px;
    line-height: 17px;
  }

  body {
    background-color: $gray_1;
    color: $text-color;
    margin: 0;
    min-height: 100vh;
  }
  // Hide only visually, but have it available for screenreaders: h5bp.com
  .visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .login-form {
    @extend .visually-hidden;
  }

  #app-wrap {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  #main-wrap {
    display: flex;
    flex: 1;
    flex-direction: row;
    overflow: hidden;
  }

  #page {
    flex: 1;
    overflow: auto;
  }
</style>
