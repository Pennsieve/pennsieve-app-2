<template>
  <div class="tool-wrap">
    <bf-select-input
      :icon-name="name"
      :options="rotationValues"
      :selected-value="angle"
      :dropdown="'rotationOptions'"
    />

    <bf-button-group class="button-group">
      <BfButton @click="setAngle('subtract')">
        <svg-icon
          class="icon"
          name="icon-rotate-left"
        />
      </BfButton>
      <BfButton @click="setAngle('add')">
        <svg-icon
          class="icon"
          name="icon-rotate-right"
        />
      </BfButton>
    </bf-button-group>
  </div>
</template>

<script>
  import BfButtonGroup from '../../shared/bf-button/BfButtonGroup.vue'
  import BfButton from '../../shared/bf-button/BfButton'
  import BfSelectInput from '../../shared/bf-select-input/BfSelectInput.vue'
  import EventBus from '../../../utils/event-bus.js'
  export default {
    name: 'BfRotateTool',

    components: {
      BfButtonGroup,
      BfButton,
      BfSelectInput
    },

    props: {
      angle: {
        type: Number,
        default: 0
      },
    },

    data() {
      return {
        rotationAmount: 10,
        rotationValues: [{
            label: '0°',
            value: 0
          },
          {
            label: '45°',
            value: 45
          },
          {
            label: '90°',
            value: 90
          },
          {
            label: '135°',
            value: 135
          },
          {
            label: '180°',
            value: 180
          },
          {
            label: '225°',
            value: 225
          },
          {
            label: '270°',
            value: 270
          },
          {
            label: '315°',
            value: 315
          }
        ],
        name: "icon-rotate"
      }
    },

    methods: {
       /**
       * Computes the degree of rotation for the slide viewer and
       * emits an event that updates the value of that angle
       * @param {String} val
       */
      setAngle: function(val) {
        let computedAngle = R[val](this.angle, this.rotationAmount)
        if (computedAngle < 0) {
          computedAngle = 360 - this.rotationAmount
        } else if (computedAngle >= 360) {
          computedAngle = 0
        }
        EventBus.$emit('change-viewer-angle', Math.abs(computedAngle))
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../assets/_variables';

  .button-group .bf-button {
    background-color: $gray_2;
    border: 1px solid $gray_2;
    border-left: none;
    height: 28px;
    padding: 4px;
    width: 26px;
    min-width: 0;
    &:hover, &:focus {
      background: #f9f9f9;
    }
    &:first-child {
      border-left: 1px solid $gray_2;
      border-radius: 3px 0 0 3px;
    }
    &:last-child {
      border-radius: 0 3px 3px 0;
    }
  }

  .tool-wrap {
    align-items: center;
    display: flex;
  }

  .icon {
    color: $gray_6;
  }
</style>

<style lang="scss">
  .tool-wrap {
    .bf-select-input {
      .inputWrap {
        bottom: 30px;
        button {
          padding-right: 0;
          padding-left: 5px;
          .svg-icon {
            margin-left: 15px;
          }
        }
      }
    }
  }
</style>


