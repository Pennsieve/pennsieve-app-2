import { mutations, actions, state, getters } from './store'

describe('store.js', () => {
  let initialState
  let newProfile
  let activeOrg
  let newToken
  let actionParams
  let evt

  beforeEach(() => {
    initialState = {
      config: {
        apiUrl: 'https://app.blackfynn.net/'
      },
      profile: {},
      userToken: '',
      activeOrganization: {},
      orgMembers: []
    }
    newProfile = {
      id: '123',
      email: 'bob@test.com',
      firstName: 'Bob',
      lastName: 'Clarke',
      credential: 'Hockey Center',
      color: 'orange',
      url: 'broadstreetbully.com',
      authyId: 1,
      isSuperAdmin: false,
      preferredOrganization: 'blackfynn'
    },
    activeOrg = {
      administrators: [],
      isAdmin: false,
      isOwner: false,
      organization: {
        id: 'N:organization:c905919f-56f5-43ae-9c2a-8d5d542c133b',
        name: 'Blackfynn',
        slug: 'blackfynn',
        subscriptionState: {
          date: '2017-06-01T21:08:26.619Z'
        },
        features: [
          'concepts_feature'
        ]
      },
      owners: []
    }
    newToken = '123'
    evt = {
      detail: {
        dataset: 'Blackfynn',
        content: 'NIDA',
        open: true
      }
    }
    actionParams = {
      commit: (fnName, payload) => mutations[fnName](state, payload),
    }
  })

  it ('updateUserToken should mutate userToken object in state', () => {
    expect(initialState.userToken).toEqual('')
    mutations.UPDATE_USER_TOKEN(initialState, newToken)
    expect(initialState.userToken).toEqual('123')
  })

  it ('updateUserToken should not mutate userToken object in state if bad token passed', () => {
    expect(initialState.userToken).toEqual('')
    mutations.UPDATE_USER_TOKEN(initialState, null)
    expect(initialState.userToken).toEqual('')
  })

  it('updates active organization', () => {
    actions.updateActiveOrganization(actionParams, activeOrg)
    expect(state.activeOrganization).toMatchObject(activeOrg)
  })

  it('updates profile', () => {
    actions.updateProfile(actionParams, newProfile)
    expect(getters.getProfile(state)()).toMatchObject(newProfile)
  })

  it('updates user token', () => {
    actions.updateUserToken(actionParams, newToken)
    expect(state.userToken).toEqual(newToken)
  })

  it('updates current datsaet', () => {
    actions.updateCurDataset(actionParams, evt)
    expect(state.curDataset).toEqual('Blackfynn')
  })

  it('updates upload destination', () => {
    actions.updateUploadDestination(actionParams, evt.detail)
    expect(state.uploadDestination).toEqual('NIDA')
  })

  it('updates number of uploads remaining', () => {
    state.uploadRemaining = 10
    actions.updateUploadRemainingAdd(actionParams, 6)
    expect(getters.uploadRemaining(state)).toEqual(16)

    actions.updateUploadRemainingRemove(actionParams, 2)
    expect(getters.uploadRemaining(state)).toEqual(14)
  })

  it('updates upload status', () => {
    actions.updateUploadStatus(actionParams, true)
    expect(getters.uploading(state)).toEqual(true)
  })

  it('updates upload count', () => {
    state.uploadCount = 2
    actions.uploadCountAdd(actionParams, 4)
    expect(getters.uploadCount(state)).toEqual(6)

    actions.uploadCountRemove(actionParams, 1)
    expect(getters.uploadCount(state)).toEqual(5)
  })

  it('clears state', () => {
    const mockCommit = jest.fn();
    actions.clearState({ commit: mockCommit })

    expect(mockCommit.mock.calls[0][0]).toBe('CLEAR_STATE')
    expect(mockCommit.mock.calls[1][0]).toBe('viewer/CLEAR_STATE')
  })

  it('getters: return user token', () => {
    mutations.CLEAR_STATE(state)
    expect(getters.userToken(state)).toEqual(state.userToken)
    expect(getters.profile(state)).toEqual(state.profile)
    expect(getters.activeOrganization(state)).toEqual(state.activeOrganization)
    expect(getters.getProfile(state)()).toMatchObject({})
    expect(getters.getUserToken(state)()).toEqual('')
  })

  it('hasFeature', () => {
    actions.updateActiveOrganization(actionParams, activeOrg)
    const val = getters.hasFeature(state)('concepts_feature')
    expect(val).toBe(true)
  })

  it('getModelById', () => {
    const models = [
      {id: 1, name: 'Test'}
    ]
    actions.updateConcepts(actionParams, models)
    const model = getters.getModelById(state)(1)
    expect(model).toMatchObject(models[0])
  })

  it('getModelByName', () => {
    const models = [
      {id: 1, name: 'Test'}
    ]
    actions.updateConcepts(actionParams, models)
    const model = getters.getModelByName(state)('Test')
    expect(model).toMatchObject(models[0])
  })

  it('getModelCount', () => {
    const models = [
      {id: 1, name: 'Test', count: 11}
    ]
    actions.updateConcepts(actionParams, models)
    const modelCount = getters.getModelCount(state)('Test')
    expect(modelCount).toEqual(models[0].count)
  })

  it('getDataset', () => {
    const obj = {
      content: {
        id: 123,
        name: 'Blackfynn'
      }
    }
    actions.setDataset(actionParams, obj)
    const dataset = getters.getDataset(state)()
    expect(dataset).toMatchObject(obj)
  })

  it('isDatasetOwner', () => {
    const isOwner = getters.isDatasetOwner(state)
    expect(isOwner).toBe(false)
  })

  it('getLastRoute', () => {
    const datasetsRoute = 'datasets'
    actions.setLastRoute(actionParams, datasetsRoute)
    const lastRoute = getters.getLastRoute(state)()
    expect(lastRoute).toBe(datasetsRoute)
  })

  it('uploadDestination', () => {
    const target = {content: 'data'}
    actions.updateUploadDestination(actionParams, target)
    const destination = getters.uploadDestination(state)
    expect(destination).toBe(target.content)
  })

  it('hasGravatar', () => {
    expect(getters.hasGravatar(state)).toBe(true)
  })

  it('getPrimaryNavOpen', () => {
    actions.togglePrimaryNav(actionParams, true)
    const bool = getters.getPrimaryNavOpen(state)()
    expect(bool).toBe(true)
  })

  it('getOrgMembers', () => {
    const list = [
      {id: 1, firstName: 'Andy', lastName: 'Sipowicz'},
      {id: 2, firstName: 'Greg', lastName: 'Medavoy'},
      {id: 3, firstName: 'Bobby', lastName: 'Simone'},
      {id: 4, firstName: 'James', lastName: 'Martinez'}
    ]
    actions.updateOrgMembers(actionParams, list)
    const orgMembers = getters.getOrgMembers(state)()
    expect(orgMembers.length).toBe(4)
  })

  it('updateConcepts', () => {
    const concepts = [
      {id: 1, name: 'Disease', description: '', count: 232},
      {id: 2, name: 'Visits', description: '', count: 57}
    ]
    actions.updateConcepts(actionParams, concepts)
    expect(getters.concepts(state)).toMatchObject(concepts)
  })

  it('updateHasGravatar', () => {
    actions.updateHasGravatar(actionParams, true)
    expect(getters.hasGravatar(state)).toBe(true)
  })

  it('updateExploreFiles', () => {
    const files = [{id: 1, name: 'File_1'}, {id: 2, name: 'File_2'}]
    actions.updateExploreFiles(actionParams, files)
    expect(getters.exploreFiles(state)).toMatchObject(files)
  })

  it('condensePrimaryNav', () => {
    expect(state.primaryNavCondensed).toEqual(false)
    actions.condensePrimaryNav(actionParams, true)
    expect(state.primaryNavCondensed).toEqual(true)
  })

  it('condenseSecondaryNav', () => {
    expect(state.secondaryNavCondensed).toEqual(false)
    actions.condenseSecondaryNav(actionParams, true)
    expect(state.secondaryNavCondensed).toEqual(true)
  })
})
