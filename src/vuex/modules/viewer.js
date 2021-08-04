import Vue from 'vue'
import { merge, propOr, propEq, findIndex, flatten, compose, pluck, pathOr, contains, remove, find } from 'ramda'
import { viewerSidePanelTypes, viewerToolTypes } from '@/utils/constants'

const getLayerIndex = (key, data, viewerAnnotations) => {
  const layerId = propOr('', key, data)
  const layerIndex = findIndex(propEq('id', layerId), viewerAnnotations)

  return layerIndex
}

const initialState = () => ({
  activeViewer: {},
  viewerSidePanelOpen: false,
  viewerSlideInfo: {
    curRotation: 0,
    curZoom: 0,
    isMeasuring: false,
    measureLength: 0,
    zoomPerClick: 0,
    minZoom: 0,
    maxZoom: 0
  },
  viewerChannels: [],
  viewerAnnotations: [],
  activeAnnotationLayer: {},
  viewerDiscussions: {
    comments: {},
    discussions: []
  },
  viewerErrors: {},
  //TODO make strings enum constants
  viewerSidePanelView: viewerSidePanelTypes.INFO_PANEL,
  viewerActiveTool: viewerToolTypes.POINTER,
  viewerMontageScheme: 'NOT_MONTAGED'
})

export const state = initialState()

export const mutations = {
  //TODO figure out why we clear state twice?
  CLEAR_STATE(state) {
    //reset all state to initial state
    const _initialState = initialState()
    // need to iteratively set keys to preserve reactivity
    Object.keys(_initialState).forEach(key => state[key] = _initialState[key])
  },

  OPEN_VIEWER(state, viewer) {
    state.activeViewer = viewer
  },

  SET_SIDE_PANEL(state, sidePanel) {
    state.viewerSidePanelOpen = sidePanel.open
    state.viewerSidePanelView = sidePanel.view
  },

  SET_ACTIVE_TOOL(state, tool) {
    state.viewerActiveTool = tool
  },

  UPDATE_VIEWER_SLIDE_INFO (state, newSlideInfo) {
    state.viewerSlideInfo = newSlideInfo
  },

  SET_CHANNELS (state, channels) {
    state.viewerChannels = channels
  },

  UPDATE_CHANNEL (state, { data, channelIndex }) {
    Vue.set(state.viewerChannels, channelIndex, data)
  },

  CREATE_LAYER (state, data)  {
    state.viewerAnnotations.push(data)
  },

  SET_ACTIVE_ANNOTATION_LAYER (state, data) {
    state.activeAnnotationLayer = data
  },

  UPDATE_LAYER (state, { layer, index })  {
    Vue.set(state.viewerAnnotations, index, layer)
  },

  DELETE_LAYER (state, { index })  {
    state.viewerAnnotations.splice(index, 1)
  },

  SET_ANNOTATIONS (state, data) {
    state.viewerAnnotations = data
  },

  CREATE_ANNOTATION (state, { annotation, index }) {
    state.viewerAnnotations[index].annotations.push(annotation)
  },

  UPDATE_ANNOTATION (state, { data }) {
    const layerIndex = getLayerIndex('layer_id', data, state.viewerAnnotations)
    const annotations = state.viewerAnnotations[layerIndex].annotations
    const annotationIndex = findIndex(propEq('id', data.id), annotations)

    annotations[annotationIndex] = data
  },

  DELETE_ANNOTATION (state, { data }) {
    const layerIndex = getLayerIndex('layer_id', data, state.viewerAnnotations)
    const annotations = state.viewerAnnotations[layerIndex].annotations
    const annotationIndex = findIndex(propEq('id', data.id), annotations)

    annotations.splice(annotationIndex, 1)
  },

  SET_DISCUSSIONS (state, { discussions, comments }) {
    state.viewerDiscussions = {
      discussions,
      comments
    }
  },

  //TODO the business logic in here should be moved to an action which also uses CREATE_COMMENT
  CREATE_DISCUSSION (state, data) {
    // Add comment
    const commentDiscussionId = pathOr('', ['comment', 'discussion_id'], data)
    const comments = state.viewerDiscussions.comments[commentDiscussionId]

    if (comments) {
      comments.push(data.comment)
    }

    /*
     * Add discussion if needed
     * Also create comment for discussion
     */
    const discussions = state.viewerDiscussions.discussions
    const hasDiscussion = contains(data.discussion, discussions)

    if (hasDiscussion === false) {
      discussions.push(data.discussion)
      Vue.set(state.viewerDiscussions.comments, commentDiscussionId, [data.comment])
    }
  },

  REMOVE_DISCUSSION (state, discussionIndex) {
    state.viewerDiscussions.discussions.splice(discussionIndex, 1)
  },

  CREATE_COMMENT (state, { comment, discussionId }) {
    propOr([], discussionId, state.viewerDiscussions.comments).push(comment)
  },

  //TODO move logic to action, use removeDiscussion action instead of manually doing it if no more comments
  REMOVE_COMMENT (state, data) {
    const discussionId = propOr(0, 'discussion_id', data)
    const comments = propOr([], discussionId, state.viewerDiscussions.comments)

    const commentId = propOr(0, 'id', data)
    const commentIdx = findIndex(propEq('id', commentId), comments)

    const updatedComments = remove(commentIdx, 1, comments)

    Vue.set(state.viewerDiscussions.comments, discussionId, updatedComments)

    // Remove discussion if there are no more comments
    if (updatedComments.length === 0) {
      const discussions = state.viewerDiscussions.discussions
      const discussionIdx = findIndex(propEq('id', discussionId), discussions)

      state.viewerDiscussions.discussions.splice(discussionIdx, 1)
    }

  },

  SET_VIEWER_ERRORS (state, data) {
    state.viewerErrors = data
  },

  SET_VIEWER_MONTAGE_SCHEME (state, data) {
    state.viewerMontageScheme = data
  },
}

