<template>
  <a
    class="getting-started-step"
    :href="link"
    target="_blank"
  >
    <div class="getting-started-step-img">
      <slot name="img" />
    </div>
    <div class="getting-started-step-copy">
      <h3>{{ heading }}</h3>
      <p>{{ copy }}</p>
    </div>
    <svg-icon
      class="icon-arrow"
      name="icon-arrow-up"
      dir="right"
      height="14"
      width="14"
    />
  </a>
</template>

<script>
export default {
  name: 'GettingStartedStep',

  props: {
    heading: {
      type: String,
      default: ''
    },
    copy: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';
@import '../../bf-navigation/bf-navigation.scss';
.getting-started-step {
  align-items: center;
  display: flex;
  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    h3 {
      color: $app-primary-color;
    }
  }
  h3 {
    color: #000;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    margin: 0;
  }
  .icon-arrow {
    color: $app-primary-color;
  }
}

p {
  color: $glial;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
}

.getting-started-step-img {
  margin-left: 12px;
  position: relative;
  text-align: center;
  width: 36px;
  .circle-icon {
    background: $nucleus;
    color: #fff;
    height: 16px;
    position: absolute;
    right: 0;
    top: 0;
    width: 16px
  }
}
.getting-started-step-copy {
  flex: 1;
  margin: 0 8px 0 20px;
  text-align: left;
}
</style>
