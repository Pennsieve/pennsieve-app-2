<template>
  <p
    v-if="publicationType === PublicationType.REVISION || publicationType === PublicationType.REMOVAL"
    class="sharing-blurb"
  >
    Your dataset {{ publicationType }} is under review by the Publishers within your organization.
  </p>
  <p
    v-else
    class="sharing-blurb"
  >
    Your dataset is under review by the Publishers within your organization.
  </p>
</template>

<script>
import { PublicationType } from '../../../../utils/constants'
export default {
  name: 'StatusRequested',
  props: {
    publicationType: {
      type: String,
      default: ''
    },
  },

  data() {
    return {
      PublicationType
    }
  },
}
</script>