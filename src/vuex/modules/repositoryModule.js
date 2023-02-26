import {defaultTo, propEq, find, propOr} from 'ramda'
import Cookies from "js-cookie";

const sortRepositories = (repositories) => {
  return repositories.sort((a, b) => a.displayName.localeCompare(b.name, 'en', { numeric: true}))
}

const initialState = () => ({
  repositories: [],
  datasetProposals: [],
  repositoryModalVisible: false,
  requestModalVisible: false,
  shouldCollapsePrimaryNav: false,
  repositoryDescription: '**This is a sample repository**',
  isLoadingRepositoryDescription: false,
  selectedRepoForRequest: {},
  selectedDatasetProposal: {},
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
  },
  CLEAR_SELECTED_REPO(state) {
    state.selectedRepoForRequest = {}
  },
  UPDATE_PROPOSALS(state, datasetProposals) {
    state.datasetProposals = datasetProposals
  },
  ADD_PROPOSAL(state, proposal) {
    state.datasetProposals.push(proposal)
  },
  UPDATE_SELECTED_PROPOSAL(state, data) {
    state.selectedDatasetProposal = data
  },
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
        throw new Error(response.statusText)
      }
    }
    catch (err) {
      commit('UPDATE_REPOSITORIES', [])
    }
  },
  setSelectedProposal: ({commit}, data) => commit('UPDATE_SELECTED_PROPOSAL', data),
  updateProposals: ({commit}, data) => commit('UPDATE_PROPOSALS', data),
  fetchProposals: async({ commit, rootState }) => {
    console.log("repositoryModule::fetchProposals()")
    try {
      let url = `${rootState.config.api2Url}/publishing/proposal`
      const apiKey = rootState.userToken || Cookies.get('user_token')
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer ' + apiKey)
      myHeaders.append('Accept', 'application/json')
      const response = await fetch(url, { headers: myHeaders })
      if (response.ok) {
        const responseJson = await response.json()
        let count = 0
        let proposals = responseJson.map(p => {
          return {
            'id': ++count,
            'nodeId': p.ProposalNodeId,
            'userId': p.UserId,
            'name': p.Name,
            'description': p.Description,
            'repositoryId': p.RepositoryId,
            'organizationNodeId': p.OrganizationNodeId,
            'datasetNodeId': p.DatasetNodeId,
            'status': p.Status,
            'survey': p.Survey,
            'createdAt': p.CreatedAt,
            'updatedAt': p.UpdatedAt,
          } })
        commit('UPDATE_PROPOSALS', proposals)
      } else {
        commit('UPDATE_PROPOSALS', [])
        throw new Error(response.statusText)
      }
    }
    catch (err) {
      commit('UPDATE_PROPOSALS', [])
    }
  },
  storeNewProposal: async({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::storeNewProposal() proposal:")
    console.log(proposal)
    // call: POST /publishing/proposal
    let url = `${rootState.config.api2Url}/publishing/proposal`
    const apiKey = rootState.userToken || Cookies.get('user_token')
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    const response = await fetch(url, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        UserId: rootState.profile.intId,
        Name: propOr("", "name", proposal),
        Description: propOr("", "description", proposal),
        RepositoryId: propOr("", "repositoryId", proposal),
        OrganizationNodeId: propOr("", "organizationNodeId", proposal),
        Survey: propOr([], "survey", proposal)
      })
    })
    if (response.ok) {
      // get the response
      const responseJson = await response.json()
      console.log("repositoryModule::storeNewProposal() responseJson:")
      console.log(responseJson)
      // unpack the response
      let count = state.datasetProposals.length
      let proposal = {
        'id': ++count,
        'nodeId': responseJson.ProposalNodeId,
        'userId': responseJson.UserId,
        'name': responseJson.Name,
        'description': responseJson.Description,
        'repositoryId': responseJson.RepositoryId,
        'organizationNodeId': responseJson.OrganizationNodeId,
        'datasetNodeId': responseJson.DatasetNodeId,
        'status': responseJson.Status,
        'survey': responseJson.Survey,
        'createdAt': responseJson.CreatedAt,
        'updatedAt': responseJson.UpdatedAt,
      }
      // mutate state
      commit('ADD_PROPOSAL', proposal)
      return {
        status: "SUCCESS",
        result: proposal
      }
    } else {
      throw response.error()
    }
  },
  storeChangedProposal: ({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::storeChangedProposal() proposal:")
    console.log(proposal)
    // call: PUT /publishing/proposal
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
  clearSelectedRepo: ({commit}) => commit('SET_SELECTED_REPO',),
}

export const getters = {
  getRepositoryById: state => (id) => {
    return defaultTo({}, find(propEq('organizationId', id), state.repositories))
  },
  getProposalByNodeId: state => (nodeId) => {
    return defaultTo({}, find(propEq('nodeId', nodeId), state.datasetProposals))
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
