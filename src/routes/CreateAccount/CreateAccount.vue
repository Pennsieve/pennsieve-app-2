<template>
  <div class="create-account">
    <div class="create-account-wrapper">
      <div class="create-account-inner">
        <div v-if="!accountCreated">
          <h2 class="sharp-sans">
            Create Your Account
          </h2>
          <p>
            Welcome to Pennsieve! Complete the following form so that we can
            register your account.
            <strong>All fields are required</strong>.
          </p>
          <el-form
            id="signup-form"
            ref="signupForm"
            :model="signupForm"
            :rules="signupRules"
            status-icon
            @submit.native.prevent="onFormSubmit"
          >
            <el-form-item
              label="First Name"
              prop="firstName"
            >
              <el-input
                v-model="signupForm.firstName"
                required
                class="first-name-input"
                autofocus
              />
            </el-form-item>
            <el-form-item
              label="Last Name"
              prop="lastName"
            >
              <el-input
                v-model="signupForm.lastName"
                required
              />
            </el-form-item>
            <el-form-item
              label="Email"
              prop="email"
            >
              <el-input
                v-model="signupForm.email"
                required
              />
            </el-form-item>
            <el-form-item>
              <bf-button
                class="secondary"
                @click="onFormCancel"
              >
                Cancel
              </bf-button>
              <bf-button
                :processing="isCreatingAccount"
                processing-text="Submitting"
                @click="onFormSubmit"
              >
                Create Account
              </bf-button>
            </el-form-item>
          </el-form>
          <p class="agreement">
            By clicking “Create Account" you are agreeing to the Pennsieve
            <a
              href="https://www.blackfynn.com/terms"
              target="_blank"
            >
              Terms of Use
            </a>
            and
            <a
              href="https://www.blackfynn.com/privacy"
              target="_blank"
            >
              Privacy Policy
            </a>.
          </p>
        </div>
        <div v-else>
          <h2 class="sharp-sans">
            Thank You
          </h2>
          <p>Thank you for registering an account. An email should have been sent to create your password.</p>
          <router-link :to="{name: 'login'}">
            Back to login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BfButton from '@/components/shared/bf-button/BfButton.vue'
export default {
  name: 'CreateAccount',
  components: {
    BfButton,
  },
  data() {
    return {
      isCreatingAccount: false,
      accountCreated: false,
      signupForm: {
      firstName: '',
      lastName: '',
      email: '',
    },
    profileRules: {
      firstName: [
        { required: true, message: 'Please enter your first name', trigger: 'submit' }
      ],
      lastName: [
        { required: true, message: 'Please enter your last name', trigger: 'submit' }
      ],
      jobTitle: [
        { required: true, message: 'Please enter your email', trigger: 'submit' }
      ]
    },
    }
  },
  methods: {
    onFormCancel: function() {
      this.$router.push({
        name: 'login'
      })
    },

    onFormSubmit: function() {
      this.isCreatingAccount = true
      this.accountCreated = true
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../assets/_variables.scss';

.create-account {
  background: $purple_1;
  display: block;

  .create-account-wrapper {
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

  .create-account-inner {
    background: $white;
    box-sizing: border-box;
    color: $gray_4;
    max-width: 720px;
    flex: 1;
    width: 360px;
  }
}

p {
  margin: 10px 0 28px;
}

.sharp-sans {
  color: #000;
  font: 700 24px/31px 'SharpSans', sans-serif;
  display: flex;
}

h2 {
  font-size: 20px;
  line-height: 24px;
  font-weight: 400;
  margin: 0 0 12px;
}

/deep/ .bf-button {
  min-width: 170px;
  margin-right: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
