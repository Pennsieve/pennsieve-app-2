import { defaultTo, propEq,find } from 'ramda'
import Cookies from "js-cookie";

const sortRepositories = (repositories) => {
  return repositories.sort((a, b) => a.displayName.localeCompare(b.name, 'en', { numeric: true}))
}

const initialState = () => ({
  repositories: [],
  datasetProposals:[
    {
      id: 1,
      name: "This is a sample dataset",
      status: "SUBMITTED",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt labore et dolore magna aliqua. Ut enim ada minim veniam, quis nostrud exercitation ullamco laboris consequat.",
      repositoryId: 1,
      userId: 19,
      datasetNodeId: "",
      organizationNodeId: "",
      survey: [
        {
          question: 1,
          response: "About 15GB"
        },
        {
          question: 2,
          response: "MRI, Timeseries, and others"
        }
      ]
    },
    {
      id: 2,
      name: "This is a second proposed dataset",
      status: "ACCEPTED",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt labore et dolore magna aliqua. Ut enim ada minim veniam, quis nostrud exercitation ullamco laboris consequat.",
      repositoryId: 2,
      userId: 19,
      datasetNodeId: "N:Dataset:xxx",
      organizationNodeId: "N:Organization:xxx",
      survey: [
        {
          question: 1,
          response: "About 15GB"
        },
        {
          question: 2,
          response: "MRI, Timeseries, and others"
        }
      ]
    },
  ],
  repositoryModalVisible: false,
  requestModalVisible: false,
  shouldCollapsePrimaryNav: false,
  repositoryDescription: '**This is a sample repository**',
  isLoadingRepositoryDescription: false,
  selectedRepoForRequest: {}
})

export const state = initialState()

export const mutations = {
  CLEAR_STATE(state) {
    //reset all state to initial state
    const _initialState = initialState()
    // need to iteratively set keys to preserve reactivity
    Object.keys(_initialState).forEach(key => state[key] = _initialState[key])
  },
  UPDATE_REPOSITORIES(state, repositories) {
    state.repositories = sortRepositories(repositories)
  },
  UPDATE_REPOSITORY_INFO_MODAL_VISIBLE (state, data) {
    state.repositoryModalVisible = data
  },
  UPDATE_REQUEST_MODAL_VISIBLE (state, data) {
    state.requestModalVisible = data
  },
  UPDATE_SHOULD_COLLAPSE_PRIMARY_NAV (state, data) {
    state.shouldCollapsePrimaryNav = data
  },
  SET_IS_LOADING_REPOSITORY_DESCRIPTION (state, data) {
    const isLoading = defaultTo(false, data)
    state.isLoadingRepositoryDescription = isLoading
  },
  SET_REPOSITORY_DESCRIPTION(state, data) {
    state.repositoryDescription = data
  },
  SET_SELECTED_REPO(state, data) {
    state.selectedRepoForRequest = data
  }
}

export const actions = {
  updateRepositories: ({commit}, data) => commit('UPDATE_REPOSITORIES', data),
  fetchRepositories: async({ commit, rootState }) => {
    try {
      let url = `${rootState.config.api2Url}/publishing/repositories`
      const apiKey = rootState.userToken || Cookies.get('user_token')
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer ' + apiKey)
      myHeaders.append('Accept', 'application/json')
      const response = await fetch(url, { headers: myHeaders })
      if (response.ok) {
        const responseJson = await response.json()
        let count = 0
        let repositories = responseJson.map(r => {
          return {
          'id': ++count,
          'organizationNodeId': r.OrganizationNodeId,
          'name': r.Name,
          'displayName': r.DisplayName,
          'organizationId': r.WorkspaceId,
          'isPublic': r.Type === "PUBLIC",
          'description': r.Description,
          'site': r.URL,
          'readme': r.OverviewDocument,
          'logo': r.LogoFile,
          'survey': r.Questions,
        } })
        commit('UPDATE_REPOSITORIES', repositories)
      } else {
        commit('UPDATE_REPOSITORIES', [])
        throw new Error(resp.statusText)
      }
    }
    catch (err) {
      commit('UPDATE_REPOSITORIES', [])
    }
  },
  updateModalVisible: ({ commit, rootState, state }, isModalVisible) => {
    commit('UPDATE_REPOSITORY_INFO_MODAL_VISIBLE', isModalVisible)

    /*
     * Determine if the primary navigation should be uncollapsed
     * when closing the search dialog. If the menu starts collapsed
     * when the user opens search, do not uncollapsed it when search closes
     */
    if (isModalVisible) {
      const shouldCollapsePrimaryNav = !rootState.primaryNavCondensed
      commit('UPDATE_SHOULD_COLLAPSE_PRIMARY_NAV', shouldCollapsePrimaryNav)
    }

    if (state.shouldCollapsePrimaryNav) {
      commit('CONDENSE_PRIMARY_NAV', isModalVisible, { root: true })
    }

  },
  updateRequestModalVisible: ({ commit, rootState, state }, isModalVisible) => {
    commit('UPDATE_REQUEST_MODAL_VISIBLE', isModalVisible)

    /*
     * Determine if the primary navigation should be uncollapsed
     * when closing the search dialog. If the menu starts collapsed
     * when the user opens search, do not uncollapsed it when search closes
     */
    if (isModalVisible) {
      const shouldCollapsePrimaryNav = !rootState.primaryNavCondensed
      commit('UPDATE_SHOULD_COLLAPSE_PRIMARY_NAV', shouldCollapsePrimaryNav)
    }

    if (state.shouldCollapsePrimaryNav) {
      commit('CONDENSE_PRIMARY_NAV', isModalVisible, { root: true })
    }

  },
  setIsLoadingRepositoryDescription: ({commit}, evt) => commit('SET_IS_LOADING_REPOSITORY_DESCRIPTION', evt),
  setRepositoryDescription: ({commit}, evt) => commit('SET_REPOSITORY_DESCRIPTION', evt),
  setSelectedRepo: ({commit}, evt) => commit('SET_SELECTED_REPO', evt),
}

export const getters = {
  getRepositoryById: state => (id) => {
    return defaultTo({}, find(propEq('id', id), state.repositories))
  }
}

const repositoryModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default repositoryModule
