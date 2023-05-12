import uuidv1 from 'uuid/v1'

const initialState = () => ({
  // showModels: ['patient', 'visit', 'sample', 'study'],
  orderBy:{
    patient: "",
    visits: "",
    samples: "storage_status",
    study: ""
  },
  models: [],
  filterParams: [ filter() ],
  records: {},
  selectedModel: 'patient',
  selectedRecord: null
})

/**
 * Stub for the original filter
 */
const filter = () => {
  return {
    id: uuidv1(),
    type: '',
    target: '',
    targetLabel: '',
    property: '',
    propertyLabel: '',
    propertyType: '',
    operation: '',
    operationLabel: '',
    operators: [],
    value: '',
    isInvalid: false
  }
}

export const state = initialState()

export const mutations = {
  SET_MODELS(state, models) {
    state.models = models
  },
  SET_RECORDS_FOR_MODEL(state, response) {
    if (response.result == null) {
      response.result = []
    }
    state.records[response.result.model] = response.result
  },
  SET_SELECTED_RECORDS_FOR_MODEL(state, records) {
    if (records.values == null) {
      records.values = []
    }
    // turn into dict by id
    let recordDict = {}
    for (let r in records.values) {
      recordDict[records.values[r].id] = records.values[r]
    }

    state.selectedRecords[records.model] = recordDict
  },
  CLEAR_FILTERS(state){
    state.filterParams = []
  },
  SET_PROPS_FOR_MODEL(state, response) {
    const objIndex = state.models.findIndex((obj => obj.name == response.model));
    state.models[objIndex].props = response.props
  },
  REMOVE_FILTER(state, id) {
    const objIndex = state.filterParams.findIndex((obj => obj.id == id));
    state.filterParams.splice(objIndex, 1)

  },
  CREATE_FILTER_PARAMS(state, filter) {
    state.filterParams.push(filter)
  },
  UPDATE_FILTER(state, filter) {
    const objIndex = state.filterParams.findIndex((obj => obj.id == filter.id));

    state.filterParams[objIndex].target = filter.model
    state.filterParams[objIndex].property = filter.property
    state.filterParams[objIndex].operator = filter.operator
    state.filterParams[objIndex].value = filter.value

  },
  SET_SELECTED_MODEL(state, model) {
    state.selectedModel = model
  },
  SET_SELECTED_RECORD(state, record) {
    state.selectedRecord = record
  }
}

export const actions = {
  fetchModelProps: async({commit, rootState}, model) => {
    try {
      const url = `${rootState.config.apiUrl}/models/datasets/${rootState.dataset.content.id}/concepts/${model}/properties`

      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rootState.userToken}`
        }
      })

      if (resp.ok) {
        const props = await resp.json()
        commit('SET_PROPS_FOR_MODEL', {'model': model, 'props': props})
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
      return Promise.reject(err)
    }

  },
  fetchModels: async({commit, rootState, dispatch}) => {
    try {
      const url = `${rootState.config.apiUrl}/models/datasets/${rootState.dataset.content.id}/concepts`

      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rootState.userToken}`
        }
      })

      if (resp.ok) {
        const models = await resp.json()
        commit('SET_MODELS', models)

        // TODO: Refactor so this is returned with models or elsewhere
        for (let target in models) {
          dispatch('fetchModelProps', models[target].name)

        }
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
      commit('SET_MODELS', [])
      return Promise.reject(err)
    }
  },
  fetchRecords: async({commit, rootState, state}, params) => {
    try {

      if (!rootState.dataset.content) {
        return
      }

      let datasetId = rootState.dataset.content.id


      const url = `${rootState.config.api2Url}/metadata/query?dataset_id=${datasetId}`

      let filters = state.filterParams.filter(value => {
        return value.value != ''
      }).map(value => {
        return {
          "model": value.target,
          "property": value.property,
          "operator": value.operation,
          "value": value.value
        }
      })

      let queryBody = {
        model: params.modelName,
        order_by: state.orderBy[params.modelName],
        filters: filters,
        limit: params.limit,
        offset: params.offset,
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rootState.userToken}`
        },
        body: JSON.stringify(queryBody)
      })

      if (resp.ok) {
        const result = await resp.json()
        commit('SET_RECORDS_FOR_MODEL', {result:result})
      } else {
        return Promise.reject(resp)
      }
    } catch (err) {
      commit('SET_RECORDS_FOR_MODEL', {model:params.modelName, values:[]})
      return Promise.reject(err)
    }
  },
  clearRecords: ({commit}, modelName) => {
    commit('SET_RECORDS_FOR_MODEL', {model:modelName, values:[]})
  },
  clearFilters: ({commit}) => {
    commit('CLEAR_FILTERS')
  },
  createOrUpdateFilterParams: ({commit, state}, filterParams) => {
    const objIndex = state.filterParams.findIndex((obj => obj.id == filter.id));
    if (objIndex >= 0) {
      commit('UPDATE_FILTER_PARAMS', filter)
    } else {
      commit('CREATE_FILTER_PARAMS', filter)
    }
  },
  removeFilter: ({commit, state}, id) => {
    const objIndex = state.filterParams.findIndex((obj => obj.id == id));
    if (objIndex >= 0) {
      commit('REMOVE_FILTER', id)
    }
    if (state.filter.length === 0) {
      commit('CREATE_FILTER_PARAMS', filter())
    }
  },
  setSelectedModel: ({commit}, modelName) => {
    const objIndex = state.models.findIndex((obj => obj.name == modelName));
    commit('SET_SELECTED_MODEL', state.models[objIndex])
  },
  setSelectedRecord: ({commit}, record) => {
    commit('SET_SELECTED_RECORD', record)
  },
}

export const getters = {
  getRecordsByModel: (state) => (name) => {
    return state.records[name]
  },
  getSelectedRecordsByModel: (state) => (name) => {
    return state.selectedRecords[name]
  },
  detailsForModel: (state) => (name) => {
    for (let m in state.models) {
      if (state.models[m].name === name) {
        return state.models[m]
      }
    }
    return null
  },
  getRecords (state) {
    return state.records
  },
  recordsForSelectedModel: (state) => {
    return state.records[state.selectedModel]
  },
  getSelectedRecord: (state) => {
    return state.selectedRecord
  },
  selectedModelDetails: (state) => {
    for (let m in state.models) {
      if (state.models[m].name === state.selectedModel) {
        return state.models[m]
      }
    }
    return null
  }
}

const metadataModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default metadataModule
