import Cookie from 'js-cookie'
import toQueryParams from '@/utils/toQueryParams.js'

const initialState = () => ({
  isOfficeDialogVisible: false,
  officeFile: {},
  shouldOpenOfficeFile: false,
  packageMetadata:[],
})


const getPackageMetadataQueryParams = (params, dataset_id, package_id) => {

  return toQueryParams({
    dataset_id: dataset_id,
    package_id: package_id
  })
}
export const state = initialState()

export const mutations = {
  CLEAR_STATE(state) {
    //reset all state to initial state
    const _initialState = initialState()
    // need to iteratively set keys to preserve reactivity
    Object.keys(_initialState).forEach(key => state[key] = _initialState[key])
  },

  OPEN_OFFICE_365_DIALOG(state, file) {
    state.officeFile = { ...file }
    state.isOfficeDialogVisible = true
  },

  OPEN_OFFICE_365(state, file) {
    state.officeFile = { ...file }
    state.shouldOpenOfficeFile = true
  },

  UPDATE_PACKAGE_META(state, metadata) {
    console.log("Updating to " + metadata)
    state.packageMetadata = metadata
  },
}

export const actions = {
  openOffice365File: ({commit}, file) => {
    if (!Cookie.get('acceptedOffice365Terms')) {
      commit('OPEN_OFFICE_365_DIALOG', file)
    } else {
      commit('OPEN_OFFICE_365', file)
    }
  },
  closeOffice365Dialog: ({commit}) => commit('CLEAR_STATE'),

  fetchMetadataForPackage: async ({state,commit, rootState}, packageId) => {
    const datasetId = rootState.route.params.datasetId
    const endpoint = `${rootState.config.api2Url}/metadata/package`

    const apiKey = rootState.userToken || Cookies.get('user_token')
    const queryParams = getPackageMetadataQueryParams(state.datasetManifestParams, datasetId, packageId)

    const url = `${endpoint}?${queryParams}`
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + apiKey)
    myHeaders.append('Accept', 'application/json')
    try {
      const resp = await fetch(url, { headers: myHeaders })
      if (resp.ok) {
        const  metadata = await resp.json()
        console.log(metadata)
        commit('UPDATE_PACKAGE_META', metadata)

      } else {
        commit('UPDATE_PACKAGE_META', [])
        throw new Error(resp.statusText)
      }
    } catch (err) {
      EventBus.$emit('ajaxError', err)
      commit('UPDATE_PACKAGE_META', [])
    }

  }
}

export const getters = {
  curPackageMetaData: state => {
    return state.packageMetadata
  }
}

const filesModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default filesModule
