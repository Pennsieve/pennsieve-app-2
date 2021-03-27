<template>
  <div>
    <div class="sharing-status mb-8">
      <bf-waiting-icon class="icon-status" />

      <strong>Publishing to Blackfynn Discover</strong>
    </div>

    <p class="sharing-info publishing">
      Publishing times can vary based on the size of your dataset. Your dataset will remain locked until publishing has completed.
    </p>
  </div>
</template>

<script>
import BfWaitingIcon from '@/components/shared/bf-waiting-icon/bf-waiting-icon.vue'
export default {
  components: {
    BfWaitingIcon
  }
}
</script>