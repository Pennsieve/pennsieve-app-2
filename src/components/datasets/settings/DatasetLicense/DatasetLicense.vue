<template>
  <div
    class="dataset-license"
  >
    <div class="label-flex">
      License Type
      <a
        href="https://help.blackfynn.com/en/articles/3044442"
        target="_blank"
      >
        License Help
      </a>
    </div>
    <el-select
      ref="inputLicense"
      v-model="dataset.content.license"
      placeholder="No License Selected"
      :disabled="datasetLocked"
      @change="changeLicenseSelection"
    >
      <svg-icon
        slot="prefix"
        name="icon-license"
        height="20"
        width="20"
        color="#000"
      />
      <el-option-group
        v-for="license in licenses"
        :key="license.label"
        :label="license.label"
      >
        <el-option
          v-for="option in license.options"
          :key="option.label"
          :label="option.label"
          :value="option.value"
        />
      </el-option-group>
    </el-select>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import licenses from '../dataset-licenses'
  export default {
    name: 'DatasetLicense',

    data() {
      return {
        licenseVal: '',
        licenses
      }
    },
    computed: {
      ...mapState(['dataset']),
      ...mapGetters(['datasetLocked']),
    },

    methods: {
      /**
       * Emit event to change dataset lidense
       */
      changeLicenseSelection: function() {
        this.$emit('change-license')
      }
    },
  }
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
.dataset-license {
  max-width: 463px;
  .svg-icon {
    margin-top: 10px;
  }

  .el-select {
    width: 100%;
  }

  .label-flex {
    color: $gray_6;
    size: 14px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  a {
    font-weight: 500;
  }
}

</style>