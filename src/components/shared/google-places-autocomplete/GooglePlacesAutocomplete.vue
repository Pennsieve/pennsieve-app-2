<template>
  <input
    ref="autocomplete"
    class="google-places-autocomplete"
    type="text"
    :value="value"
  >
</template>

<script>
  import { mapState } from 'vuex'
  import LoadGoogleMapsApi from 'load-google-maps-api'

  export default {
    name: 'GooglePlacesAutocomplete',

    props: {
      value: String
    },

    data() {
      return {
        autocomplete: {}
      }
    },

    computed: {
      ...mapState([
        'config'
      ])
    },

    mounted: function() {
      /**
       * Load google maps places API if unavailable
       * Then init input
       */
      if (!window.google) {
        LoadGoogleMapsApi({
          key: this.config.googleMapApi,
          libraries: ['places']
        }).then((googleMaps) => {
          this.initInput()
        })
      } else {
        this.initInput()
      }
    },

    methods: {
      /**
       * Initialize the Google Places Input
       */
      initInput: function() {
        this.autocomplete = new google.maps.places.Autocomplete(
          (this.$refs.autocomplete),
          {types: ['(cities)']}
        )

        this.autocomplete.addListener('place_changed', () => {
          this.$emit('place-changed', this.autocomplete.getPlace())
        })
      },

      /**
       * Reset auto complete
       * @param {String} locationName
       */
      reset: function(locationName) {
        this.autocomplete.set('place',null)
        this.$refs.autocomplete.value = locationName
      }
    }
  }

</script>
