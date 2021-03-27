<template>
  <div
    class="contributor-item"
    :class="{ 'has-orcid': hasOrcid }"
  >
    <el-popover
      ref="popper"
      placement="top-start"
      width="320"
      trigger="hover"
      popper-class="full-content orcid-popover"
      :disabled="!hasOrcid"
      @show="getOrcidData"
    >
      <div
        v-loading="isLoadingOrcid"
        element-loading-background="#fff"
      >
        <template v-if="isOrcidDataNotFound">
          ORCID iD Not Found
        </template>
        <template v-if="hasOrcidDataError">
          Sorry, an error has occurred.
        </template>
        <template v-if="isOrcidDataNotFound === false && hasOrcidDataError === false">
          <h2>{{ orcidName }}</h2>
          <p>
            <strong>ORCID iD</strong>:
            <template v-if="orcidUri">
              <a
                :href="orcidUri"
                target="_blank"
              >
                {{ orcidId }}
              </a>
            </template>
            <template v-else>
              {{ orcidId }}
            </template>
          </p>
          <p v-if="lastEmploymentOrganizationName !== ''">
            <strong>Organization</strong>: {{ lastEmploymentOrganizationName }}
          </p>
          <p v-if="lastEmploymentRole !== ''">
            <strong>Title</strong>: {{ lastEmploymentRole }}
          </p>
        </template>
      </div>
      <span slot="reference">
        {{ displayName }}
      </span>
    </el-popover>
  </div>
</template>

<script>
import {
  compose,
  defaultTo,
  head,
  pathOr,
  propOr
} from 'ramda'
import Request from '@/mixins/request'
import { displayNameAndDegree } from '@/utils/displayNameAndDegree'

export default {
  name: 'ContributorItem',

  mixins: [
    Request
  ],

  props: {
    contributor: {
      type: Object,
      default: () => {}
    }
  },

  data: function () {
    return {
      isLoadingOrcid: true,
      isOrcidDataNotFound: false,
      hasOrcidDataError: false,
      orcidData: {}
    }
  },

  computed: {
    /**
     * Compute contributors full name
     * @return {String}
     */
    displayName: function () {
      return displayNameAndDegree(this.contributor)
    },

    /**
     * Compute name from ORCID profile
     * @returns {String}
     */
    orcidName: function () {
      const name = pathOr({}, ['person', 'name'], this.orcidData)
      const givenName = pathOr('', ['given-names', 'value'], name)
      const familyName = pathOr('', ['family-name', 'value'], name)

      return `${givenName} ${familyName}`
    },

    /**
     * Compute last employment
     * @return {Object}
     */
    lastEmployment: function () {
      return compose(
        defaultTo({}),
        head,
        pathOr([], ['activities-summary', 'employments', 'employment-summary'])
      )(this.orcidData)
    },

    /**
     * Compute the name of last employment
     * @returns {String}
     */
    lastEmploymentOrganizationName: function () {
      return pathOr('', ['organization', 'name'], this.lastEmployment)
    },

    /**
     * Compute the role of last employment
     * @returns {String}
     */
    lastEmploymentRole: function () {
      return propOr('', 'role-title', this.lastEmployment)
    },

    /**
     * Compute ORCID iD
     * @returns {String}
     */
    orcidId: function () {
      return propOr('', 'orcid', this.contributor)
    },

    /**
     * Compute ORCID profile uri
     * @returns {String}
     */
    orcidUri: function () {
      return pathOr('', ['orcid-identifier', 'uri'], this.orcidData)
    },

    /**
     * Compute if the contribut has an ORCID iD
     * @returns {Boolean}
     */
    hasOrcid: function () {
      return Boolean(this.orcidId)
    }
  },

  methods: {
    /**
     * Send a request for ORCID data
     */
    getOrcidData: function () {
      this.isOrcidDataNotFound = false
      this.hasOrcidDataError = false
      this.$nextTick(() => {
        this.$refs.popper.updatePopper()
      })

      if (this.hasOrcid && Object.keys(this.orcidData).length === 0) {
        this.sendXhr(`https://pub.orcid.org/v2.1/${this.orcidId}`)
          .then(response => {
            this.orcidData = response
          })
          .catch(response => {
            switch (response.status) {
              case 404:
                this.isOrcidDataNotFound = true
                break
              default:
                this.hasOrcidDataError = true
            }
          })
          .finally(() => {
            this.isLoadingOrcid = false
            this.$refs.popper.updatePopper()
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.has-orcid {
  text-decoration: underline;
}
</style>
<style lang="scss">
.orcid-popover {
  min-height: 52px;
  p:last-of-type {
    margin: 0;
  }
}
</style>
