import {mapState} from "vuex";
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
      'viewerAnnotations'
    ]),

  },

  methods: {
    addAnnotation: function(start, duration, onAll, label, description, layer) {
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
        layer_id: layer.id,
        start: start,
        end: start + duration
      }

      //Unselect current annotations
      // this.unSelectAnnotations(null, false);

      // Send ADD annotation request to server
      const timeseriesId = this.activeViewer.content.nodeId
      const url = `${this.config.apiUrl}/timeseries/${timeseriesId}/layers/${layer.id}/annotations`
      this.sendXhr(url, {
        method:'POST',
        header: {
          'Authorization': `Bearer ${this.userToken}`
        },
        body:XhrBody
      } )

    },
  }
}