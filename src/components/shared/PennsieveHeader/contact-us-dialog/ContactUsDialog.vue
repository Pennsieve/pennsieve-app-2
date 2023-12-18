<template>
  <el-dialog
    :visible.sync="visible"
    data-cy="contactUsDialog"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" title="Contact Us" />
    <dialog-body>
      <h2 class="dialog-heading">
        Need to get in touch with the Pennsieve Support Team?
      </h2>
      <div class="flex-col">
        <div class="contact-method-container">
          <h3>Email Support</h3>
          <p>Contact us at support@pennsieve.io</p>
          <a href="mailto:support@pennsieve.io" target="_blank">
            Send email
            <svg-icon name="icon-arrow-right" height="8" width="8" />
          </a>
        </div>
        <div class="contact-method-container">
          <h3>Office Hours</h3>
          <p>1 p.m. - 2 p.m. (EST) Every Monday</p>
          <a
            href="https://pennmedicine.zoom.us/j/91229384998?pwd=d2h3azZnR0UrRDlyeGo5akg4dzc5dz09"
            target="_blank"
          >
            Join on Zoom
            <svg-icon name="icon-arrow-right" height="8" width="8" />
          </a>
        </div>
        <div class="contact-method-container">
          <h3>Learn More</h3>
          <p>Stay in touch with the Wagenaar Lab</p>
          <div class="flex-col">
            <a
              href="https://twitter.com/i/flow/login?redirect_after_login=%2Fwagenaarlab"
              target="_blank"
            >
              Visit Twitter
              <svg-icon name="icon-arrow-right" height="8" width="8" />
            </a>
            <a
              href="https://wagenaarlab.org/"
              target="_blank"
              class="margin-top"
            >
              Visit Website
              <svg-icon name="icon-arrow-right" height="8" width="8" />
            </a>
          </div>
        </div>
      </div>

      <!-- <div class="flex">
        <div class="box">
          <div>
            If you have questions or need support using the platform, please
            reach out to the Pennsieve Team. We will be happy to assist you!
          </div>
          <svg-icon name="icon-pencil" height="16" width="16" />
          <h2>
            Email:
            <a href="mailto: support@pennsieve.io">support@pennsieve.io</a>
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
            />
          </svg>
          <h2>
            Social Media:
            <a href="https://twitter.com/wagenaarlab">Twitter</a>
          </h2>
          <svg-icon name="icon-link" height="16" width="16" />
          <h2><a href="https://wagenaarlab.org/">Wagenaar Lab Website</a></h2>
          <svg-icon name="icon-person" height="16" width="16" />
          <h2>
            Pennsieve Open Office Hours: Mondays (1:00-2:00 EST) via Zoom
            https://docs.pennsieve.io/docs/pennsieve-open-office-hours
          </h2>
        </div>
      </div> -->
    </dialog-body>
  </el-dialog>
</template>

<script>
import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import Request from '../../../../mixins/request/index'

import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ContactUsDialog',

  components: {
    BfDialogHeader,
    DialogBody
  },

  mixins: [Request],

  props: {
    selectedFiles: {
      type: Array,
      default: () => {}
    }
  },
  data: function() {
    return {
      visible: false,
      options: [],
      value: '',
      selectedApplication: {},
      isLoading: false
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
      'config',
      'dataset',
      'activeOrganization',
      'userToken'
    ]),
    ...mapState()
  },

  watch: {
    /**
     * Watch file
     */
  },

  mounted() {},

  methods: {
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.visible = false
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';

.margin-top {
  margin-top: 10px;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.dialog-heading {
  margin: 20px 0px;
  font-size: 18px;
  color: #928d85;
}

.svg-icon {
  color: $app-primary-color;
}

.flex {
  display: flex;
  justify-content: center;
}

.box {
  margin: 10px;
  height: 250px;
}

a {
  color: #3a26cb;
}

.contact-method-container {
  margin: 5px;
}

.center {
  text-align: center;
}
</style>
