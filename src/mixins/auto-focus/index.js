export default {
  methods: {
    autoFocus: function() {
      this.$nextTick(() => {
        const autoFocusFields = document.querySelectorAll('[autofocus]')
        autoFocusFields.forEach(field => field.focus())
      })
    }
  }
}