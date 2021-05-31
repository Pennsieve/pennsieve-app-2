<template>
  <div class="dataset-discover-checklist-item">
    <div class="icon-link-wrap">
      <svg-icon
        class="mr-8"
        :class="icon"
        :name="icon"
        height="20"
        width="20"
      />

      <div class="link-wrap mr-8">
        <router-link
          v-if="showLink"
          :to="route"
          @click.native="$emit('click-link', $event)"
        >
          {{ cta }}
        </router-link>

        <strong v-else>
          {{ cta }}
        </strong>

        &nbsp; &mdash;
      </div>
    </div>

    <div class="description">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ChecklistItem',

    props: {
      icon: {
        type: String,
        default: ''
      },
      cta: {
        type: String,
        default: ''
      },
      route: {
        type: Object,
        default: () => {
          return {}
        }
      },
      showLink: {
        type: Boolean,
        default: true
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './src/assets/_variables.scss';

  .dataset-discover-checklist-item {
    align-items: center;
    border-top: 1px solid $gray_2;
    display: flex;
    padding: 10px 16px;
    &:first-child {
      border: none;
    }
    a {
      font-weight: 600;
    }
  }
  .icon-link-wrap {
    align-items: center;
    display: flex;
  }
  .icon-done-check-circle {
    color: #017c39
  }
  .svg-icon {
    flex-shrink: 0;
  }
  .description {
    flex: 1;
  }
</style>
