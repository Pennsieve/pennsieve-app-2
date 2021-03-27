<template>
  <div class="bf-menu sharing">
    <ul>
      <li
        class="bf-menu-item sharing"
        @click="makePrivate"
      >
        <sharing-menu-item
          icon="icon-lock-filled"
          title="Private"
          text="Turn off sharing for this dataset"
        />
      </li>
      <li
        class="bf-menu-item sharing"
        @click="shareWithOrg"
      >
        <sharing-menu-item
          icon="icon-organization"
          title="Share with your organization"
          :text="orgName"
        />
      </li>
      <li
        class="bf-menu-item sharing"
        @click="openCollaboratorsModal"
      >
        <sharing-menu-item
          icon="icon-team"
          title="Specific Members"
          text="Share with members of your organization"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@import '../../../../assets/variables.scss';

li {
  padding: 16px 8px;
  border-top: solid 1px $cortex;

  &:first-child {
    border-top: none;
  }
}
.bf-menu-item {
  &.sharing:hover {
    color: $white-matter;
    background: $dopamine;
  }
}
</style>

<script>
import { mapGetters } from 'vuex'
import SharingMenuItem from './SharingMenuItem.vue'
import EventBus from '../../../../utils/event-bus'
import { pathOr } from 'ramda'

export default {
  name: 'SharingMenu',

  components: {
    SharingMenuItem
  },

  computed: {
    ...mapGetters([
      'activeOrganization'
    ]),
    orgName: function() {
      return pathOr('', ['organization', 'name'], this.activeOrganization)
    }
  },

  methods: {
    /**
     * Emits a 'make-dataset-private' event
     */
    makePrivate: function() {
      this.closeMenu()
      EventBus.$emit('make-dataset-private')
    },
    /**
     * Emits a 'share-dataset-with-org' event
     */
    shareWithOrg: function() {
      this.closeMenu()
      EventBus.$emit('share-dataset-with-org')
    },
    /**
     * Opens collaborators modal
     */
    openCollaboratorsModal: function() {
      this.closeMenu()
      EventBus.$emit('open-add-collaborators')
    },
    /**
     * Closes the sharing menu
     */
    closeMenu: function() {
      this.$parent.showPopper = false
    }
  }
}
</script>
