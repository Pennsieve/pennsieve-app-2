<template>
  <div class="wrapper">
    <div
      v-if="firstTimeThrough"
      class="login-wrap"
    >
      <h2 class="sharp-sans">
        Welcome to the Pennsieve platform!
      </h2>
      <p>Please enter your email address so that we may add it to your user profile. Having an email address associated with your user profile is important. The Pennsieve platform sends emails to users from time to time.</p>
      <el-form
        id="email-form"
        ref="emailForm"
        :model="emailForm"
        :rules="emailRules"
        status-icon
        @submit.native.prevent="addEmailAddress"
      >
        <el-form-item
          label="Email Address"
          prop="emailAddress"
        >
          <el-input
            v-model="emailForm.emailAddress"
            required
            class="email-address-input"
            autofocus
          />
        </el-form-item
        <el-form-item>
          <bf-button
            class="saveProfile"
            :processing="isSavingProfile"
            processing-text="Updating Profile"
            @click="addEmailAddress"
          >
            Add Email Address
          </bf-button>
        </el-form-item>
      </el-form>
    </div>
    <div
      v-if="!firstTimeThrough && !emailAddressKnown"
      class="login-wrap"
    >
      <h2 class="sharp-sans">
        Thank you!
      </h2>
      <p>Thank you for providing your email address. We have updated your user profile. Click <b>Complete Login</b> to finish the sign-up and login process.</p>
      <bf-button
        class="completeLogin"
        :processing="isSavingProfile"
        processing-text="Continuing Login"
        @click="completeLogin"
      >
        Complete Login
      </bf-button>
    </div>
    <div
      v-if="!firstTimeThrough && emailAddressKnown"
      class="login-wrap"
    >
      <h2 class="sharp-sans">
        Do we know you?
      </h2>
      <p>The email address <b>{{this.emailForm.emailAddress}}</b> is already associated with a Pennsieve user account.
      <p>Click <b>Add Federated Login</b> if you would like to add this federated login to your existing account.</p>
      <p>Click <b>Complete Login</b> to finish the sign-up and login process without adding an email address to your account.</p>
      <bf-button
        class="addFederatedLogin"
        :processing="isSavingProfile"
        processing-text="Adding Federated Login"
        @click="addFederatedLogin"
      >
        Add Federated Login
      </bf-button>
      <bf-button
        class="completeLogin"
        :processing="isSavingProfile"
        processing-text="Continuing Login"
        @click="completeLogin"
      >
        Complete Login
      </bf-button>
    </div>
  </div>
</template>

<script>
import BfButton from '@/components/shared/bf-button/BfButton.vue'

export default {
  name: 'SetupFederatedLogin',

  components: {
    BfButton
  },

  mixins: [
  ],

  data() {
    return {
      emailForm: {
        emailAddress: ''
      },
      emailRules: {
        emailAddress: [
          {required: true, message: 'Please enter your email address', trigger: 'submit'}
        ]
      },
      firstTimeThrough: true,
      emailAddressKnown: false,
      isSavingProfile: false,
    }
  },

  computed: {
  },

  methods: {
    addEmailAddress: function(evt) {
      console.log("addEmailAddress() evt: " + evt)
      if (this.emailForm.emailAddress === "foo@bar.com") {
        this.emailAddressKnown = true
      }
      this.firstTimeThrough = false
    },

    completeLogin: function(evt) {
      console.log("completeLogin() evt: " + evt)
    },

    addFederatedLogin: function(evt) {
      console.log("addFederatedLogin() evt: " + evt)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../assets/_variables.scss';

.wrapper {
  background: $white;
  box-sizing: border-box;
  color: $gray_4;
  max-width: 720px;
  min-height: 100vh;
  padding-bottom: 20px;
  padding-top: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-wrap {
  width: 360px;
  flex: 1;
  flex-basis: 0.000000001px;

  p {
    margin: 10px 0 28px;
  }
}

form {
  margin-bottom: 30px;
}

.bf-button {
  padding: 9px 35px;
  border-radius: 5px;
  line-height: 20px;
  margin-top: 10px;
}

.el-input {
  .el-input__inner {
    display: flex;
    flex-direction: row;
    background: #FFFFFF;
    border: 1px solid #DADADA;
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 14px;
    line-height: inherit;
    max-width: 100%;
    padding: 10px;
    position: relative;
    width: 100%;
  }
}

.el-form {
  .el-form-item__content {
    div {
      line-height: 20px;
    }

    .el-form-item__error {
      font-size: 13px;
      line-height: 1;
      padding: 13px 10px;
      background: #FAFAFA;
      border-radius: 0 0 5px 5px;
      border: solid 1px #dadada;
      height: 15px;
      width: 94%;
      position: absolute;
      z-index: 0;
      margin: 0;
    }
  }
}

.pw-is-valid-text {
  color: #17bb62;
  font-size: 13px;
  line-height: 1;
  padding: 13px 10px;
  background: #FAFAFA;
  border-radius: 0 0 5px 5px;
  border: solid 1px #dadada;
  height: 15px;
  width: 93.5%;
  position: absolute;
  z-index: 0;
  margin: 0;
}


.pw-recommendation-text {
  font-size: 13px;
  padding: 13px 10px;
  margin: 0;
}

.helper {
  color: #71747C;
  font-size: 13px;
  margin-top: 51px;
  margin-bottom: 15px;
}

.form-item-wrap {
  color: #000;
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  pointer-events: none;
}

h2 {
  font-size: 20px;
  line-height: 24px;
  font-weight: 400;
  margin: 0 0 12px;
}

a {
  color: #71747C;
  text-decoration: underline;
}

.sharp-sans {
  color: #000;
  font: 700 24px/31px 'SharpSans', sans-serif;
  display: flex;
}

.agreement {
  font-size: 13px;
  margin: 0;
}
.btn-back-to-sign-in {
  text-decoration: none;
  .bf-button {
    margin-top: 0;
    text-decoration: none;;
  }
}
.user-already-created-wrap {
  align-items: center;
  display: flex;
  justify-content: space-between;
  .forgot-password {
    color: $app-primary-color;
    flex: 1;
    margin-left: 16px;
    text-align: center;
  }
}
</style>
