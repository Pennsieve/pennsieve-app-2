<template>
  <div class="invite-people">
    <div class="container">
      <h2 class="sharp-sans-font">
        Invite people from your team.
      </h2>
      <p class="mb-24">
        Science is more fun with a team. Enter email addresses for people you would like to invite to Pennsieve. We’ll generate them an email to join.
      </p>

      <div id="inviteWrap">
        <el-input
          v-for="(item, idx) in people"
          :key="idx"
          ref="input"
          v-model="people[idx]"
          class="mb-16"
          autofocus
          type="email"
          placeholder="Enter an email address."
        />
      </div>

      <transition name="el-zoom-in-top">
        <p
          v-if="hasRequiredPeopleError"
          class="error"
        >
          Must enter at least one email
        </p>
      </transition>

      <p>
        <button
          class="linked mb-16"
          :disabled="processing"
          @click="addPerson"
        >
          Add another person &hellip;
        </button>
      </p>

      <div class="button-wrap">
        <bf-button
          :processing="processing"
          processing-text="Sending invites"
          @click="sendInvites"
        >
          Send invites
        </bf-button>

        <bf-button
          class="secondary"
          :disabled="processing"
          @click="goToDatasets"
        >
          Skip for now
        </bf-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  compose,
  equals,
  map,
  path,
  reject
} from 'ramda'

import {
  mapState
} from 'vuex'

import BfButton from '@/components/shared/bf-button/BfButton.vue';

import Request from '@/mixins/request'

const transformPerson = (person) => {
  return {
    firstName: '',
    lastName:'',
    email: person
  }
}

export default {
  name: 'InvitePeople',

  components: {
    BfButton
  },

  mixins: [
    Request
  ],

  data: function() {
    return {
      processing: false,
      people: ['', '', ''],
      hasRequiredPeopleError: false
    }
  },

  computed: {
    ...mapState([
      'activeOrganization',
      'config',
      'userToken'
    ]),

    /**
     * Compute send invites url
     * @returns {String}
     */
    sendInvitesUrl: function () {
      const id = path(['organization', 'id'], this.activeOrganization)

      return id
        ? `${this.config.apiUrl}/organizations/${id}/members?api_key=${this.userToken}`
        : ''
    }
  },

  methods: {
    /**
     * Add another input to the list
     */
    addPerson: function () {
      // Add person
      this.people.push('')

      // Focus on new field
      this.$nextTick(() => {
        const inputs = this.$refs.input
        inputs[inputs.length - 1].focus()
      })
    },

    /**
     * Send invites to users
     */
    sendInvites: function () {
      this.hasRequiredPeopleError = false

      const people = compose(
        map(transformPerson),
        reject(equals(''))
      )(this.people)

      if (people.length) {
        this.processing = true

        this.sendXhr(this.sendInvitesUrl, {
          method: 'POST',
          body: {
            invites: people,
            role: {}
          }
        })
        .then(() => {
          this.goToDatasets()
        })
        .catch(this.handleXhrError.bind(this))
      } else {
        this.hasRequiredPeopleError = true
      }
    },

    /**
     * Navigate to the datasets list
     */
    goToDatasets: function () {
      this.$router.replace({
        name: 'datasets-list'
      })
    },

  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.invite-people {
  background: #fff;
  display: block;
  color: $gray_4;
  min-height: 100vh;
}
.container {
  margin: 0 auto;
  max-width: 560px;
  padding-bottom: 20px;
  padding-top: 130px;
  text-align: center;
}
.bf-button {
  margin: 0 10px;
  min-width: 160px;
}
.button-wrap {
  align-items: center;
  display: flex;
  justify-content: center;
}
h2 {
  font-weight: 700;
  font-size: 24px;
}
.error {
  color: $error-color
}
</style>
