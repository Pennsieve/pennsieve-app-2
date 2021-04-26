<template>
  <bf-page class="create-org">
    <img
      src="/static/images/illustrations/illo-research-platform.svg"
      alt="Patient Data"
      width="446"
      height="220"
    >
    <h2>Restricted Access</h2>
    <p>You must create a new organization in order to access this feature on the platform. </p>
    <a :href="takeMeHomeLink">
      <bf-button class="primary">
        Create Organization
      </bf-button>
    </a>
  </bf-page>
</template>

<script>
import BfButton from '@/components/shared/bf-button/BfButton.vue'
  export default {
    name: 'CreateOrg',
    components: {
      BfButton,
    },
  }
</script>

<style lang="scss" scoped>
.create-org {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h2 {
  font-size: 22px;
  line-height: 26px;
  font-weight: bold;
  margin-right: 30px;
}

p {
  margin-bottom: 20px;
}

img {
  margin-top: -125px;
  margin-bottom: 20px;
}

.bf-button {
  margin-right: 30px;
}
</style>