<template>
  <bf-page class="publishing-page">
    <locked-banner
      slot="banner"
    />
    <bf-rafter slot="heading">
      <h1
        slot="heading"
        class="flex-heading"
      >
        Publishing
      </h1>

      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li>
          <router-link :to="{ name: 'publishing' }">
            Publishing
          </router-link>
        </li>
      </ul>
    </bf-rafter>

    <bf-stage
      slot="stage"
      :fullscreen="true"
    >
      <router-view name="stage" />
    </bf-stage>
  </bf-page>
</template>

<script>

import BfRafter from '../shared/bf-rafter/BfRafter.vue'

export default {
  name: 'PublishingPage',

  components: {
    BfRafter,
  },

  data() {
    return {
    }
  },

  methods: {
  }
}
</script>

<style lang="scss">
@import '../../assets/_variables.scss';

</style>
