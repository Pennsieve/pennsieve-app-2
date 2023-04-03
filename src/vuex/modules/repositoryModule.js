import {defaultTo, propEq, find, propOr} from 'ramda'
import Cookies from "js-cookie";

const sortRepositories = (repositories) => {
  return repositories.sort((a, b) => a.displayName.localeCompare(b.name, 'en', { numeric: true}))
}

const getOwnerName = (profile) => {
  console.log("getOwnerName() profile:")
  console.log(profile)
  let firstName = profile.firstName
  let lastName = profile.lastName
  let ownerName = `${firstName} ${lastName}`
  console.log(`getOwnerName() ownerName: ${ownerName}`)
  return ownerName
}

const transformProposalIn = (proposal, count = 0) => {
  return {
    'id': count,
    ...proposal
  }
}

const transformProposalOut = (proposal, profile) => {
  return {
    userId: profile.intId,
    ownerName: getOwnerName(profile),
    ...proposal
  }
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
  UPDATE_PROPOSAL(state, proposal) {
    let index = state.datasetProposals.findIndex(p => p.nodeId === proposal.nodeId)
    if (index > -1) {
      let existing = state.datasetProposals[index]
      let updated = proposal
      updated.id = existing.id
      state.datasetProposals[index] = updated
    } // else {
      // let new = proposal
      // new.id = state.datasetProposals.length
      // state.datasetProposals.push(new)
    // }
  },
  REMOVE_PROPOSAL(state, proposal) {
    let result = state.datasetProposals.filter(p => p.nodeId !== proposal.nodeId)
    state.datasetProposals = result
  },
  UPDATE_SELECTED_PROPOSAL(state, data) {
    state.selectedDatasetProposal = data
  },
}

