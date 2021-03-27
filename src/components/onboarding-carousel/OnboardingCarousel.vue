<template>
  <el-dialog
    :visible="visible"
    class="bf-carousel simple"
    :show-close="false"
    :close-on-click-modal="false"
    @close="onCarouselClose"
  >
    <dialog-body class="dialog-spacing">
      <swiper
        ref="awesomeSwiperA"
        :options="swiperOption"
        @slideChange="checkSlideCount"
      >
        <swiper-slide
          v-for="slide in slides"
          :key="slide.id"
        >
          <img
            :src="slide.media"
            :alt="slide.title"
          >
          <h2 class="bf-carousel-title sharp-sans-font">
            {{ slide.title }}
          </h2>
          <div class="bf-carousel-divider" />
          <p class="bf-carousel-blurb">
            {{ slide.blurb }}
          </p>
        </swiper-slide>
        <bf-button
          slot="button-next"
          class="swiper-button-next"
          @click="onNextBtnClick"
        >
          {{ buttonValue }}
        </bf-button>
        <div
          slot="pagination"
          class="swiper-pagination"
        />
      </swiper>
    </dialog-body>
  </el-dialog>
</template>

<script>
import DialogBody from '../shared/dialog-body/DialogBody.vue'
import BfButton from '../shared/bf-button/BfButton.vue'
import '../../../node_modules/swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import { mapGetters, mapActions, mapState } from 'vuex'
import { propOr } from 'ramda'
import Request from '../../mixins/request'
import EventBus from '../../utils/event-bus.js'

