import Cookies from 'js-cookie'

import toQueryParams from '@/utils/toQueryParams.js'
import { PublicationTabs, PublicationTabsStatuses, PublicationTabsTypes, StatusActions, PublicationStatus } from '@/utils/constants.js'

import EventBus from '@/utils/event-bus'

const publishingSearchParams = () => ({
  limit: 25,
  offset: 0,
  query: '',
  orderBy: 'Name',
  orderDirection: 'Asc',
  totalCount: 0
})

const fetchDatasetsUrl = (state, rootState, publicationStatus, publicationType, isOnPublishedTab) => {
  const apiKey = rootState.userToken || Cookies.get('user_token')

  /**
   * Only fetch the datasets if the user is in the publishing tab
   */

  const queryParams = toQueryParams({
    publicationStatus,
    api_key: apiKey,
    includeBannerUrl: true,
    includePublishStatus: true,
    publicationType,
    ...state.publishingSearchParams
  })

  const publishedQueryParams = toQueryParams({
    api_key: apiKey,
    includeBannerUrl: true,
    ...state.publishingSearchParams
  })

  return isOnPublishedTab
    ? `${rootState.config.apiUrl}/datasets/published/paginated?${publishedQueryParams}`
    : `${rootState.config.apiUrl}/datasets/paginated?${queryParams}`
}


const initialState = () => ({
    /*
     * Used for pending review tab which is a combination of
     * REQUESTED, ACCEPTED, and FAILED
     */
    [PublicationTabs.REVIEW]: {
      count: 0,
      datasets: []
    },
    [PublicationTabs.PUBLISHED]: {
      count: 0,
      datasets: []
    },
    [PublicationTabs.REJECTED]: {
      count: 0,
      datasets: []
    },
    publishingSearchParams: publishingSearchParams(),
    isLoadingDatasets: false
})

export const state = initialState()

export const mutations = {
  CLEAR_STATE(state) {
    //reset all state to initial state
    const _initialState = initialState()
    // need to iteratively set keys to preserve reactivity
    Object.keys(_initialState).forEach(key => state[key] = _initialState[key])
  },

  CLEAR_SEARCH_PARAMS(state) {
    state.publishingSearchParams = publishingSearchParams()
  },

  UPDATE_PUBLISHING_TOTAL_COUNT(state, { type, count }) {
    state[type].count = count
  },

  UPDATE_DATASETS(state, { type, datasets }) {
    state[type].datasets = datasets
  },

  UPDATE_PUBLISHING_SEARCH_QUERY(state, searchQuery) {
    state.publishingSearchParams.query = searchQuery
  },

  UPDATE_PUBLISHING_OFFSET(state, offset) {
    state.publishingSearchParams.offset = offset
  },

  UPDATE_PUBLISHING_SEARCH_LIMIT(state, limit) {
    state.publishingSearchParams.limit = limit
  },

  UPDATE_PUBLISHING_SEARCH_ORDER_DIRECTION(state, orderDirection) {
    state.publishingSearchParams.orderDirection = orderDirection
  },

  UPDATE_PUBLISHING_SEARCH_ORDER_BY(state, orderBy) {
    state.publishingSearchParams.orderBy = orderBy
  },

  UPDATE_PUBLISHING_SEARCH_TOTAL_COUNT(state, count) {
    state.publishingSearchParams.totalCount = count
  },

  UPDATE_IS_LOADING_DATASETS(state, isLoadingDatasets) {
    state.isLoadingDatasets = isLoadingDatasets
  }
}

