<template>
  <div class="card-radio-group">
    <data-card
      class="dark round compact scrollable"
      :title="title"
    >
      <el-radio-group v-model="internalValue">
        <el-radio
          v-for="option in options"
          :key="option.value"
          class="right-radio"
          :label="option.value"
        >
          {{ option.label }}
        </el-radio>
      </el-radio-group>
    </data-card>
  </div>
</template>

<script>
  import DataCard from '../DataCard/DataCard.vue'

  export default {
    name: 'CardRadioGroup',

    components: {
      DataCard
    },

    props: {
      title: String,
      options: Array,
      value: [String, Number, Boolean]
    },

    computed: {
      // `v-model` works by binding a `value` and then
      // listening for "input" events. When layering
      // multiple `v-model` components, you need to emit
      // those "input" events back up the chain.
      internalValue: {
        get() { return this.value },
        set(val) { this.$emit('input', val) }
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .card-radio-group {
    .el-radio-group {
      width: 100%;
    }
    .el-radio {
      justify-content: space-between;
      margin: 0 0 8px;
      white-space: normal;
      width: 100%;
      &:last-child {
        margin: 0;
      }
    }
  }
</style>
