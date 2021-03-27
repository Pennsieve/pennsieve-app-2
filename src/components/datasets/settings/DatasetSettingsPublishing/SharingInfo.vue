<template>
  <p
    class="sharing-info"
  >
    While under review by the Publishers within your organization, this dataset will become locked until it has either been approved or
    rejected. You will be notified via email throughout this process and can also view the status on the
    <router-link
      :to="{ name: 'publishing', params: {datasetSettingsPage: true} }"
    >
      Publish Management
    </router-link>
    page.
  </p>
</template>

<script>
import { PublicationTabs } from '@/utils/constants';

export default {
  computed: {
    PublicationTabs: function() {
      return PublicationTabs
    }
  }
}
</script>
