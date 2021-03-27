<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="onClosed"
    @open="onOpen"
  >
    <bf-dialog-header
      slot="title"
      :title="ctaCopy"
    />
    <dialog-body>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
      >
        <el-form-item
          class="mb-16"
          prop="layer.name"
        >
          <el-input
            v-model="form.layer.name"
            autofocus
            placeholder="Add a layer name"
          />
        </el-form-item>
        <el-form-item prop="color">
          <el-select
            v-model="form.color"
            value-key="label"
            placeholder="Select a layer"
          >
            <span
              slot="prefix"
              class="select-prefix layer-color"
              :style="`background-color: ${form.color.iconBgColor}`"
            />
            <el-option
              v-for="item in layerColors"
              :key="item.label"
              class="layer-option"
              :label="item.label"
              :value="item"
            >
              <span
                class="layer-color"
                :style="`background-color: ${item.iconBgColor}`"
              />
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </dialog-body>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </bf-button>
      <bf-button
        :processing="isProcessing"
        @click="validateForm"
      >
        {{ ctaCopy }}
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  mapState
} from 'vuex'
import {
  defaultTo,
  find,
  pathOr,
  propEq,
  propOr
} from 'ramda'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

import Autofocus from '@/mixins/auto-focus'

const defaultForm = {
  layer: {
    name: '',
    packageId: null,
    color: '',
    createdAt: '',
    updatedAt: '',
    id: null,
    annotations: '',
    hexColor: ''
  },
  color: {
    label: 'Green',
    value: '#18BA62',
    iconBgColor: '#18BA62'
  }
}

export default {
  name: 'SlideLayerDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  mixins: [
    Autofocus
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    layer: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isCreating: {
      type: Boolean,
      default: false
    }
  },

  data: function () {
    return {
      form: Object.assign({}, defaultForm),
      rules: {
        layer: {
          name: [
            { required: true, message: 'Name is required', trigger: 'false' },
          ]
        },
        color: [
          { required: true, message: 'Color is required', trigger: 'false' },
        ]
      },
      isProcessing: false,
      isSubmitted: false,
      layerColors: [
        {
          label: 'Green',
          value: '#18BA62',
          iconBgColor: '#18BA62'
        },
        {
          label: 'Gold',
          value: '#FFBC27',
          iconBgColor: '#FFBC27'
        },
        {
          label: 'Red',
          value: '#E94B4B',
          iconBgColor: '#E94B4B'
        },
        {
          label: 'Light Blue',
          value: '#2760FF',
          iconBgColor: '#2760FF'
        },
        {
          label: 'Magenta',
          value: '#FF4FFF',
          iconBgColor: '#FF4FFF'
        },
        {
          label: 'Cyan',
          value: '#50FFFF',
          iconBgColor: '#50FFFF'
        },
        {
          label: 'Yellow',
          value: '#FFFF4E',
          iconBgColor: '#FFFF4E'
        },
        {
          label: 'Purple',
          value: '#512BAF',
          iconBgColor: '#512BAF'
        },
        {
          label: 'Lavendar',
          value: '#8A6ECF',
          iconBgColor: '#8A6ECF'
        },
        {
          label: 'Teal',
          value: '#389BAD',
          iconBgColor: '#389BAD'
        },
        {
          label: 'Dark Green',
          value: '#187D46',
          iconBgColor: '#187D46'
        },
        {
          label: 'Brick Red',
          value: '#B12800',
          iconBgColor: '#B12800'
        },
        {
          label: 'Dark Blue',
          value: '#0C2475',
          iconBgColor: '#0C2475'
        },
        {
          label: 'Bright Orange',
          value: '#FF5321',
          iconBgColor: '#FF5321'
        },
        {
          label: 'Pink',
          value: '#FF99CC',
          iconBgColor: '#FF99CC'
        },
        {
          label: 'Tan',
          value: '#DCC180',
          iconBgColor: '#DCC180'
        },
        {
          label: 'Medium Blue',
          value: '#0D4EFF',
          iconBgColor: '#0D4EFF'
        },
        {
          label: 'Orange',
          value: '#FF6C21',
          iconBgColor: '#FF6C21'
        },
        {
          label: 'Black',
          value: '#000000',
          iconBgColor: '#000000'
        },
        {
          label: 'Gray',
          value: '#9B9B9B',
          iconBgColor: '#9B9B9B'
        },
        {
          label: 'Lime',
          value: '#00FF00',
          iconBgColor: '#00FF00'
        },
        {
          label: 'Salmon',
          value: '#FA8072',
          iconBgColor: '#FA8072'
        },
        {
          label: 'Olive',
          value: '#808000',
          iconBgColor: '#808000'
        },
        {
          label: 'Sienna',
          value: '#A0522D',
          iconBgColor: '#A0522D'
        }
      ]
    }
  },

  computed: {
    ...mapState('viewer', [
      'viewerAnnotations'
    ]),

    /**
     * Compute CTA copy
     * @returns {String}
     */
    ctaCopy: function () {
      return this.isCreating
        ? 'Create layer'
        : 'Edit layer'
    }
  },

  methods: {
    /**
     * Emit event to update the synced property
     */
    close: function() {
      if (this.isSubmitted) {
        this.$emit('update:visible', false)
        this.$emit('update:isCreating', false)
        this.$emit('update:isSubmitted', false)
        this.$emit('update:layer', {})
      } else {
        this.$emit('cancel')
      }
    },

    /**
     * Callback after the dialog has closed
     * Reset dialog
     */
    onClosed: function() {
      this.isProcessing = false
      this.$refs.form.resetFields()
    },

    /**
     * Set default values on open
     */
    onOpen: function() {
      this.isSubmitted = false

      this.autoFocus()

      if (!this.isCreating) {
        this.setLayer()
      } else {
        this.form = Object.assign({}, defaultForm)
      }
    },

    /**
     * Set the annotation the user is editing
     */
    setLayer: function() {
      const colorValue = propOr('', 'color', this.layer)
      const color = find(propEq('value', colorValue), this.layerColors)
      this.form.color = defaultTo({}, color)

      if (this.layer.id) {
        this.form.layer = this.layer
      }
    },

    /**
     * Validate form, and then submit if it is valid
     */
    validateForm: function (){
      this.$refs.form
        .validate((valid) => {
          if (!valid) {
            return
          }
          this.submitForm()
        })
    },

    /**
     * Submit form and emit event
     */
    submitForm: function() {
      this.isProcessing = true
      this.isSubmitted = true

      const color = pathOr('', ['color', 'value'], this.form)
      const name = pathOr('', ['layer', 'name'], this.form)

      const layerInfo = {
        color,
        name
      }
      const layer = Object.assign({}, this.layer, layerInfo)

      const eventName = this.isCreating
        ? 'create-layer'
        : 'edit-layer'
      this.$emit(eventName, layer)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  width: 100%;
  /deep/ .el-input__inner {
    padding-left: 28px;
  }
  /deep/ .el-input__prefix {
    left: 8px;
  }
}
.layer-option {
  align-items: center;
  display: flex;
}
.layer-color {
  border-radius: 50%;
  height: 12px;
  margin-right: 8px;
  width: 12px;
  &.select-prefix {
    position: absolute;
    top: 50%;
    transform: translateY(-50%)
  }
}
/deep/ .bf-dialog-header-title {
  text-transform: capitalize;
}
</style>
