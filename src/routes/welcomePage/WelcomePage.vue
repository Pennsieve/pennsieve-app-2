<template>
  <router-view
    name="stage"
    :repositories="repositories"/>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "WelcomePage",
  computed: {
    ...mapState('repositoryModule', [
      'repositories'
    ]),
  }
}
</script>