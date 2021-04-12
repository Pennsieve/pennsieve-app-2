<template>
  <div class="bf-tag">
    {{ label }}
    <button
      type="button"
      @click="$emit('remove')"
    >
      <svg-icon
        name="icon-remove"
        height="10"
        width="10"
        color="#000"
      />
    </button>
  </div>
</template>

<script>
export default {
  name: 'BfTag',

  props: {
    label: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.bf-tag {
  align-items: center;
  background: $gray_2;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  line-height: 1;
  padding: 8px;
  button {
    align-items: center;
    display: flex;
    margin-left: 8px;
  }
}
</style>
