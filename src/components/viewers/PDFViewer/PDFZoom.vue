<template>
  <div>
    <div class="splitToolbarButton">
      <button
        id="zoomOut"
        :disabled="isDisabled"
        class="toolbarButton zoomOut"
        title="Zoom Out"
        tabindex="21"
        data-l10n-id="zoom_out"
        @click.prevent.stop="zoomOut"
      >
        <span data-l10n-id="zoom_out_label">
          Zoom Out
        </span>
      </button>
      <div class="splitToolbarButtonSeparator" />
      <button
        id="zoomIn"
        :disabled="isDisabled"
        class="toolbarButton zoomIn"
        title="Zoom In"
        tabindex="22"
        data-l10n-id="zoom_in"
        @click.prevent.stop="zoomIn"
      >
        <span data-l10n-id="zoom_in_label">
          Zoom In
        </span>
      </button>
    </div>
    <span
      id="scaleSelectContainer"
      class="dropdownToolbarButton"
    >
      <select
        id="scaleSelect"
        v-model="zoomType"
        title="Zoom"
        tabindex="23"
        @change="zoomSelection(zoomType)"
      >
        <option
          v-for="item in zoomOptions"
          :key="item.value"
          :hidden="item.hidden"
          :value="item.value"
        >
          {{ item.text }}
        </option>
      </select>
    </span>
  </div>
</template>

<script>
import { propEq, when, assoc } from 'ramda'

export default {
  name: 'PDFZoom',

  props: {
    scale: {
      type: Number,
    },
    increment: {
      type: Number,
      default: 0.1,
    },
  },

  data(){
    return {
      zoomType: 'automatic',
      zoomOptions: [
        {text: 'Automatic Zoom', value: 'automatic', hidden: false},
        {text: 'Actual Size', value: 'actual size', hidden: false},
        {text: 'Page Fit', value: 'page fit', hidden: false},
        {text: 'Page Width', value: 'page width', hidden: false},
        {text: 'hidden', value: 'hidden item', hidden: true},
        {text: '50%', value: '50%', hidden: false},
        {text: '75%', value: '75%', hidden: false},
        {text: '100%', value: '100%', hidden: false},
        {text: '125%', value: '125%', hidden: false},
        {text: '150%', value: '150%', hidden: false},
        {text: '200%', value: '200%', hidden: false},
        {text: '300%', value: '300%', hidden: false},
        {text: '400%', value: '400%', hidden: false}
      ]
    }
  },

  computed: {
    /**
     * Disables zoom buttons on toolbar if you can no longer scale the PDF any further
     * @returns {Boolean}
     */
    isDisabled() {
      return !this.scale
    }
  },

  methods: {
    /**
     * Zoom in functionality for PDF
     */
    zoomIn() {
      const newScale = this.scale + this.increment
      this.updateScale(newScale)
      this.zoomOptions = this.zoomOptions
        .map(when(propEq('value', 'hidden item'), assoc('text', Math.round(newScale*100)+"%")))
      this.zoomType = 'hidden item'
    },

    /**
     * Zoom out functionality for PDF
     */
    zoomOut() {
      if (this.scale <= this.increment) {
        return
      }
      const newScale = this.scale - this.increment
      this.updateScale(newScale)
      this.zoomOptions = this.zoomOptions
        .map(when(propEq('value', 'hidden item'), assoc('text', Math.round(newScale*100)+"%")))
      this.zoomType = 'hidden item'
    },

    /**
     * Emits an event that updates the PDF scale with a new value
     */
    updateScale(scale) {
      this.$emit('change', {scale})
    },

    /**
     * Emits an event that executes the scaling for PDF to fit the width
     * of the screen/actual PDF width
     */
    fitWidth() {
      this.$emit('fit', 'width')
    },

    /**
     * Emits an event that executes the scaling for PDF for auto size
     */
    fitAuto() {
      this.$emit('fit', 'auto')
    },

    /**
     * Executes a function based on zoom option selected from toolbar dropdown
     * Default case is for all the percentage values
     * @param {String} zoomType
     */
    zoomSelection(zoomType) {
      switch(zoomType){
        case 'automatic':
          this.fitAuto()
          break
        case 'actual size':
          this.$emit('fit', zoomType)
          break
        case 'page fit':
          this.$emit('fit', zoomType)
          break
        case 'page width':
          this.fitWidth()
          break
        default:
          this.$emit('fit', zoomType)
          break

      }
    }
  }
}
</script>

<style scoped lang="scss">
@import './viewertoolbar.scss';

.pdf-zoom a {
  float: left;
  cursor: pointer;
  display: block;
  border: 1px #333 solid;
  background: white;
  color: #333;
  font-weight: bold;
  line-height: 1.5em;
  width: 1.5em;
  height: 1.5em;
  font-size: 1.5em;
}
</style>
