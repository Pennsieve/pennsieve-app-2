import {mapState, mapActions} from "vuex";
import Request from '@/mixins/request'

export default {
  mixins: [
    Request
  ],
  data: function() {
    return {
    }
  },

  computed: {
    ...mapState('viewer', [
      'userToken',
      'activeViewer',
      'viewerChannels',
      'viewerSidePanelOpen',
      'viewerAnnotations',
      'activeAnnotation'
    ]),
    ...mapActions('viewer', [
      'createAnnotation'
    ])

  },

  methods: {
    addAnnotation: function() {

      // assert that we only call this function on activeAnnotations without an existing ID
      if (this.activeAnnotation.id) {
        throw new TypeError("Trying to create an annotation that already exists", this.activeAnnotation.id)
      }

      let start = this.activeAnnotation.start
      let duration = this.activeAnnotation.duration
      const onAll =  this.activeAnnotation.allChannels
      const label = this.activeAnnotation.label
      const description = this.activeAnnotation.description
      const layer_id = this.activeAnnotation.layer_id

      // correct negative durations
      if (duration < 0 ) {
        duration = -duration;
        start = start - duration;
      }

      const onChannels = [];
      for (let ch = 0; ch < this.viewerChannels.length; ch++) {
        const curChannelView = this.viewerChannels[ch];
        if((curChannelView.selected && curChannelView.visible) || onAll) {
          const id = this.getChannelId(curChannelView)
          onChannels.push(id);
        }
      }

      const XhrBody = {
        name: '',
        channelIds: onChannels,
        label: label,
        description: description,
        layer_id: layer_id,
        start: start,
        end: start + duration
      }

      //Unselect current annotations
      // this.unSelectAnnotations(null, false);

      // Send ADD annotation request to server
      const timeseriesId = this.activeViewer.content.nodeId
      const url = `${this.config.apiUrl}/timeseries/${timeseriesId}/layers/${layer_id}/annotations`
      this.sendXhr(url, {
        method:'POST',
        header: {
          'Authorization': `Bearer ${this.userToken}`
        },
        body:XhrBody
      } ).then((response) => {
        const newAnn = {
          name: '',
          id: response.id,
          label: response.label,
          description: response.description,
          start: response.start,
          duration: response.end - response.start,
          end: response.end,
          cStart: null,
          cEnd: null,
          selected: true,
          channelIds: response.channelIds,
          allChannels: false,
          layer_id: response.layerId,
          userId: response.userId
        };
        if (response.linkedPackage) {
          newAnn.linkedPackage = response.linkedPackage
        }

        // Check if all channels are selected
        if (newAnn.channelIds.length >= this.viewerChannels.length) {
          newAnn.allChannels = true;
        }

        // Find layer
        let curLIndex = 0;
        for (let i = 0; i < this.viewerAnnotations.length; i++) {
          if (this.viewerAnnotations[i].id === response.layerId) {
            curLIndex = i;
            break;
          }
        }

        this.$store.dispatch('viewer/createAnnotation',newAnn)
          .then(() => {
            this.sortAnns(this.viewerAnnotations[curLIndex].annotations);
            this.onAnnotationCreated()
          })
      })
        .catch(
        )


    },
    updateAnnotation: function() {

      if (!this.activeAnnotation.id) {
        throw new TypeError("Trying to update an annotation that doesn't exists on server", this.activeAnnotation.id)
      }

      let start = this.activeAnnotation.start
      let duration = this.activeAnnotation.duration

      // correct negative durations
      if (duration < 0 ) {
        duration = -duration;
        start = start - duration;
        this.activeAnnotation.start = start
        this.activeAnnotation.duration = duration
        this.activeAnnotation.end = start + duration
      }

      const annLayerId = this.activeAnnotation.layer_id
      const timeseriesId = this.activeViewer.content.nodeId
      const url = `${this.config.apiUrl}/timeseries/${timeseriesId}/layers/${annLayerId}/annotations/${this.activeAnnotation.id}`;

      const XhrBody = {
        name: '',
        channelIds: this.activeAnnotation.channelIds,
        label: this.activeAnnotation.label,
        description: this.activeAnnotation.description,
        layer_id: this.activeAnnotation.layer_id,
        start: start,
        end: start + duration
      }

      const self = this
      self.sendXhr(url, {
        method:'PUT',
        header: {
          'Authorization': `Bearer ${this.userToken}`
        },
        body:XhrBody
      } ).then((response) => {
        self.$store.dispatch('viewer/updateAnnotation', this.activeAnnotation)
        self.onAnnotationUpdated()
      })
        .catch(self.handleXhrError.bind(this))
    },
    removeAnnotation: function(annotation) {
      let annLayerId = ''
      // annotation data structure properties vary depending on if the user
      // is canceling newly created annotation or not
      if (annotation.layer) {
        annLayerId = annotation.layer.id
      } else {
        annLayerId = annotation.layer_id
      }
      const timeseriesId = this.activeViewer.content.nodeId
      const url = `${this.config.apiUrl}/timeseries/${timeseriesId}/layers/${annLayerId}/annotations/${annotation.id}`;

      const self = this
      self.sendXhr(url, {
        method:'DELETE',
        header: {
          'Authorization': `Bearer ${this.userToken}`
        },
      } ).then((response) => {
        self.$store.dispatch('viewer/deleteAnnotation', annotation)
        self.onAnnotationDeleted()
      })
        .catch(self.handleXhrError.bind(this))

    },
    sortAnns: function(annArray) {
      annArray.sort(function Comparator(a, b) {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
      });
    },
  }
}