export const actions = {
  clearSearchState: ({commit}) => {
    commit('CLEAR_STATE')
  },
  clearSearchParams: ({commit}) => {
    commit('CLEAR_SEARCH_PARAMS')
  },
  updateDatasetTotalCount: ({commit}, { type, count }) => {
    commit('UPDATE_PUBLISHING_TOTAL_COUNT', { type, count })
  },

  updatePublishingSearchQuery: ({commit, dispatch}, evt) => {
    commit('UPDATE_PUBLISHING_SEARCH_QUERY', evt)
    commit('UPDATE_PUBLISHING_OFFSET', 0)

    dispatch('fetchDatasets')
  },

  updatePublishingOffset: ({commit, dispatch}, evt) => {
    commit('UPDATE_PUBLISHING_OFFSET', evt)

    dispatch('fetchDatasets')
  },

  updatePublishingSearchLimit: ({commit, dispatch}, evt) => {
    commit('UPDATE_PUBLISHING_SEARCH_LIMIT', evt)
    commit('UPDATE_PUBLISHING_OFFSET', 0)

    dispatch('fetchDatasets')
  },

  updatePublishingSearchOrderDirection: ({commit, dispatch}, evt) => {
    commit('UPDATE_PUBLISHING_SEARCH_ORDER_DIRECTION', evt)
    commit('UPDATE_PUBLISHING_OFFSET', 0)

    dispatch('fetchDatasets')
  },

  updatePublishingSearchOrderBy: ({commit, dispatch}, evt) => {
    commit('UPDATE_PUBLISHING_SEARCH_ORDER_BY', evt)
    commit('UPDATE_PUBLISHING_OFFSET', 0)

    dispatch('fetchDatasets')
  },

  updatePublishingSearchTotalCount: ({commit}, count) => {
    commit('UPDATE_PUBLISHING_SEARCH_TOTAL_COUNT', count)
  },

  updateDatasets: ({commit}, { type, datasets }) => {
    commit('UPDATE_DATASETS', { type, datasets })
  },

  updateIsLoadingDatasets: ({commit}, isLoadingDatasets) => {
    commit('UPDATE_IS_LOADING_DATASETS', isLoadingDatasets)
  },

  fetchDatasets: async ({state, commit, rootState}) => {
    /**
     * Only fetch the datasets if the user is in the publishing tab
     */
    const publicationStatus = PublicationTabsStatuses[rootState.route.name]
    if(!publicationStatus) {
      return
    }

    commit('UPDATE_IS_LOADING_DATASETS', true)

    const publicationType = PublicationTabsTypes[rootState.route.name]

    const isOnPublishedTab = publicationType == PublicationTabsTypes[PublicationTabs.PUBLISHED]

    const url = fetchDatasetsUrl(state, rootState, publicationStatus, publicationType, isOnPublishedTab)

    try {
      const resp = await fetch(url)
      if (resp.ok) {
        const { datasets, totalCount } = await resp.json();
        commit('UPDATE_PUBLISHING_SEARCH_TOTAL_COUNT', totalCount);
        // If on the published tab, merge the dataset and published
        // dataset DTOs if the user has permissions for the dataset
        const updatedDatasets = isOnPublishedTab
        ? datasets.map(dataset => {
          const embargoAccess = dataset.embargoAccess || ''
          const publishedDataset = { ...dataset.publishedDataset, embargoAccess}

          return dataset.dataset
            ? {...dataset.dataset, ...publishedDataset}
            : publishedDataset
        })
        : datasets;
        commit('UPDATE_DATASETS', { type: rootState.route.name, datasets: updatedDatasets });
        commit('UPDATE_IS_LOADING_DATASETS', false);
      } else {
        throw new Error(resp.statusText);
      }
    } catch (err) {
      EventBus.$emit('ajaxError', err)
    }
  },

  getDatasetCount: async ({commit, rootState}, type) => {
    const apiKey = rootState.userToken || Cookies.get('user_token')

    const statuses = PublicationTabsStatuses[type]
    const types = PublicationTabsTypes[type]
    const isOnPublishedTab = statuses.includes(PublicationStatus.COMPLETED)

    const queryParams = toQueryParams({
      publicationStatus: statuses,
      publicationType: types,
      api_key: apiKey,
      limit: 0
    })

    const url = isOnPublishedTab
    ? `${rootState.config.apiUrl}/datasets/published/paginated?${queryParams}`
    : `${rootState.config.apiUrl}/datasets/paginated?${queryParams}`
    try {
      const resp = await fetch(url)
      if (resp.ok) {
        const { totalCount } = await resp.json()
        commit('UPDATE_PUBLISHING_TOTAL_COUNT', { type, count: totalCount })
      } else {
        throw new Error(resp.statusText)
      }
    } catch (err) {
      EventBus.$emit('ajaxError', err)
    }
  },

  refreshPublishingData: ({ dispatch }, status) => {
    const actions = StatusActions[status]

    actions.forEach(action => {
      dispatch('getDatasetCount', action)
    })

    dispatch('fetchDatasets')
  }
}

export const getters = {
  getTotalCount: state => (type) => {
    return state[type].count || 0
  },
  getDatasets: state => (type) => {
    return state[type].datasets
  }
}

const publishingModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default publishingModule
