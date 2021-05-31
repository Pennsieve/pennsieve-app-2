<template>
  <div class="bf-select-input">
    <button @click="focusInput">
      <svg-icon
        class="icon"
        :name="iconName"
      />
    </button>

    <div class="inputWrap">
      <input
        id="input"
        ref="angleInput"
        v-model="localValue"
        v-autowidth="{maxWidth: '50px', minWidth: '10px', comfortZone: 0}"
        type="number"
        list="options"
        @blur="changeInput(localValue)"
      >
      <span v-if="dropdown === 'zoomOptions'">
        %
      </span>
      <span v-else>
        °
      </span>
      <button
        id="create-button"
        v-popover:navigatorMenu
        class="bf-navigation-item"
        :class="{ 'open': popoverMenuOpen, dropdownCarat: hasZoomOptions }"
      >
        <template>
          <svg-icon
            color="#71747C"
            class="icon-arrow"
            icon="icon-arrow-up"
            :dir="menuArrowDir"
            width="10"
            height="10"
          />
        </template>
      </button>

      <el-popover
        ref="navigatorMenu"
        v-model="popoverMenuOpen"
        popper-class="popoverMenu no-padding"
        placement="bottom"
        width="200"
        :offset="47"
        trigger="click"
        :visible-arrow="false"
      >
        <div class="bf-menu scroll-menu">
          <ul>
            <li
              v-for="(option, index) in options"
              :key="`option-${index}`"
              :value="option.value"
            >
              <a
                class="bf-menu-item"
                href="#"
                @click.prevent="changeDropdown(option.value)"
              >
                {{ option.label }}
              </a>
            </li>
          </ul>
        <!-- <option @click="changeDropdown"
          v-for="(option, index) in options"
          :key="`option-${index}`"
          :value="option.value"
        >
          {{option.label}}
        </option> -->
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
  import BfButton from '../bf-button/BfButton.vue';
  import EventBus from '../../../utils/event-bus.js'
  export default {
    name: 'BfSelectInput',
    components: {
      BfButton
    },
    props: {
      iconName: {
        type: String,
        default: "",
      },
      canCreate: {
        type: Boolean,
        default: true
      },
      options: {
        type: Array,
        default: () => []
      },
      selectedValue: {
        type: Number,
        default: 0
      },
      dropdown: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        popoverMenuOpen: false,
        localValue: 0
      }
    },

    computed: {
       /**
       * Compute the direction of the create arrow icon
       * @returns {String}
       */
      menuArrowDir: function() {
        return this.popoverMenuOpen ? 'up' : 'down'
      },
       /**
       * Check if the selectedValue in the dropdown has two digits
       * This will help determine the spacing styles of the percentage or degree symbol
       */
      hasTwoDigits: function(){
        return this.selectedValue > 0 && this.selectedValue < 100 ? true : false
      },
      /**
       * Check if the selectedValue in the dropdown has three digits
       * This will help determine the spacing styles of the percentage or degree symbol
       */
      hasThreeDigits: function() {
        return this.selectedValue >= 100 && this.selectedValue <= 999 ? true : false
      },

      /**
       * Check if the selectedValue in the dropdown has two digits
       * This will help determine the spacing of the percentage or degree symbol
       */
      hasZoomOptions: function() {
        return this.dropdown === 'zoomOptions' ? true : false
      }
    },

    watch: {
      /**
       * Updates the value of localValue to value of selectedValue prop
       */
      selectedValue: {
        handler: function(val){
          this.localValue = val
        },
        immediate: true
      }
    },
    methods: {
       /**
       * Focus on input
       */
      focusInput: function() {
         this.$refs.angleInput.focus()
      },
      /**
       * Listens for event change in dropdown. If the selected value in the
       * dropdown changes, we emit an event to update it with the new value
       * @param {Object} val
       */
      changeDropdown: function(val){
        this.dropdown === 'zoomOptions' ?  EventBus.$emit('update-value', {'type': 'zoom', 'value': val}) :
        EventBus.$emit('update-value', {'type': 'rotate', 'value': val})
        this.popoverMenuOpen = false
      },

       /**
       * Listens for event change in input. If a user enters a new input value,
       * we emit an event to update it with the new value
       * @NOTE: Number.NaN check is there to prevent empty field from displaying if user
       * types text and hits the enter key
       * @param {Object} val
       */
      changeInput: function(val){
        const num = parseInt(val)

        if (Number.isNaN(num)){
          this.dropdown === 'zoomOptions' ?  EventBus.$emit('update-value', {'type': 'zoom', 'value': 25}) :
          EventBus.$emit('update-value', {'type': 'rotate', 'value': 360})
        } else {
          this.dropdown === 'zoomOptions' ?  EventBus.$emit('update-value', {'type': 'zoom', 'value': num}) :
          EventBus.$emit('update-value', {'type': 'rotate', 'value': num})
        }
      }

    }
  }
</script>

<style scoped lang="scss">
  @import './../../../assets/_variables';
  option {
    color: #000;
    padding: 5px 3px;
    &:hover{
      background-color: #DADADA;
    }
  }

  .bf-select-input {
    margin-top: 6px;
    height: 27px;
    button {
      background-color: transparent;
      width: 24px;
      height: 24px;
      &:hover {
        background: transparent;
        .svg-icon {
          color: $gray_6;
        }
      }
    }


    .inputWrap {
      position: relative;
      padding-bottom: 5px;
      background: $white;
      border: 1px solid #BDBDBD;
      border-radius: 3px;
      box-sizing: border-box;
      cursor: default;
      min-width: 78px;
      padding: 2px 4px 5px 1px;
      left: 37px;
      height: 30px;
      display: flex;
      flex-direction: row;
      flex: 1;
      bottom: 2px;

      button {
        right: 6px;
        top: 3px;
        left: 36px;
        display: inline-block;
        flex-direction: row-reverse;
        flex: 1;
      }

      span {
        padding-top: 4px;
      }

      .dropdownCarat {
        left: 30px;
        top: 0px;
        display: inline-block;
        flex: 1;
        flex-direction: row-reverse;
        padding-left: 29px;
        padding-right: 0px;
      }

    }

    #input {
      background: none;
      border: none;
      font: inherit;
      padding: 0;
      padding-top: 4px;
      width: 40px;
    }

    // to remove up and down arrows from input
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

  }
  .svg-icon {
    color: $gray_6;
    height: 27px;
    margin-right: 5px;
    padding: 0;
    width: 24px;
    background-color: transparent;
  }
</style>

<style lang="scss">
  @import '../../../assets/_variables';

  .popoverMenu.el-popover {
    margin-top: 3px;
    margin-left: 6px;
  }

  .bf-select-input {
    #input {
      margin-left: 5px;
      padding-right: 0px;
      padding-left: 5px;
    }
}

</style>
