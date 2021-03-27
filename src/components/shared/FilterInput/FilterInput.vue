<template>
  <div class="filter-input">
    <svg-icon
      slot="prefix"
      class="mr-8"
      name="icon-magnifying-glass"
      dir="up"
      height="24"
      width="24"
    />

    <input
      ref="input"
      :placeholder="placeholder"
      :value="value"
      @input="$emit('input', $event.target.value)"
    >
  </div>
</template>

<script>
export default {
  name: 'FilterInput',

  props: {
    placeholder: String,
    value: String
  },

  methods: {
    /**
     * Focus on input
     */
    focus: function() {
      this.$refs.input.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .filter-input {
    align-items: center;
    border-bottom: 1px solid $cortex;
    display: flex;
    flex-shrink: 0;
    height: 48px;
    padding: 0 16px;
    input {
      border: none;
      flex: 1;
      font-size: inherit;
      height: 100%;
      margin: 0;
      outline: none;
      padding: 0;
      &::placeholder {
        color: $glial
      }
    }
    .svg-icon {
      color: $glial;
      height: 16px;
      width: 16px;
    }
  }
</style>
