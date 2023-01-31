const sortRepositories = (repositories) => {
  return repositories.sort((a, b) => a.displayName.localeCompare(b.name, 'en', { numeric: true}))
}

const initialState = () => ({
  repositories: [
    {
      id: 1,
      name: "SPARC",
      displayName: "SPARC",
      description: "The SPARC repository is developed as part of the NIH SPARC initiative and has been used by SPARC funded investigator groups to curate and publish high quality datasets related to the autonomic nervous system. SPARC is currently accepting datasets from non-SPARC funded inverstigators",
      isPublic: true,
      logo: "logo-sparc-wave-primary.svg"
    },
    {
      id: 2,
      name: "Pennsieve_Discover",
      displayName: "Pennsieve Discover",
      description: "Pennsieve Discover publishes Pennsieve Datasets",
      isPublic: false,
      logo: "pennsieve-logo-full.svg"
    }
  ],
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
}

export const actions = {
  updateRepositories: ({commit}, data) => commit('UPDATE_REPOSITORIES', data),

  fetchRepositories: async({ commit, rootState }) => {

    repos = [
      {
        name: "SPARC",
        displayName: "SPARC",
        description: "The SPARC repository is something else."
      },
      {
        name: "SPARC",
        displayName: "SPARC",
        description: "The SPARC repository is something else."
      }
    ]


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

}

export const getters = {}

const repositoryModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default repositoryModule
