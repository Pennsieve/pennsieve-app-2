<template>
  <header
    class="bf-rafter"
    :class="[
      $slots['tabs'] ? 'with-tabs' : '',
      isEditing ? 'editing' : ''
    ]"
  >
  <div>
    <div class="dataset-name">
      {{ datasetNameDisplay() }}
    </div>
  </div>
    <div
      class="row bf-rafter-breadcrumb"
      :class="[ this.$slots['breadcrumb'] ? 'has-breadcrumb' : 'no-breadcrumb' ]"
    >
      <slot name="breadcrumb" />
    </div>
    <div class="row main">
      <div class="col">
        <h1 v-if="title">
          {{ title }}
        </h1>

        <div
          v-if="$slots['heading']"
          class="bf-rafter-heading"
        >
          <slot name="heading" />
        </div>

        <div
          v-if="$slots['description']"
          class="bf-rafter-description"
        >
          <slot name="description" />
        </div>
      </div>
      <div
        v-if="$slots['buttons']"
        class="col bf-rafter-buttons"
      >
        <slot name="buttons" />
      </div>
    </div>

    <div
      v-if="$slots['bottom']"
      class="row bf-rafter-bottom"
    >
      <slot name="bottom" />
    </div>

    <div class="tabs-stats-wrap">
      <div
        v-if="$slots['tabs']"
        class="row bf-rafter-tabs"
      >
        <slot name="tabs" />
      </div>

      <div
        v-if="$slots['stats']"
        class="col bf-rafter-stats mb-16"
      >
        <slot name="stats" />
      </div>
    </div>
  </header>
</template>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .bf-rafter {
    padding: 9px 31px 1px 31px;
    transition: .15s padding linear;
    z-index: 5;
    &.small {
      padding-top: 28px;
      h1 {
        font-size: 24px;
        line-height: 40px;
      }
    }
    &.border, &.with-tabs {
      box-shadow: 1px 1px 0 0 $gray_2;
    }
    &.with-tabs {
      padding-bottom: 0
    }
    &.editing {
      background: $gray_1;
    }
    h1 {
      margin: 0;
      font-size: 20px;
      &.flex-heading {
        align-items: center;
        display: flex;
      }
    }
    .condensed & {
      background: $white;
      box-shadow: 1px 1px 0 0 $gray_2;
      padding: 16px 32px;
      &.with-tabs {
        padding-bottom: 0;
      }
    }
    .row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .main .col {
      flex: 1;
      min-width: 0;
    }
  }
  .bf-rafter-description {
    margin-top: 8px;
    .condensed & {
      display: none;
    }
  }
  .bf-rafter-tabs {
    margin-top: 6px;
    .condensed & {
      margin-top: 8px;
    }
  }
  .bf-rafter-bottom {
    margin-top: 24px;
    .condensed & {
      margin-top: 8px;
    }
  }
  .bf-rafter-breadcrumb {
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    margin-bottom: 8px;
    min-height: 17px;
    .condensed &.no-breadcrumb {
      display: none;
    }
  }
  .bf-rafter-buttons {
    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
    .bf-button {
      margin-left: 8px !important;
      padding-top: 11px;
      padding-bottom: 11px;
    }
  }
  .tabs-stats-wrap {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
  }
  .bf-rafter-stats {
    display: flex;
  }
  .dataset-name {
    font-weight: bold;
    font-size: 20px;
    color: $gray_6;
    margin-left: 4px;
  }
</style>

<script>
import  { mapState } from 'vuex';
  export default {
    name: 'BfRafter',

    props: {
      title: {
        type: String,
        default: ''
      },
      size: {
        type: String,
        default: ''
      },
      isEditing: {
        type: Boolean,
        default: false
      }
    },
  data: function() {
    return {
      datasetNameTruncated: false,
      datasetname: ''
    }
  }

    ,
  computed: {
    ...mapState(['dataset']),
    datasetNameDisplay: function() {
      const name = this.datasetName

      if (name.length > 20) {
        this.datasetNameTruncated = true
        return `${name.slice(0, 17)}...`
      } else {
        this.datasetNameTruncated = false
      }
      return name
    }
  },
  methods: {
    datasetName: function() {
      return pathOr('', ['content', 'name'], this.dataset)
    },
  }
  }
</script>
