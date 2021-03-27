const sortCollections = (collections) => {
  return collections.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true}))
}

const initialState = () => ({
  collections: [],
  datasetCollections: []
})

export const state = initialState()

export const mutations = {
  CLEAR_STATE(state) {
    //reset all state to initial state
    const _initialState = initialState()
    // need to iteratively set keys to preserve reactivity
    Object.keys(_initialState).forEach(key => state[key] = _initialState[key])
  },

  UPDATE_COLLECTIONS(state, collections) {
    state.collections = sortCollections(collections)
  },

  CREATE_COLLECTION(state, collection) {
    state.collections.push(collection)
  },

  ADD_COLLECTION(state, collection) {
    state.datasetCollections.push(collection)
  },

  REMOVE_COLLECTION(state, collectionId) {
    const collections = state.datasetCollections.filter(collection => collection.id !== collectionId)
    state.datasetCollections = collections
  },

  UPDATE_DATASET_COLLECTIONS(state, collections) {
    state.datasetCollections = sortCollections(collections)
  }
}

export const actions = {
  updateCollections: ({commit}, data) => commit('UPDATE_COLLECTIONS', data),

  fetchCollections: async({ commit, rootState }) => {
    try {
      const url = `${rootState.config.apiUrl}/collections?api_key=${rootState.userToken}`

      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (resp.ok) {
        const collections = await resp.json()
        commit('UPDATE_COLLECTIONS', collections)
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
        commit('UPDATE_COLLECTIONS', [])
        return Promise.reject(err)
    }
  },

  createCollection: async ({commit, rootState, dispatch}, { datasetId, collectionName }) => {
    try {
      const url = `${rootState.config.apiUrl}/collections?api_key=${rootState.userToken}`

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: collectionName})
      })

      if (resp.ok) {
        const collection = await resp.json()
        commit('CREATE_COLLECTION', collection)

        dispatch('addCollection', { datasetId, collectionId: collection.id })
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
      return Promise.reject(err)
    }
  },

  addCollection: async({ commit, rootState }, { datasetId, collectionId}) => {
    try {
      const url = `${rootState.config.apiUrl}/datasets/${datasetId}/collections?api_key=${rootState.userToken}`

      const resp = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({collectionId})
      })

      if (resp.ok) {
        const collections = await resp.json()
        commit('UPDATE_DATASET_COLLECTIONS', collections)
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
        return Promise.reject(err)
    }
  },

  removeCollection: async({ commit, dispatch, rootState }, { datasetId, collectionId }) => {
    try {
      const url = `${rootState.config.apiUrl}/datasets/${datasetId}/collections/${collectionId}?api_key=${rootState.userToken}`

      const resp = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (resp.ok) {
        commit('REMOVE_COLLECTION', collectionId)
        /**
         * Need to fetch collections again in the chance that
         * this collection was the deleted from the organization.
         * This happens when a collection is removed and it wasn't
         * assigned to another dataset.
         */
        dispatch('fetchCollections')
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
        return Promise.reject(err)
    }
  },

  fetchDatasetCollections: async({ commit, rootState }, datasetId) => {
    try {
      const url = `${rootState.config.apiUrl}/datasets/${datasetId}/collections?api_key=${rootState.userToken}`

      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (resp.ok) {
        const collections = await resp.json()
        commit('UPDATE_DATASET_COLLECTIONS', collections)
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
        return Promise.reject(err)
    }
  }
}

export const getters = {}

const collectionsModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default collectionsModule
