import Cookie from 'js-cookie'

const initialState = () => ({
  isOfficeDialogVisible: false,
  officeFile: {},
  shouldOpenOfficeFile: false
})

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
  }
}

export const actions = {
  openOffice365File: ({commit}, file) => {
    if (!Cookie.get('acceptedOffice365Terms')) {
      commit('OPEN_OFFICE_365_DIALOG', file)
    } else {
      commit('OPEN_OFFICE_365', file)
    }
  },
  closeOffice365Dialog: ({commit}) => commit('CLEAR_STATE')
}

export const getters = {}

const filesModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default filesModule