export const actions = {
  updateRepositories: ({commit}, data) => commit('UPDATE_REPOSITORIES', data),
  fetchRepositories: async({ commit, rootState }) => {
    console.log("repositoryModule::fetchRepositories()")
    try {
      let url = `${rootState.config.api2Url}/publishing/repositories`
      const apiKey = rootState.userToken || Cookies.get('user_token')
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer ' + apiKey)
      myHeaders.append('Accept', 'application/json')
      const response = await fetch(url, { headers: myHeaders })
      if (response.ok) {
        const responseJson = await response.json()
        console.log("repositoryModule::fetchRepositories() responseJson:")
        console.log(responseJson)
        let count = 0
        let repositories = responseJson.map(r => {
          return {
            'id': ++count,
            'isPublic': r.type === "PUBLIC",
            ...r
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
        console.log("repositoryModule::fetchProposals() responseJson:")
        console.log(responseJson)
        let count = 0
        let proposals = responseJson.map(p => {
          return transformProposalIn(p, ++count)
        })
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
      body: JSON.stringify(transformProposalOut(proposal, rootState.profile))
    })
    if (response.ok) {
      // get the response
      const responseJson = await response.json()
      console.log("repositoryModule::storeNewProposal() responseJson:")
      console.log(responseJson)
      // unpack the response
      let count = state.datasetProposals.length
      let proposal = transformProposalIn(responseJson, ++count)
      // mutate state
      commit('ADD_PROPOSAL', proposal)
      return {
        status: "SUCCESS",
        result: proposal
      }
    } else {
      throw new Error(response.statusText)
    }
  },
  storeChangedProposal: async({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::storeChangedProposal() proposal:")
    console.log(proposal)
    // call: PUT /publishing/proposal
    let url = `${rootState.config.api2Url}/publishing/proposal`
    const apiKey = rootState.userToken || Cookies.get('user_token')
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    const response = await fetch(url, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(transformProposalOut(proposal, rootState.profile))
    })
    if (response.ok) {
      // get the response
      const responseJson = await response.json()
      console.log("repositoryModule::storeChangedProposal() responseJson:")
      console.log(responseJson)
      // unpack the response
      let proposal = transformProposalIn(responseJson)
      // mutate state
      commit('UPDATE_PROPOSAL', proposal)
      return {
        status: "SUCCESS",
        result: proposal
      }
    } else {
      throw new Error(response.statusText)
    }
  },
  removeProposal: async({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::removeProposal() proposal:")
    console.log(proposal)
    let url = `${rootState.config.api2Url}/publishing/proposal?proposal_node_id=${proposal.nodeId}`
    const apiKey = rootState.userToken || Cookies.get('user_token')
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    const response = await fetch(url, {
        method: "DELETE",
        headers: myHeaders})
    if (response.ok) {
      commit('REMOVE_PROPOSAL', proposal)
      return {
        status: "SUCCESS",
      }
    } else {
      throw new Error(response.statusText)
    }
  },
  submitProposal: async({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::submitProposal() proposal:")
    console.log(proposal)
    let url = `${rootState.config.api2Url}/publishing/proposal/submit?node_id=${proposal.nodeId}`
    const apiKey = rootState.userToken || Cookies.get('user_token')
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    const response = await fetch(url, {
      method: "POST",
      headers: myHeaders})
    if (response.ok) {
      // get the response
      const responseJson = await response.json()
      console.log("repositoryModule::submitProposal() responseJson:")
      console.log(responseJson)
      // unpack the response
      let submitted = transformProposalIn(responseJson)
      // mutate state
      commit('UPDATE_PROPOSAL', submitted)
      return {
        status: "SUCCESS",
        result: proposal
      }
    } else {
      throw new Error(response.statusText)
    }
  },
  withdrawProposal: async({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::withdrawProposal() proposal:")
    console.log(proposal)
    let url = `${rootState.config.api2Url}/publishing/proposal/withdraw?node_id=${proposal.nodeId}`
    const apiKey = rootState.userToken || Cookies.get('user_token')
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    const response = await fetch(url, {
      method: "POST",
      headers: myHeaders})
    if (response.ok) {
      // get the response
      const responseJson = await response.json()
      console.log("repositoryModule::withdrawProposal() responseJson:")
      console.log(responseJson)
      // unpack the response
      let withdrawn = transformProposalIn(responseJson)
      // mutate state
      commit('UPDATE_PROPOSAL', withdrawn)
      return {
        status: "SUCCESS",
        result: proposal
      }
    } else {
      throw new Error(response.statusText)
    }
  },
  acceptProposal: async({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::acceptProposal() proposal:")
    console.log(proposal)
    let url = `${rootState.config.api2Url}/publishing/submission/accept?node_id=${proposal.nodeId}`
    const apiKey = rootState.userToken || Cookies.get('user_token')
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    const response = await fetch(url, {
      method: "POST",
      headers: myHeaders})
    if (response.ok) {
      // get the response
      const responseJson = await response.json()
      console.log("repositoryModule::acceptProposal() responseJson:")
      console.log(responseJson)
      // unpack the response
      let accepted = transformProposalIn(responseJson)
      // mutate state
      commit('UPDATE_PROPOSAL', accepted)
      return {
        status: "SUCCESS",
        result: proposal
      }
    } else {
      throw new Error(response.statusText)
    }
  },
  rejectProposal: async({commit, rootState, state}, proposal) => {
    console.log("repositoryModule::rejectProposal() proposal:")
    console.log(proposal)
    let url = `${rootState.config.api2Url}/publishing/submission/reject?node_id=${proposal.nodeId}`
    const apiKey = rootState.userToken || Cookies.get('user_token')
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    const response = await fetch(url, {
      method: "POST",
      headers: myHeaders})
    if (response.ok) {
      // get the response
      const responseJson = await response.json()
      console.log("repositoryModule::rejectProposal() responseJson:")
      console.log(responseJson)
      // unpack the response
      let rejected = transformProposalIn(responseJson)
      // mutate state
      commit('UPDATE_PROPOSAL', rejected)
      return {
        status: "SUCCESS",
        result: proposal
      }
    } else {
      throw new Error(response.statusText)
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
  clearSelectedRepo: ({commit}) => commit('SET_SELECTED_REPO',),
}

export const getters = {
  getRepositoryById: state => (id) => {
    return defaultTo({}, find(propEq('repositoryId', id), state.repositories))
  },
  getProposalByNodeId: state => (nodeId) => {
    return defaultTo({}, find(propEq('nodeId', nodeId), state.datasetProposals))
  },
}

const repositoryModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default repositoryModule
