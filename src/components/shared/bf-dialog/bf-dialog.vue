<template>
  <div
    class="bf-dialog"
    :class="[ open ? 'open' : '' ]"
  >
    <div class="bf-dialog-wrap">
      <div class="bf-dialog-header">
        <h2>{{ title }}</h2>
        <iron-icon
          class="icon-close"
          icon="blackfynn:close"
          @click="close"
        />
      </div>

      <div class="bf-dialog-body">
        <slot name="body" />
      </div>

      <div
        v-if="hasFooterSlot"
        class="bf-dialog-footer"
      >
        <slot name="footer" />
      </div>
    </div>
    <div
      class="overlay"
      @click="onOverlayClick"
    />
  </div>
</template>

<script>
  export default {
    name: 'BfDialog',

    props: {
      title: {
        type: String,
        default: ''
      },
      open: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      hasFooterSlot: function () {
        return !!this.$slots['footer']
      }
    },

    methods: {
      close () {
        this.$emit('close')
      },

      onOverlayClick: function () {
        this.close();
        this.$emit('overlay-click')
      }
    }
  }
</script>

<style lang="scss">
  .bf-dialog {
    &.open {
      .bf-dialog-wrap {
        display: flex;
      }
      .overlay {
        opacity: 0.6;
        pointer-events: auto;
      }
    }
    .overlay {
      background-color: #000;
      height: 100%;
      left: 0;
      opacity: 0;
      pointer-events: none;
      position: fixed;
      top: 0;
      transition: opacity 0.2s;
      width: 100%;
      z-index: 200;
    }
    .bf-dialog-wrap {
      background: #fff;
      border-radius: 5px;
      box-shadow: 0 2px 15px 0 rgba(0,0,0,0.25), 0 28px 41px 0 rgba(33,43,54,0.2);
      display: none;
      flex-direction: column;
      height: 440px;
      margin: -220px 0 0 -270px;
      overflow: hidden;
      position: fixed;
      top: 50%;
      left: 50%;
      width: 540px;
      z-index: 201;
    }
    .bf-dialog-header, .bf-dialog-body, .bf-dialog-footer {
      padding: 20px;
    }
    .bf-dialog-header {
      align-items: center;
      border-bottom: 1px solid #DADADA;
      display: flex;
      flex-direction: row;
      padding: 20px 14px 20px 20px;
      h2 {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
        margin: 0;
      }
      .icon-close {
        align-self: flex-end;
        color: #71747C;
        cursor: pointer;
      }
    }
    .bf-dialog-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
    .bf-dialog-footer {
      border-top: 1px solid #DADADA;
      display: flex;
      flex-direction: row;
      button {
        margin-left: 10px;
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
</style>
