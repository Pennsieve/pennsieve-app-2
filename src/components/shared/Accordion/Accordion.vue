<template>
  <div class="accordion">
    <div class="accordion-trigger">
      <a
        href="#openAccordion"
        class="toggle"
        :style="{ borderLeft: `solid 5px ${borderColor}` }"
        @click.capture="toggle"
      >
        <svg-icon
          v-show="!isIconHidden"
          class="toggle-icon"
          height="6"
          width="10"
          icon="icon-arrow-up"
          :dir="iconDir"
        />

        <h3 :class="{selected: selected}">{{ title }}</h3>
      </a>

      <slot name="title" />
    </div>

    <div v-if="open">
      <slot name="items" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Accordion',

  props: ['icon', 'borderColor', 'title', 'selected'],

  data: function() {
    return {
      openOnLoad: false,
      open: false
    }
  },

  computed: {
    isIconHidden: function() {
      return !this.icon || this.icon.length === 0;
    },
    toggleStyles: function() {
      return this.borderColor && this.borderColor.length > 0 ? `border-left: solid 5px ${this.borderColor};` : '';
    },
    iconDir: function() {
      return this.open ? 'down' : 'right'
    }
  },

  methods: {
    /**
     * toggles opened property true/false
     * @param {Event} evt
     */
    toggle: function(evt) {
      this.open = !this.open
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables.scss';

  .accordion {
    background: $dendrite;
    color: #000;
    font-size: 12px;
    text-decoration: none;
    white-space: nowrap;
    &:hover {
      background: #fff;
    }
  }
  .accordion-trigger {
    align-items: center;
    border-bottom: solid 1px $cortex;
    display: flex;
    flex-direction: row;
  }
  .toggle-icon {
    margin-right: 4px;
  }
  a {
    align-items: center;
    color: $text-color;
    display: flex;
    flex: 1;
    height: 34px;
    padding-left: 10px;
    text-decoration: none;
  }
  h3 {
    font-size: 12px;
    font-weight: 500;
    line-height: 17px;
    margin: 0;
    
  }
  .selected {
      color: #295eff
    }
  bf-annotation-group {
    flex: 0;
    flex-shrink: unset;
  }
</style>
