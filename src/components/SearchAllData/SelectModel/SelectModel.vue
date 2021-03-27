<template>
  <div class="select-model">
    <h3>Select a Model</h3>

    <el-select
      ref="select"
      :value="selectedModel"
      class="add-model bf-menu"
      required
      filterable
      :default-first-option="true"
      value-key="label"
      :loading="loading"
      :placeholder="placeholderValue"
      :class="placeholderValue !== 'Example Model' ? '' : 'italic-placeholder'"
      no-match-text="No Results Found"
      popper-class="select-model-dropdown"
      @change="$emit('input', $event)"
    >
      <svg-icon
        slot="prefix"
        icon="icon-files"
        class="files-icon"
      />
      <div class="parent-menu-group bf-menu">
        <h2>Records</h2>
        <el-option
          v-for="(model, index) in modelsList"
          :key="`${model}-${index}`"
          :label="model.label"
          :value="model.value"
        >
          {{ model.label }}
        </el-option>
      </div>
    </el-select>

    <p
      v-if="isInvalid"
      class="msg-invalid mt-8"
    >
      Please select a model
    </p>
  </div>
</template>

<script>
export default {
  name: 'SelectModel',

  model: {
    prop: 'selectedModel'
  },

  props: {
    selectedModel: {
      type: String,
      default: ''
    },
    isInvalid: {
      type: Boolean,
      default: false
    },
    modelsList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
  },

  data() {
    return {
      placeholderValue: 'Example Model'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.select-model {
  padding-top: 9px;
}

.files-icon {
  width: 20px;
  height: 20px;
  color: $glial;
}

.add-model {
  flex: 1;
  max-width: 418px;
  width: 100%;
  /deep/ .el-input__prefix {
    display: flex;
    left: 13px;
    font-style: normal;
    .svg-icon {
      align-self: center;
    }
  }

  /deep/ .el-input__inner {
    border-color: #dadada;
    padding-left: 40px;
  }
}

.italic-placeholder {
  ::placeholder {
    font-style: italic;
  }
}

.parent-menu-group {
  h3 {
    font-size: 14px;
    color: $dark-blue;
    margin: 0;
    padding-bottom: 5px;
    margin-left: 9px;
    padding-top: 7px;
  }
}
.msg-invalid {
  color: $error-color
}
</style>
