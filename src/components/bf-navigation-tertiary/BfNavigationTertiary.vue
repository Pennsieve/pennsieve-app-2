<template>
  <div class="bf-navigation-tertiary">
    <search-menu v-if="!pageNotFound && !isWorkspaceGuest" />
    <help-menu />
    <user-menu />
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import {propOr} from "ramda";
  const HelpMenu = () => import('@/components/bf-navigation/HelpMenu/HelpMenu.vue')
  const UserMenu = () => import('@/components/bf-navigation/UserMenu/UserMenu.vue')
  const SearchMenu = () => import('@/components/bf-navigation/SearchMenu/SearchMenu.vue')

  export default {
    name: 'BfNavigationTertiary',

    components: {
      HelpMenu,
      UserMenu,
      SearchMenu
    },

    computed: {
      ...mapGetters([
        'hasFeature'
      ]),

      ...mapState([
        'pageNotFound',
        'activeOrganization'
      ]),

      isWorkspaceGuest: function() {
        const isGuest = propOr(false, 'isGuest', this.activeOrganization)
        return isGuest
      },
    }
  }
</script>

<style lang="scss">
  @import '../../assets/_variables.scss';

  .bf-navigation-tertiary {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .bf-navigation-item {
      font-size: inherit;
      line-height: inherit;
      text-align: left;
      width: 100%;
      .icon-main {
        color: #fff;
        flex-shrink: 0;
        height: 28px !important;
        margin: 0 18px -4px -2px;
        width: 28px !important;
        .condensed & {
          height: 24px !important;
          margin-left: -8px;
          width: 24px !important;
        }
        .secondary & {
          color: $gray_6;
        }
      }
    }
  }
</style>
