<template />

<script>
import {
  mapGetters,
  mapActions,
  mapState
} from 'vuex'

import {
  pathOr,
  pick,
  propEq,
  propOr,
  merge,
  compose,
  head
} from 'ramda'

import * as site from '@/site-config/site.json'
import logger from '@/mixins/logger'
import EventBus from '@/utils/event-bus'
import Request from '@/mixins/request'
import GetDatasetDoi from '@/mixins/get-dataset-doi'
import { PublicationStatus } from '@/utils/constants'

const getNotification = (key, message) => compose(
  propOr({}, key),
  head
)(message)

export default {
  name: 'BfNotifications',

  mixins: [
    GetDatasetDoi,
    logger,
    Request
  ],

  data() {
    return {
      /**
       * Initial delay before attempting to reopen the connection in the event
       * that it was not closed cleanly. The interval will decay exponentially.
       */
      reopenInterval: 100,
      // Config object for websockets
      websocketConfig: {},
      // Reference for current websocket connection
      websocket: null,
      // Websocket url
      socketUrl: '',
      webSocketReopenAttempt: () => {},
      // Used for debugging connections
      shouldPong: true
    }
  },
  computed: {
    ...mapGetters([
      'getUserToken',
      'getDatasetById',
      'getPublishedDataByIntId',
      'getDatasetByIntId'
    ]),
    ...mapState([
      'dataset',
      'userToken',
      'config'
    ])
  },
  created() {
    this.websocketConfig = {
      reopenInterval: this.reopenInterval
    }
  },
  mounted() {
    this.$store.watch(this.getUserToken, this._watchUserToken.bind(this))
  },
  destroyed() {
    this.close()
  },
  methods: {
    ...mapActions([
      'updateDataset',
      'addDataset',
      'updateDatasetPublishedData'
    ]),

    ...mapActions('publishingModule', [
      'refreshPublishingData'
    ]),

    /**
     * @param {String} userToken
     */
    _watchUserToken: function(userToken) {
      if (userToken && userToken.length > 0) {
        this.socketUrl = `${site.notificationUrl}?access_token=${userToken}`
        this.openWebSocket()
      }
    },
    /**
     * Instantiates an instance of WebSocket, establishing connection with the
     * remote host if url is set and sets up event handlers. Replaces existing
     * instance, if present.
     */
    openWebSocket: function() {
      try {
        this.websocket = new WebSocket(this.socketUrl)
        this.websocket.onopen = this._onOpen.bind(this)
        this.websocket.onclose = this._onClose.bind(this)
        this.websocket.onmessage = this._onMessage.bind(this)
        this.websocket.onerror = this._onError.bind(this)
      } catch (ex) {
        this._onError(ex)
      }
    },
    /**
     * Closes the WebSocket connection or connection attempt, if any. If the
     * connection is already closed, this method does nothing.
     */
    close: function() {
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
      }
    },
    /**
     * Transmits data to the server over the WebSocket connection.
     * @param {String} data A text string to send to the server.
     */
    send: function(data) {
      if (!this.websocket) {
        return
      }
      if (data && typeof data === 'object') {
        data = JSON.stringify(data)
      }
      this.websocket.send(data)
    },
    /**
     * Fired when the WebSocket is opened.
     * @event open
     */
    _onOpen: function() {
      // Reset reopen interval and remove any pending callbacks.
      this.reopenInterval = this.websocketConfig.reopenInterval
      clearTimeout(this.webSocketReopenAttempt)
    },
    /**
     * Fired when the WebSocket is closed.
     * @event close
     * @param {Object} evt A CloseEvent event object.
     */
    _onClose: function(evt) {
      if (evt.code !== 1000) {
        this.webSocketReopenAttempt = setTimeout(() => this.openWebSocket(), this.reopenInterval)
        this.reopenInterval *= 2
      }
    },
    /**
     * Fired when a message is received.
     * @event message
     * @param {Object} event Text string message in `event.detail`.
     */
    _onMessage: function(event) {
      if (!this.websocket) {
        return
      }
      const data = event.data
      if (typeof data === 'string' || Object.prototype.toString.call(data) === '[object String]') {
        try {
          this.handleMessage(data)
        }
        catch (error) {
          EventBus.$emit('toast', {detail: {type: 'ERROR_DETAIL', msg: error}})
        }
      }
    },

    /**
     * Parses message string
     * @param {Object} event Text string message in `event.detail`.
     */
    handleMessage: function(data) {
      const obj = JSON.parse(data)

      const dict = {
        'PING': () => {
          this.handlePing()
        },
        'JobDoneNotification': () => {
          this.handleJobDoneNotification(obj)
        },
        'MentionNotification': () => {
          this.handleMentionNotification(obj)
        },
        'DiscoverPublishNotification': () => {
          this.handleDiscoverPublishNotification(obj)
        }
      }

      const events = Object.keys(dict)
      const list = events.filter(evt => data.includes(evt))

      if (list.length) {
        dict[list[0]]()
      }
    },

    /**
     * Handle PING notification
     */
    handlePing: function() {
      if (this.shouldPong) {
        const pongMsg = `{"Pong":{"users":[0],"messageType":"PongT","message":"PONG","sessionId":"${this.userToken}"}}`
        this.websocket.send(pongMsg)
      }
    },

    /**
     * Handles Job Done notification
     * @param {Array} response
     */
    handleJobDoneNotification: function(response) {
      const jobDoneMessage = pathOr('Your upload has finished processing.', [0, 'JobDoneNotification', 'message'], response)
      EventBus.$emit('toast', {detail: {type: 'MESSAGE', msg: jobDoneMessage}})

      response.forEach(job => {
        const packageDTO = pathOr({}, ['JobDoneNotification', 'packageDTO'], job)
        const packageId = pathOr('', ['content', 'id'], packageDTO)

        if (packageId) {
          EventBus.$emit('job-done', {detail:{ itemId: packageId }})
          EventBus.$emit('update-uploaded-file-state', { packageDTO })
        }
      })
    },

    /**
     * Handles Mention notification
     * @param {Object} JSON payload
     */
    handleMentionNotification: function(obj) {
      const packageName = pathOr('defaultPackageName', [0, 'MentionNotification', 'packageName'], obj)
      if (packageName !== 'defaultPackageName') {
        const mentionMessage = `You have been mentioned in a discussion about package ${packageName}.`
        EventBus.$emit('toast', {detail: {type: 'MESSAGE', msg: mentionMessage}})
      }
    },

    /**
     * Handles notification for when a dataset has finished publishing
     * @param {Object} response
     */
    handleDiscoverPublishNotification: function(response) {
      const message = getNotification('DiscoverPublishNotification', response)

      const isPublishedNotification = propEq('message', 'Dataset published to Discover.', message)
      const isFailedNotification = propEq('message', 'Dataset publish failed.', message)

      if (isPublishedNotification || isFailedNotification) {
        const datasetId = propOr(0, 'sourceDatasetId', message)
        const existingPublishedData = this.getPublishedDataByIntId(datasetId)

        const updatedPublishedData = pick(['sourceDatasetId', 'publishedDatasetId', 'publishedVersionCount', 'lastPublishedDate', 'status' ], message)

        const data = merge(existingPublishedData, updatedPublishedData)
        this.updateDatasetPublishedData(data)

        const currentDatasetIntId = pathOr(0, ['content', 'intId'], this.dataset)
        if (currentDatasetIntId === datasetId) {
          const currentDatasetNodeId = pathOr(0, ['content', 'id'], this.dataset)
          this.getDatasetDoi(currentDatasetNodeId)
        }

        // Set locked property on dataset
        const dataset = this.getDatasetByIntId(datasetId)
        const updatedDataset = merge(dataset, { locked: false })
        this.updateDataset(updatedDataset)

        // Refresh publishing data
        this.refreshPublishingData(PublicationStatus.COMPLETED)
      }
    },

    /**
     * Fired when the WebSocket raises an error.
     */
    _onError: function() {
      this.logger('got websocket error!')
    },
  }
}
</script>
