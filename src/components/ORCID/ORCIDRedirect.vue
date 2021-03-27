<template>
  <div>
    <div
      v-loading.fullscreen.lock="loading"
    />
  </div>
</template>

<script>
  export default {
    name: 'ORCIDRedirect',
    data() {
      return {
        loading: true
      }
    },

    /**
     * The logic in this mounted function retrieves the
     * orcid code that is inserted in redirect url
     * and uses postMessage to send that code to
     * the parent window that had originally launched
     * this redirect window
     */
    mounted() {
      const search = window.location.search.substring(1)
      const code = search.substring(5, search.length)
      const parentWindow = window.opener
      parentWindow.postMessage(code.toString(), '*',)
      window.close()
    },
  }
</script>

<style scoped>

</style>