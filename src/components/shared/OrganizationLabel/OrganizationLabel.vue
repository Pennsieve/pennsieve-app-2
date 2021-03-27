<template>
  <div class="organization-label">
    <circle-icon
      class="mr-8"
      icon="icon-organization"
    />
    <div class="organization-label-details">
      <div class="name">
        <span class="display-name">
          Everyone at {{ name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import CircleIcon from '../../shared/circle-icon/CircleIcon.vue'

import { pathOr } from 'ramda'

export default {
  name: 'OrganizationLabel',

  components: {
    CircleIcon
  },

  props: {
    item: {
      type: Object,
      default: function() {
        return {
          administrators: [],
          isAdmin: false,
          isOwner: false,
          organization: {},
          owners: []
        }
      }
    }
  },

  computed: {
    name: function() {
      return pathOr('', ['organization', 'name'], this.item)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/variables';

.organization-label {
  display: flex;
  align-items: center;
}

.organization-label-details {
  .name {
    color: #000;
    font-weight: 600;
    font-size: 16px;

    .display-name {
      font-size: 14px;
    }
  }
}
</style>
