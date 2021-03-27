<template>
  <div>
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'A11yKeys',

    props: {
      // key name, ie, enter
      keyName: {
        type: String,
        default: 'enter'
      },
      // name of event to capture; defaults to key-pressed
      eventName: {
        type: String,
        default: 'key-pressed'
      }
    },

    data() {
      return {
        // key name map to key codes
        keyMap: {
          'enter': 13
        }
      }
    },

    mounted() {
      this.$slots.default.forEach(vnode => {
        vnode.elm.addEventListener('keypress', this.handleKeyPress.bind(this))
      })
    },

    methods: {
      /**
       * Handles key press event
       * @param {Object} evt
       */
      handleKeyPress: function(evt) {
        if (this.keyMap[this.keyName] !== evt.keyCode) {
          return
        }
        // emit an event name with event payload for parent component to capture
        this.$emit(this.eventName, evt)
      }
    }
  }
</script>
