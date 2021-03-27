<template>
  <div
    class="tag-pill"
    :style="{ borderColor: indicatorColor }"
  >
    <span
      v-if="hasIndicator"
      class="indicator"
      :style="{ backgroundColor: indicatorColor }"
    />
    <slot name="prefix" />
    <p>
      {{ label }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'TagPill',

  props: {
    hasIndicator: {
      type: Boolean,
      default: true
    },
    indicatorColor: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss">
@import '../../../assets/_variables.scss';

.tag-pill {
  align-items: center;
  border: 1px solid $glial;
  border-radius: 3px;
  box-sizing: border-box;
  color: $glial;
  display: flex;
  font-size: 12px;
  line-height: 18px;
  max-width: 160px;
  padding: 3px 6px;

  p {
    overflow: hidden;
    margin: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .indicator {
    background-color: $glial;
    border-radius: 50%;
    flex-shrinK: 0;
    height: 8px;
    margin-right: 6px;
    width: 8px;
  }
}
</style>
