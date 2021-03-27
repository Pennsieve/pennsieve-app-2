<template>
  <a
    class="pill-link"
    :href="href"
    :target="target"
  >
    <slot />
    <span
      v-if="this.$slots['suffix']"
      class="suffix"
    >
      <slot name="suffix" />
    </span>
  </a>
</template>

<script>
  export default {
    name: 'PillLink',

    props: {
      href: {
        type: String,
        default: ''
      },
      target: {
        type: String,
        default: ''
      },
    }
  }

</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .pill-link {
    background-color: $dendrite-dark;
    border-radius: 3px;
    color: $dark-gray;
    display: block;
    font-size: 12px;
    padding: 8px 16px;
    &:hover, &:focus {
      color: $app-primary-color;
      text-decoration: none;
    }
    .suffix {
      font-weight: 600;
      margin-left: 8px;
    }
  }
</style>