export default {
  name: 'BfCarouselDialog',

  components: {
    DialogBody,
    BfButton,
    swiper,
    swiperSlide
  },

  mixins: [
    Request
  ],

  data() {
    return {
      slides: [
        {
          id: 0,
          media: '/static/images/onboarding-welcome-slide.png',
          title: 'Welcome to Blackfynn!',
          blurb: 'The following tips will help you not only get set up in the platform, but also make the most out of your account.'
        },
        {
          id: 1,
          media: '/static/images/onboarding-graph.png',
          title: 'Set Up Your Graph.',
          blurb:
            'The Blackfynn metadata graph gives you a visual overview of your data as well as determines your data template.'
        },
        {
          id: 2,
          media: '/static/images/onboarding-add-data.png',
          title: 'Add Some Data.',
          blurb:
            'Welcome to your new data warehouse. Capture metadata in your graph and ' +
            'view your files in our viewers.'
        },
        {
          id: 3,
          media: '/static/images/onboarding-collaboration.png',
          title: 'Collaboration Made Easy.',
          blurb:
            'Share your data with anyone in your organization, annotate anomalies ' +
            'and track conversations in real time.'
        },
        {
          id: 4,
          media: '/static/images/onboarding-getting-started.png',
          title: 'Read The Guide.',
          blurb:
            'Everything you need to do in one tidy place. You can also reference it at ' +
            'any time by using the menu item.'
        }
      ],
      swiperOption: {
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        pagination: {
          el: '.swiper-pagination'
        },
        slidesPerView: '1',
        allowSlidePrev: false
      },
      buttonValue: 'Next',
      visible: true
    };
  },

  computed: {
    ...mapGetters([
      'config',
      'userToken'
    ]),

    ...mapState([
      'onboardingEvents'
    ]),

    /**
     * Returns reference to swiper library DOM, methods, and events
     */
    swiper() {
      return this.$refs.awesomeSwiperA.swiper
    },

    /**
     * Onboarding Events Url
     * @returns {String}
     */
    onboardingEventsUrl() {
      const apiUrl = propOr('', 'apiUrl', this.config)
      return (apiUrl && this.userToken)
        ? `${apiUrl}/onboarding/events?api_key=${this.userToken}`
        : ''
    }
  },

  watch: {
    onboardingEventsUrl: {
      handler: function(val) {
        if (val) {
          this.saveLaunchCarouselEvent()
        }
      },
      immediate: true
    },
  },

  mounted() {
    this.$nextTick(() => ({}))
  },

  methods: {
    ...mapActions([
      'updateOnboardingEvents'
    ]),

    /**
     * Closes carousel dialog
     */
    closeCarouselDialog() {
      this.visible = false
    },

    onNextBtnClick: function() {
      if (this.swiper.activeIndex === 4) {
        this.closeCarouselDialog()
        EventBus.$emit('track-event', {
          name: 'Completed Onboarding Carousel'
        })
      }
    },

    /**
     * Send onboarding Launch Carousel event
     */
    saveLaunchCarouselEvent: function() {
      this.sendXhr(this.onboardingEventsUrl, {
        method: 'POST',
        body: 'LaunchCarousel',
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
      .then(() => {
        const onboardingEvents = ['LaunchCarousel']
        this.updateOnboardingEvents(onboardingEvents)
      })
      .catch(this.handleXhrError.bind(this))
    },

    /**
     *
     */
    onCarouselClose: function() {
      // Show getting started component
      EventBus.$emit('open-getting-started')

      // Save completed carousel event
      this.sendXhr(this.onboardingEventsUrl, {
        method: 'POST',
        body: 'CompletedCarousel',
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
      .then(() => {
        // Update onboarding events
        const onboardingEvents = [...this.onboardingEvents, 'CompletedCarousel']
        this.updateOnboardingEvents(onboardingEvents)
      })
      .catch(this.handleXhrError.bind(this))
    },

    /**
     * Changes the button styling on the carousel to render "Got It"
     * button once user has reached the last slide in the carousel
     */
    checkSlideCount() {
      if (this.swiper.isEnd) {
        this.buttonValue = 'Got It'
        this.swiper.navigation.nextEl.style.opacity = 1
        this.swiper.navigation.nextEl.style.cursor = 'pointer'
        this.swiper.navigation.nextEl.style.pointerEvents = 'auto'
      }
    },
  },
}
</script>

<style scoped lang="scss">
.dialog-body {
  img {
    height: 360px;
    width: 850px;
  }
  .bf-carousel-title {
    font-size: 40px;
    line-height: 56px;
  }

  .bf-carousel-blurb {
    font-size: 22px;
    font-family: "Helvetica Neue", "sans-serif";
    font-weight: 300;
    width: 764px;
    line-height: 32px;
    padding-left: 43px;
    margin-top: 16px;
  }
}
h3 {
  color: #000;
  font-size: 14px;
  list-style: 16px;
  margin: 0 0 8px;
}
</style>

<style lang="scss">
@import "../../assets/_variables.scss";

.bf-carousel {
  margin-top: -10vh;
}

.bf-carousel .bf-button {
  width: 163px;
  font-weight: 500;
  line-height: 16px;
  padding-bottom: 27px;
  margin-top: 260px;
  margin-right: 334px;
  &.secondary {
    margin-right: 7px;
  }
}

.bf-carousel-divider {
  background-color: $dopamine;
  border-radius: 4px;
  height: 4px;
  margin: 0 auto;
  width: 34px;
}

.bf-carousel .swiper-button-prev,
.swiper-container-rtl .swiper-button-next {
  left: 10px;
  right: auto;
  display: none;
}

.swiper-button-next,
.swiper-container-rtl .swiper-button-prev {
  right: 10px;
  left: auto;
  margin-right: 292px;
}

.swiper-pagination-fraction,
.swiper-pagination-custom,
.swiper-container-horizontal > .swiper-pagination-bullets {
  bottom: 72px;
  right: 10px;
}

.bf-carousel .swiper-button-prev,
.swiper-button-next {
  position: absolute;
  top: 50%;
  height: 20px;
  z-index: 10;
  cursor: pointer;
  background-size: 27px 44px;
  background-position: center;
  background-repeat: no-repeat;
}
.bf-carousel .swiper-slide {
  height: 620px;
}
.bf-carousel .el-dialog {
  width: 850px;
  height: 669px;
}
</style>
