<template>
  <div class="concept-instance-static-property">
    <el-row
      type="flex"
      :gutter="32"
      align="middle"
    >
      <el-col
        class="name"
        :sm="11"
        :md="9"
        :lg="8"
      >
        <div class="label">
          <div>{{ label }}</div>
          <div v-if="hasHelp">
            <a
              :href="hasHelp"
              target="_blank"
            ><svg-icon
              class="ml-8 arrow-style"
              name="icon-info"
              height="18"
              width="18"
            />
            </a>
          </div>
        </div>

      </el-col>
      <el-col
        :sm="11"
        :md="11"
        :lg="11"
      >
        <template v-if="user">
          <strong>{{ userName }}</strong> on
        </template>{{ displayPropertyValue }}
        <slot />
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { find, propEq, propOr } from 'ramda'

  import FormatDate from '../../../../mixins/format-date'

  export default {
    name: 'ConceptInstanceStaticProperty',

    mixins: [
      FormatDate
    ],

    props: {
      label: String,
      user: String,
      date: String,
      value: String,
      helpUrl: String
    },

    computed: {
      ...mapGetters([
        'orgMembers'
      ]),

      hasHelp: function() {
        return this.helpUrl
      },

      /**
       * Compute user name from state
       * @returns {String}
       */
      userName: function() {
        const user = find(propEq('id', this.user), this.orgMembers) || find(propEq('intId', this.user), this.orgMembers)

        const firstName = propOr('', 'firstName', user)
        const lastName = propOr('', 'lastName', user)

        return `${firstName} ${lastName}`
      },

      /**
       * Compute formatted property value
       * @returns {String}
       */
      displayPropertyValue: function() {
        return this.date ? this.formatDate(this.date) : this.value
      },
    },
  }

</script>

<style lang="scss">
  @import '_concept-instance-static-property';
</style>
