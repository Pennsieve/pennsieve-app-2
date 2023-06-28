<template>
  <bf-page>
    <bf-rafter
      slot="heading"
      title="Integrations"
      class="primary"
    >
      <div
        slot="description"
        class="description"
      >
        <p >
          Integrations and applications allow users to expand the functionality of the platform through custom actions and webhooks.
        </p>
      </div>
      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li
          key="ApplicationsList"
        >
          <router-link to="applications">
            Applications
          </router-link>
        </li>
        <li
          key="IntegrationsList"
        >
          <router-link to="webhooks">
            Webhooks
          </router-link>
        </li>
      </ul>
    </bf-rafter>
      <router-view
        name="stage"
        :integrations="integrations"
      />

  </bf-page>




</template>

<script>
  import {mapState} from "vuex";
  import BfPage from '@/components/layout/BfPage/BfPage.vue'
  import BfStage from '@/components/layout/BfStage/BfStage.vue'
  import BfRafter from '@/components/shared/bf-rafter/BfRafter.vue'


  export default {
    name: 'IntegrationView',
    components: {
      BfPage,
      BfStage,
      BfRafter
    },
    computed: {
      ...mapState('integrationsModule', [
        'integrations'
      ]),
    }
  }


</script>


<style scoped lang="scss">
@import '../../assets/variables';


.description {
  max-width: 600px;
}
</style>