export const actions = {
  openViewer: ({ commit }, evt) =>
    commit('OPEN_VIEWER', evt),
  closeViewer: ({ commit }, evt) =>
    commit('CLEAR_STATE', evt),
  setSidePanel: ({ commit }, evt) =>
    commit('SET_SIDE_PANEL', evt),
  setActiveTool: ({ commit }, evt) =>
    commit('SET_ACTIVE_TOOL', evt),
  setChannels: ({ commit }, evt) => {
    commit('SET_CHANNELS', evt)},
  updateChannel: ({ commit, state }, channel) => {
    const id = propOr('', 'id', channel)
    const channelIndex = findIndex(propEq('id', id), state.viewerChannels)

    commit('UPDATE_CHANNEL', { data: channel, channelIndex})
  },
  createLayer: ({ commit }, evt) =>
    commit('CREATE_LAYER', evt),
  setActiveAnnotationLayer: ({ commit }, evt) =>
    commit('SET_ACTIVE_ANNOTATION_LAYER', evt),
  updateLayer: ({ commit, state }, data) => {
    const index = getLayerIndex('id', data, state.viewerAnnotations)
    const layer = Object.assign( state.viewerAnnotations[index], data)
    commit('UPDATE_LAYER', { layer, index })
  },
  deleteLayer: ({ commit, state }, data) => {
    const index = getLayerIndex('id', data, state.viewerAnnotations)

    commit('DELETE_LAYER', { index })
  },
  setAnnotations: ({ commit }, annotations) =>
    commit('SET_ANNOTATIONS', annotations),
  createAnnotation: ({ commit, state }, annotation) => {
    const index = getLayerIndex('layer_id', annotation, state.viewerAnnotations)

    commit('CREATE_ANNOTATION', { annotation, index })
  },
  updateAnnotation: ({ commit }, data) =>
    commit('UPDATE_ANNOTATION', { data }),
  deleteAnnotation: ({commit, getters}, data) =>
    commit('DELETE_ANNOTATION', { data, getters }),
  updateViewerSlideInfo: ({ commit }, evt) => {
    const newSlideInfo = merge(state.viewerSlideInfo, evt)

    commit('UPDATE_VIEWER_SLIDE_INFO', newSlideInfo)
  },
  setDiscussions: ({commit}, discussionData) => {
    const discussions = propOr([], 'discussions', discussionData)
    const comments = propOr({}, 'comments', discussionData)

    commit('SET_DISCUSSIONS', { discussions, comments })
  },
  createDiscussion: ({commit}, evt) =>
    commit('CREATE_DISCUSSION', evt),
  removeDiscussion: ({commit}, evt) => {
    const discussionIndex = findIndex(
      propEq('id', evt),
      state.viewerDiscussions.discussions
    )
    commit('REMOVE_DISCUSSION', discussionIndex)
  },
  createComment: ({commit}, comment) => {
    const discussionId = propOr(0, 'discussion_id', comment)
    commit('CREATE_COMMENT', { comment, discussionId })
  },
  removeComment: ({commit}, evt) =>
    commit('REMOVE_COMMENT', evt),
  setViewerErrors: ({ commit }, evt) =>
    commit('SET_VIEWER_ERRORS', evt),
  setViewerMontageScheme: ({commit}, evt) =>
    commit('SET_VIEWER_MONTAGE_SCHEME', evt),
}

export const getters = {
  viewerSelectedChannels: state => {
    return state.viewerChannels.filter(channel => {
      return channel.selected
    })
  },
  getViewerActiveLayer: state => () => {
    return find(propEq('selected', true), state.viewerAnnotations)
  },
  getAnnotationById: state => (id) => compose(
    find(propEq('id', id)),
    flatten,
    pluck('annotations')
  )(state.viewerAnnotations),

  /**
   * MPP stands for Microns per Pixel
   * This is used to get the density of the slide
   * and translate it to physical size
   */
  viewerMpp: state => compose(
    propOr('', 'value'),
    find(propEq('key', 'aperio.MPP')),
    propOr([{}], 'properties'),
    find(propEq('category', 'Blackfynn')),
    propOr([{}], 'properties')
  )(state.activeViewer)
}

const viewModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default viewModule
