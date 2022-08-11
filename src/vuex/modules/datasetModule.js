import Cookies from 'js-cookie'
import moment from 'moment'

import { DATASET_ACTIVITY_ALL_CATEGORIES, DATASET_ACTIVITY_ALL_CONTRIBUTORS, DATASET_ACTIVITY_DATE_RANGE_30 } from '@/utils/constants'
import toQueryParams from '@/utils/toQueryParams.js'
import EventBus from '@/utils/event-bus'

/**
 * Converts the days to a date range
 * @param {Object} days
 * @returns {Object}
 */
const getActivityDateRange = (days) => {
  return days
    ? {
        startDate: moment().subtract(days, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD')
      }
    : {}
}

/**
 * Convert the dataset activity state to query
 * params for the endpoint request
 * @param {Object} params
 * @param {String} apiKey
 * @returns {String}
 */
const getQueryParams = (params, apiKey) => {
  const dateRange = getActivityDateRange(params.dateRange.value)

  return toQueryParams({
    api_key: apiKey,
    orderDirection: params.orderDirection,
    ...params.category.value && { category: params.category.value}, // Do not add this key if null
    ...params.userId.value && { userId: params.userId.value}, // Do not add this key if null
    ...params.cursor && { cursor: params.cursor }, // Do not add this key if null
    ...dateRange
  })
}

const getManifestQueryParams = (params, dataset_id) => {

  return toQueryParams({
    dataset_id: dataset_id
  })
}

const initialState = () => ({
  datasetSearchParams: {
    limit: 25,
    offset: 0,
    query: '',
    orderBy: 'Name',
    orderDirection: 'Asc',
    onlyMyDatasets: false,
    status: '',
    withRole: '',
    collectionId: ''
  },
  datasetTotalCount: 0,
  datasetActivityParams: {
    cursor: '',
    orderDirection: 'Asc',
    category: DATASET_ACTIVITY_ALL_CATEGORIES,
    dateRange: DATASET_ACTIVITY_DATE_RANGE_30,
    userId: DATASET_ACTIVITY_ALL_CONTRIBUTORS
  },
  datasetManifestParams: {


  },
  isLoadingDatasetActivity: false,
  isLoadingManifestsActivity: false,
  datasetActivity: [],
  datasetManifests: []
})

export const state = initialState()

export const mutations = {
  CLEAR_STATE(state) {
    //reset all state to initial state
    const _initialState = initialState()
    // need to iteratively set keys to preserve reactivity
    Object.keys(_initialState).forEach(key => state[key] = _initialState[key])
  },

  CLEAR_DATASET_ACTIVITY_STATE(state) {
    const _initialState = initialState()

    const clearedState = {
      isLoadingDatasetActivity: _initialState.isLoadingDatasetActivity,
      isLoadingManifestsActivity: _initialState.isLoadingManifestsActivity,
      datasetActivity: _initialState.datasetActivity,
      datasetActivityParams: _initialState.datasetActivityParams
    }

    Object.keys(clearedState).forEach(key => state[key] = clearedState[key])
  },

  UPDATE_DATASET_TOTAL_COUNT(state, datasetTotalCount) {
    state.datasetTotalCount = datasetTotalCount
  },

  UPDATE_DATASET_SEARCH_QUERY(state, searchQuery) {
    state.datasetSearchParams.query = searchQuery
  },

  UPDATE_DATASET_OFFSET(state, offset) {
    state.datasetSearchParams.offset = offset
  },

  UPDATE_DATASET_SEARCH_LIMIT(state, limit) {
    state.datasetSearchParams.limit = limit
  },

  UPDATE_DATASET_SEARCH_ORDER_DIRECTION(state, orderDirection) {
    state.datasetSearchParams.orderDirection = orderDirection
  },

  UPDATE_DATASET_SEARCH_ONLY_MY_DATASETS(state, onlyMyDatasets) {
    state.datasetSearchParams.onlyMyDatasets = onlyMyDatasets
  },

  UPDATE_DATASET_SEARCH_STATUS(state, onlyMyDatasets) {
    state.datasetSearchParams.status = onlyMyDatasets
  },

  UPDATE_DATASET_SEARCH_WITH_ROLE(state, role) {
    state.datasetSearchParams.withRole = role
  },

  UPDATE_DATASET_SEARCH_WITH_COLLECTION(state, collection) {
    state.datasetSearchParams.collectionId = collection
  },

  UPDATE_DATASET_SEARCH_ORDER_BY(state, orderBy) {
    state.datasetSearchParams.orderBy = orderBy
  },

  UPDATE_DATASET_ACTIVITY_ORDER_DIRECTION(state, orderDirection) {
    state.datasetActivityParams.orderDirection = orderDirection
  },

  UPDATE_DATASET_ACTIVITY_CATEGORY(state, category) {
    state.datasetActivityParams.category = { ...category }
  },

  UPDATE_DATASET_ACTIVITY_USER_ID(state, userId) {
    state.datasetActivityParams.userId = { ...userId }
  },

  UPDATE_DATASET_ACTIVITY_DATE_RANGE(state, dateRange) {
    state.datasetActivityParams.dateRange = { ...dateRange }
  },

  UPDATE_IS_LOADING_DATASET_ACTIVITY(state, isLoading) {
    state.isLoadingDatasetActivity = isLoading
  },

  UPDATE_DATASET_ACTIVITY_CURSOR(state, cursor) {
    state.datasetActivityParams.cursor = cursor
  },

  UPDATE_DATASET_ACTIVITY(state, activity) {
    state.datasetActivity = activity
  },

  UPDATE_DATASET_MANIFESTS(state, manifests) {
    state.datasetManifests = manifests
  },

  UPDATE_IS_LOADING_MANIFESTS(state, isLoading) {
    state.isLoadingManifestsActivity = isLoading
  },


}

export const actions = {
  updateDatasetActivityCursor: ({commit}, evt) => commit('UPDATE_DATASET_ACTIVITY_CURSOR', evt),
  updateDatasetTotalCount: ({commit}, evt) => commit('UPDATE_DATASET_TOTAL_COUNT', evt),
  updateDatasetSearchQuery: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_QUERY', evt)
    commit('UPDATE_DATASET_OFFSET', 0)
  },
  updateDatasetOffset: ({commit}, evt) => commit('UPDATE_DATASET_OFFSET', evt),
  updateDatasetSearchLimit: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_LIMIT', evt)
    commit('UPDATE_DATASET_OFFSET', 0)
  },
  updateDatasetSearchOrderDirection: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_ORDER_DIRECTION', evt)
    commit('UPDATE_DATASET_OFFSET', 0)
  },
  updateDatasetSearchOnlyMyDatasets: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_ONLY_MY_DATASETS', evt)
    commit('UPDATE_DATASET_SEARCH_WITH_COLLECTION', '')
    commit('UPDATE_DATASET_SEARCH_STATUS', '')
    commit('UPDATE_DATASET_SEARCH_WITH_ROLE', '')
    commit('UPDATE_DATASET_OFFSET', 0)
  },
  updateDatasetSearchStatus: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_STATUS', evt)
    commit('UPDATE_DATASET_SEARCH_WITH_COLLECTION', '')
    commit('UPDATE_DATASET_SEARCH_WITH_ROLE', '')
    commit('UPDATE_DATASET_SEARCH_ONLY_MY_DATASETS', false)
    commit('UPDATE_DATASET_OFFSET', 0)
  },
  updateDatasetSearchWithRole: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_WITH_ROLE', evt)
    commit('UPDATE_DATASET_SEARCH_WITH_COLLECTION', '')
    commit('UPDATE_DATASET_SEARCH_STATUS', '')
    commit('UPDATE_DATASET_SEARCH_ONLY_MY_DATASETS', false)
    commit('UPDATE_DATASET_OFFSET', 0)
  },

  updateDatasetSearchWithCollection: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_WITH_COLLECTION', evt)
    commit('UPDATE_DATASET_SEARCH_WITH_ROLE', '')
    commit('UPDATE_DATASET_SEARCH_STATUS', '')
    commit('UPDATE_DATASET_SEARCH_ONLY_MY_DATASETS', false)
    commit('UPDATE_DATASET_OFFSET', 0)
  },

  updateDatasetSearchOrderBy: ({commit}, evt) => {
    commit('UPDATE_DATASET_SEARCH_ORDER_BY', evt)
    commit('UPDATE_DATASET_OFFSET', 0)
  },
  clearSearchState: ({commit}) => {
    commit('CLEAR_STATE')
  },

  updateDatasetActivityOrderDirection: ({commit, dispatch}, orderDirection) => {
    commit('UPDATE_DATASET_ACTIVITY_CURSOR', '')
    commit('UPDATE_DATASET_ACTIVITY_ORDER_DIRECTION', orderDirection)
    dispatch('fetchDatasetActivity')
  },

  updateDatasetActivityCategory: ({ commit, dispatch }, category) => {
    commit('UPDATE_DATASET_ACTIVITY_CURSOR', '')
    commit('UPDATE_DATASET_ACTIVITY_CATEGORY', category)
    dispatch('fetchDatasetActivity')
  },

  updateDatasetActivityUserId: ({ commit, dispatch }, userId) => {
    commit('UPDATE_DATASET_ACTIVITY_CURSOR', '')
    commit('UPDATE_DATASET_ACTIVITY_USER_ID', userId)
    dispatch('fetchDatasetActivity')
  },

  updateDatasetActivityDateRange: ({ commit, dispatch }, dateRange) => {
    commit('UPDATE_DATASET_ACTIVITY_CURSOR', '')
    commit('UPDATE_DATASET_ACTIVITY_DATE_RANGE', dateRange)
    dispatch('fetchDatasetActivity')
  },

  fetchDatasetManifests: async ({state, commit, rootState}) => {

    commit('UPDATE_IS_LOADING_MANIFESTS', true)

    const datasetId = rootState.route.params.datasetId
    const endpoint = `${rootState.config.api2Url}/manifest`

    const apiKey = rootState.userToken || Cookies.get('user_token')
    const queryParams = getManifestQueryParams(state.datasetManifestParams, datasetId)

    const url = `${endpoint}?${queryParams}`
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    try {
      const resp = await fetch(url, { headers: myHeaders })
      if (resp.ok) {
        const { manifests } = await resp.json()
        commit('UPDATE_DATASET_MANIFESTS', manifests)

      } else {
        commit('UPDATE_DATASET_MANIFESTS', [])
        throw new Error(resp.statusText)
      }
      commit('UPDATE_IS_LOADING_MANIFESTS', false)
    } catch (err) {
      EventBus.$emit('ajaxError', err)
      commit('UPDATE_IS_LOADING_MANIFESTS', false)
      commit('UPDATE_DATASET_MANIFESTS', [])
    }
  },

  fetchDatasetActivity: async ({state, commit, rootState}) => {
    commit('UPDATE_IS_LOADING_DATASET_ACTIVITY', true)

    const datasetId = rootState.route.params.datasetId
    const endpoint = `${rootState.config.apiUrl}/datasets/${datasetId}/changelog/timeline`

    const apiKey = rootState.userToken || Cookies.get('user_token')
    const queryParams = getQueryParams(state.datasetActivityParams, apiKey)

    const url = `${endpoint}?${queryParams}`

    try {
      const resp = await fetch(url)
      if (resp.ok) {
        const { eventGroups, cursor } = await resp.json()
        const datasetActivity = state.datasetActivityParams.cursor ? [ ...state.datasetActivity, ...eventGroups ] : eventGroups
        commit('UPDATE_DATASET_ACTIVITY', datasetActivity)

        commit('UPDATE_DATASET_ACTIVITY_CURSOR', cursor)
      } else {
        commit('UPDATE_DATASET_ACTIVITY', [])
        throw new Error(resp.statusText)
      }
      commit('UPDATE_IS_LOADING_DATASET_ACTIVITY', false)
    } catch (err) {
      EventBus.$emit('ajaxError', err)
      commit('UPDATE_IS_LOADING_DATASET_ACTIVITY', false)
      commit('UPDATE_DATASET_ACTIVITY', [])
    }
  },
  clearDatasetActivityState: ({commit}) => {
    commit('CLEAR_DATASET_ACTIVITY_STATE')
  },
}

export const getters = {
  curDatasetSearchPage: state => {
    return state.datasetSearchParams.offset / state.datasetSearchParams.limit + 1
  }
}

const datasetsModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default datasetsModule
