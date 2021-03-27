<template>
  <div class="side-drawer">
    <div :class="['drawer', visible ? 'is-open' : '', {'half-width': isReviewersDrawer}]">
      <div :class="['header', headingBorder ? 'has-border' : '']">
        <h1>{{ heading }}</h1>
        <div class="copy">
          <slot name="copy" />
        </div>
      </div>
      <div class="container body">
        <slot name="body" />
      </div>
      <div class="container footer">
        <div class="buttons">
          <slot name="buttons" />
        </div>
        <div
          v-if="showCancelButton"
          class="cancel-button"
        >
          <a
            href="#"
            @click.prevent="close"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
    <transition
      v-if="visible"
      name="fade"
    >
      <div
        id="menu-overlay"
        @click="close"
      />
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SideDrawer',

  props: {
    headingBorder: {
      type: Boolean,
      default: false
    },
    showCancelButton: {
      type: Boolean,
      default: false
    },
    heading: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isReviewersDrawer: function() {
      if (this.heading === 'Assign Reviewers'){
        return true
      }
      return false
    }
  },

  methods: {
    /**
     * Emits an event to close the side drawer
     * @param {Object} evt
     */
    close: function(evt) {
      evt.preventDefault()
      this.$emit('close-side-drawer')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/variables';

.drawer {
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 70%;
  transform: translate3d(100%, 0, 0);
  transition: transform .3s ease-out;
  z-index: 199;

  &.is-open {
    box-shadow: -17px 2px 100px rgba(64,69,84,0.22);
    transform: translate3d(0, 0, 0);
  }

  &.half-width {
    width: 610px;
  }
}

h1 {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  line-height: 40px;
}

.container {
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
}

.header {
  padding: 32px 16px 16px 16px;

  &.has-border {
    border-bottom: solid 1px $cortex;
  }
}

.copy {
  font-size: 18px;
  line-height: 24px;
  color: $dark-gray;
}

.body {
  flex: 1;
  align-items: flex-start;
  overflow-x: hidden;
  overflow-y: auto;
}

.footer {
  border-top: solid 1px $cortex;
  height: 88px;

  .buttons {
    display: flex;
    flex: 1;
  }

  .secondary {
    margin-right: 8px;
  }

  .cancel-button {
    margin-right: 30px;
  }
}
#menu-overlay {
  background-color: rgba(0,0,0,0.25);
  bottom: 0;
  cursor: pointer;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 198;
}
</style>
