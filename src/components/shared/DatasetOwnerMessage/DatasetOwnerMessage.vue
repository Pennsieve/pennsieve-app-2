<template>
  <div
    v-if="displayOwnerMessage"
    class="owner-message"
  >
    <slot name="img" />
    <h3>{{ title }}</h3>
    <slot name="copy" />
    <slot name="button" />
    <slot name="link" />
    <p v-if="!hideGotIt">
      <a
        class="got-it"
        href="#"
        @click.prevent="gotIt"
      >
        Got It
      </a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'DatasetOwnerMessage',

  props: {
    displayOwnerMessage: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    hideGotIt: {
      type: Boolean,
      default: false
    },
  },

  methods: {
    /**
     * Emits custom event
     * @param {Object} evt
     */
    gotIt: function(evt) {
      evt.preventDefault()
      this.$emit('got-it')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables';

.owner-message {
 // background: rgba(233,237,246,0.2);
  align-items: center;
  border: dashed 2px #DADADA;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  margin-bottom: 32px;
  padding: 103px 56px;
  position: relative;
  text-align: center;

  .buttonLink:hover {
    text-decoration: none;
  }

  p {
    margin: 0;
    max-width: 570px;
    padding: 0 24px;

    a {
      &:hover, &:focus {
        text-decoration: none;
      }
    }
  }

  h3 {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
  }

  .learn-more-button {
    margin: 16px 0;
  }
}
</style>