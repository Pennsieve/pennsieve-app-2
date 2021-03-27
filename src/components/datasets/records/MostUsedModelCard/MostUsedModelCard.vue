<template>
  <div class="most-used-model-card">
    <router-link
      ref="label"
      class="label"
      :to="{
        name: 'concept-search',
        params: {
          conceptId: model.id
        }
      }"
    >
      {{ model.displayName }}
    </router-link>
    {{ formatNumber(model.count) }} Records
  </div>
</template>

<script>
  import debounce from 'lodash/debounce'

  export default {
    name: 'MostUsedModelCard',

    props: {
      model: {
        type: Object,
        default: () => {}
      }
    },

    methods: {
      formatNumber: (number) => new Intl.NumberFormat('en-EN').format(number)
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../../assets/_variables.scss';

  .most-used-model-card {
    border: 1px solid $dendrite-dark;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
    padding: 8px;
    margin-bottom: 8px;
    margin-right: 8px;
    min-width: 88px;
    max-width: 256px;
    &.truncated {
      background: red;
    }
    .label {
      display: block;
      font-size: 14px;
      font-weight: 400;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
