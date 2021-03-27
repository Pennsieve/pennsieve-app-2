<template>
  <div class="pdf-paginator">
    <template v-if="pageCount">
      <input
        id="pageNumber"
        :value="value"
        min="1"
        :max="pageCount"
        type="number"
        class="toolbarField pageNumber"
        size="4"
        @input="input"
        @blur="populateInput"
      > / <span>{{ pageCount }}</span>
    </template>
    <input
      v-else
      type="number"
    >
  </div>
</template>

<script>
export default {
  name: 'PDFPaginator',

  props: {
    value: Number,
    pageCount: Number,
  },

  watch: {
    /**
     * Watcher that emits an event if pagecount value changes
     */
    pageCount() {
      this.$emit('input', 1)
    },
  },

  methods: {
    /**
     * Emits an event that parses the value of the input entered in the
     * paginator in the toolbar
     */
    input(event) {
      this.$emit('input', parseInt(event.target.value, 10))
    },
    /**
     * Makes sure the input field is populated with current
     * page value if user clicks outside the input
     */
    populateInput(){
      this.value = this.value
    }
  }
}
</script>

<style scoped lang="scss">

@import './viewertoolbar.scss';

.pdf-paginator {
  color: white;
  font-weight: bold;
  float: right;
}
.pdf-paginator input {
  width: 2em;
  padding: 0.3em;
}

</style>
