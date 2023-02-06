import { defaultTo, propEq,find } from 'ramda'

const sortRepositories = (repositories) => {
  return repositories.sort((a, b) => a.displayName.localeCompare(b.name, 'en', { numeric: true}))
}

const initialState = () => ({
  repositories: [
    {
      id: 1,
      name: "SPARC",
      displayName: "SPARC",
      description: "The SPARC repository is developed as part of the NIH SPARC initiative and accepts high quality datasets related to the autonomic nervous system.",
      isPublic: true,
      logo: "logo-sparc-wave-primary.svg",
      site: "https://sparc.science",
      readme: "#The SPARC Data Repository\n Information about sparc.",
      survey: [
        {
          id: 1,
          question: "How much data do you expect?",
          type: "string"
        },
        {
          id: 2,
          question: "What file-types do you expext?",
          type: "string"
        },
        {
          id: 3,
          question: "How much data do you expect?",
          type: "string"
        }],
    },
    {
      id: 2,
      name: "Pennsieve_Discover",
      displayName: "Pennsieve Discover",
      description: "Find and access public scientific datasets. Explore scientific data from the world's leading institutions and researchers with Pennsieve Discover.",
      isPublic: true,
      logo: "pennsieve-logo-full.svg",
      site: "https://discover.pennsieve.io",
      readme: "The Pennsieve Discover repository",
      survey: [
        {
          id: 1,
          question: "How much data do you expect?",
          type: "string"
        },
        {
          id: 2,
          question: "What file-types do you expext?",
          type: "string"
        },
        {
          id: 3,
          question: "How much data do you expect?",
          type: "string"
        }],
    },
    {
      id: 3,
      name: "CNT",
      displayName: "Center for Neuroengineering and Therapeutics",
      description: "Penn’s Center for Neuroengineering & Therapeutics is working to develop and test new devices that can restore brain and nervous system function after it has been lost to disease or disability.",
      isPublic: false,
      logo: "cropped-CNT-logo.png",
      site: "https://cnt.upenn.edu/",
      readme: "PENN CNT Information",
      survey: []
    }
  ],
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
    state.repositories = sortIntegrations(repositories)
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



    // try {
      // const url = `${rootState.config.apiUrl}/webhooks?api_key=${rootState.userToken}`

      // const resp = await fetch(url, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // })

    //   if (resp.ok) {
    //     const collections = await resp.json()
    //     commit('UPDATE_INTEGRATIONS', collections)
    //   } else {
    //     return Promise.reject(resp)
    //   }
    // } catch (err) {
    //   commit('UPDATE_INTEGRATIONS', [])
    //   return Promise.reject(err)
    // }
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
