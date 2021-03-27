<template>
  <div class="sharing-menu-item">
    <div class="sharing-menu-item-icon">
      <svg-icon
        class="share-button-icon"
        :icon="icon"
        height="20"
        width="20"
      />
    </div>
    <div class="sharing-menu-item-details">
      <div class="sharing-menu-item-details--title">
        {{ title }}
      </div>
      <div class="sharing-menu-item-details--text">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.sharing-menu-item {
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 66px;
  justify-content: space-between;
}
.sharing-menu-item-details--title {
  font-weight: 600;
}
.sharing-menu-item-icon {
  width: 36px;
}
.sharing-menu-item-details {
  flex: 2;
}
</style>

<script>
export default {
  name: 'SharingMenuItem',

  props: {
    icon: String,
    title: String,
    text: String
  }
}
</script>