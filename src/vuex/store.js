import Vue from 'vue'
import Vuex from 'vuex'
import * as site from '@/site-config/site.json'
import { pathOr, merge, propOr, prop, contains, find, propEq, compose, findIndex, clone, defaultTo, pathEq, pluck, length, sum, take, sort, filter, append, assocPath, remove } from 'ramda'
import Cookies from 'js-cookie'
import viewer from './modules/viewer'
import datasetModule from './modules/datasetModule'
import publishingModule from './modules/publishingModule'
import collectionsModule from './modules/collectionsModule'
import integrationsModule from './modules/integrationsModule'
import filesModule from './modules/filesModule'
import repositoryModule from './modules/repositoryModule'

Vue.use(Vuex)

// helpers
const getDataset = pathOr({}, ['detail', 'dataset'])
const getUploadDestination = propOr({}, 'content')
const getIndexByProp = (prop, match, list) => findIndex(propEq(prop, match), list)
const getDatasetIndex = (dataset, list) => {
  const datasetId = pathOr('', ['content', 'id'], dataset)
  return findIndex(pathEq(['content', 'id'], datasetId), list)
}

const hashFunction = (key, list) => {
  const obj = {}
  list.forEach(item => {
    if (item[key]) {
      obj[item[key]] = item
    }
  })
  return obj
}

// state
// TODO: remove concept of "viewers", only one viewer is open at at time
export const state = {
  config: site,
  uploadRemaining: 0,
  uploading: false,
  uploadCount: 0,
  hasGravatar: false,
  organizations: {},
  activeOrganization: {},
  activeOrgSynced: false,
  isLoadingDatasets: true,
  isLoadingDatasetsError: false,
  isLoadingDatasetBanner: true,
  isLoadingDatasetDoi: true,
  isLoadingDatasetDescription: true,
  isLoadingChangelog: true,
  isLoadingDatasetContributors: true,
  isLoadingDatasetIgnoreFiles: true,
  datasets: [],
  dataset: {},
  datasetEtag: '',
  datasetBanner: '',
  datasetDoi: {},
  datasetDescription: '',
  changelogText: '',
  datasetDescriptionEtag: '',
  datasetIgnoreFiles: [],
  datasetFilters: {
    filterName: '',
    filterOwner: 'all-datasets',
    filterType: 'datasets',
    sortBy: 'content.name',
    sortDirection: 'asc'
  },
  datasetContributors: [],
  isDatasetOwner: false,
  datasetPublishedData: [],
  isLoadingDatasetPublishedData: false,
  orgMembers: [],
  orgContributors: [],
  teams: [],
  teamsLoading: true,
  publishers: [],
  publishersLoading: true,
  datasetRole: 'viewer',
  primaryNavOpen: true,
  primaryNavCondensed: false,
  secondaryNavOpen: false,
  secondaryNavCondensed: false,
  editingInstance: false,
  concepts: [],
  conceptsHash: {},
  relationshipTypes: [],
  relationshipTypesHash: {},
  isLoadingConcepts: true,
  isLoadingRelationshipTypes: true,
  filesProxyId: '',
  sites: [],
  consortiumId: 1,
  consortiumDatasets: [],
  consortiumDatasetsImporting: [],
  gettingStartedOpen: false,
  modelTemplates: [],
  datasetTemplates: [],
  isLoadingDatasetTemplates: false,
  totalUploadSize: 0,
  bfTermsOfServiceVersion: '',
  environment: site.environment,
  viewerMontageScheme: 'NOT_MONTAGED',
  bulkEditingChannels: false,
  blindReviewerSubmissions: {},
  thirdReviewerSubmissions: {},
  orgDatasetStatuses: [],
  searchModalVisible: false,
  searchModalSearch: {},
  shouldCollapsePrimaryNav: false,
  scientificUnits: [],
  profile: {},
  pageNotFound: false,
  dataUseAgreements: [],
  cognitoUser: {},
  onboardingEvents: [],
  shouldShowLinkOrcidDialog: false,
  isLinkOrcidDialogVisible: false
}

const initialFilterState = state.datasetFilters

// mutations
export const mutations = {
  SET_ACTIVE_ORG_SYNC (state) {
    Vue.set(state, 'activeOrgSynced', true)
  },

  UPDATE_COGNITO_USER (state, data) {
    Vue.set(state, 'cognitoUser', data)
  },

  SET_PAGE_NOT_FOUND (state, data) {
    Vue.set(state, 'pageNotFound', data)
  },

  UPDATE_SCIENTIFIC_UNITS (state, data) {
    Vue.set(state, 'scientificUnits', data)
  },

  UPDATE_SEARCH_MODAL_SEARCH (state, data) {
    Vue.set(state, 'searchModalSearch', data)
  },

  UPDATE_SEARCH_MODAL_VISIBLE (state, data) {
    Vue.set(state, 'searchModalVisible', data)
  },

  UPDATE_SHOULD_COLLAPSE_PRIMARY_NAV (state, data) {
    Vue.set(state, 'shouldCollapsePrimaryNav', data)
  },

  UPDATE_THIRD_REVIEWER_SUBMISSIONS (state, data){
    Vue.set(state, 'thirdReviewerSubmissions', data)
  },
  UPDATE_ORG_MEMBERS (state, members) {
    Vue.set(state, 'orgMembers', members)
  },
  UPDATE_ACTIVE_ORGANIZATION (state, activeOrganization) {
    Vue.set(state, 'orgMembers', [])
    Vue.set(state, 'teams', [])
    Vue.set(state, 'activeOrganization', activeOrganization)
  },
  UPDATE_ORGANIZATIONS (state, organizations) {
    Vue.set(state, 'organizations', organizations)
  },
  UPDATE_PROFILE (state, profile) {
    const preferredOrgId = profile.preferredOrganization
    const activeOrgId = pathOr('', ['activeOrganization', 'organization', 'id'], state)
    const orgId = preferredOrgId ? preferredOrgId : activeOrgId

    Cookies.set('preferred_org_id', orgId)
    Vue.set(state, 'profile', profile)
  },
  UPDATE_USER_TOKEN (state, userToken) {
    if (Object.prototype.toString.call(userToken) === '[object String]') {
      Vue.set(state, 'userToken', userToken)
    }
  },
  CLEAR_STATE (state) {
    Vue.set(state, 'profile', {})
    Vue.set(state, 'userToken', '')
    Vue.set(state, 'activeOrganization', {})
    Vue.set(state, 'organizations', {})
    Vue.set(state, 'orgMembers', [])
    Vue.set(state, 'concepts', [])
    Vue.set(state, 'teams', [])
    Vue.set(state, 'hasGravatar', true)
    Vue.set(state, 'dataset', {})
    Vue.set(state, 'datasets', [])
    Vue.set(state, 'datasetPublishedData', [])
    Vue.set(state, 'datasetDescription', '')
    Vue.set(state, 'changelogText', '')
    Vue.set(state, 'datasetDoi', '')
    Vue.set(state, 'searchModalVisible', false)
    Vue.set(state, 'shouldShowLinkOrcidDialog', false)
    Vue.set(state, 'isLinkOrcidDialogVisible', false)
    Vue.set(state, 'gettingStartedOpen', false)

  },
  UPDATE_CUR_DATASET (state, dataset) {
    Vue.set(state, 'curDataset', dataset)
  },
  UPDATE_UPLOAD_DESTINATION (state, uploadDestination) {
    Vue.set(state, 'uploadDestination', uploadDestination)
  },
  UPDATE_UPLOAD_STATUS (state, uploading) {
    Vue.set(state, 'uploading', uploading)
  },
  UPDATE_UPLOAD_REMAINING_ADD (state, size) {
    const totalRemaining = propOr(0, 'uploadRemaining', state) + size;
    Vue.set(state, 'uploadRemaining', totalRemaining)
  },
  UPDATE_UPLOAD_REMAINING_REMOVE (state, size) {
    const totalRemaining = propOr(0, 'uploadRemaining', state) - size;
    Vue.set(state, 'uploadRemaining', totalRemaining)
  },
  UPLOAD_COUNT_ADD (state, count) {
    const totalCount = propOr(0, 'uploadCount', state) + count;
    Vue.set(state, 'uploadCount', totalCount)
  },
  UPLOAD_COUNT_REMOVE (state, count) {
    const totalCount = propOr(0, 'uploadCount', state) - count;
    Vue.set(state, 'uploadCount', totalCount)
  },
  UPDATE_TOTAL_UPLOAD_SIZE (state, data) {
    const updatedSize = propOr(0, 'totalUploadSize', state) + data
    Vue.set(state, 'totalUploadSize', updatedSize)
  },
  UPDATE_UPLOAD_COUNT (state, data) {
    Vue.set(state, 'uploadCount', data)
  },
  TOGGLE_PRIMARY_NAV (state, open) {
    Vue.set(state, 'primaryNavOpen', open)
  },
  TOGGLE_SECONDARY_NAV (state, open) {
    Vue.set(state, 'secondaryNavOpen', open)
  },
  CONDENSE_PRIMARY_NAV (state, condensed) {
    Vue.set(state, 'primaryNavCondensed', condensed)
  },
  CONDENSE_SECONDARY_NAV (state, condensed) {
    Vue.set(state, 'secondaryNavCondensed', condensed)
  },
  UPDATE_HAS_GRAVATAR (state, hasGravatar) {
    Vue.set(state, 'hasGravatar', hasGravatar)
  },
  SET_DATASET (state, dataset) {
    Vue.set(state, 'dataset', dataset)

    const profileId = pathOr('', ['profile', 'id'], state)
    const datasetId = prop('owner', dataset)
    const isDatasetOwner = profileId === datasetId
    Vue.set(state, 'isDatasetOwner', isDatasetOwner)
  },
  SET_DATASET_ETAG (state, etag) {
    Vue.set(state, 'datasetEtag', etag)
  },
  SET_DATASET_BANNER (state, banner) {
    Vue.set(state, 'datasetBanner', banner)
  },
  UPDATE_TEAMS (state, teams) {
    Vue.set(state, 'teams', teams)
    Vue.set(state, 'teamsLoading', false)
  },
  UPDATE_PUBLISHERS (state, publishers) {
    Vue.set(state, 'publishers', publishers)
    Vue.set(state, 'publishersLoading', false)
  },
  SET_LAST_ROUTE (state, route) {
    Vue.set(state, 'lastRoute', route)
  },
  UPDATE_CONCEPTS (state, concepts) {
    Vue.set(state, 'concepts', concepts)
    Vue.set(state, 'conceptsHash', hashFunction('id', [...concepts]))
  },
  UPDATE_IS_LOADING_CONCEPTS (state, loading) {
    Vue.set(state, 'isLoadingConcepts', loading)
  },
  UPDATE_EDITING_INSTANCE (state, isEditing) {
    Vue.set(state, 'editingInstance', isEditing)
  },
  UPDATE_EXPLORE_FILES (state, exploreFiles) {
    Vue.set(state, 'exploreFiles', exploreFiles)
  },
  UPDATE_FILES_PROXY_ID (state, id) {
    Vue.set(state, 'filesProxyId', id)
  },
  UPDATE_SITES (state, sites) {
    Vue.set(state, 'sites', sites)
  },
  UPDATE_SITE (state, { site, id }) {
    let sites = clone(state.sites)

    const index = getIndexByProp('id', id, sites)
    sites[index] = site

    Vue.set(state, 'sites', sites)
  },
  REMOVE_SITE (state, id) {
    let sites = clone(state.sites)

    const index = getIndexByProp('id', id, sites)
    sites.splice(index, 1)

    Vue.set(state, 'sites', sites)
  },
  ADD_SITE (state, site) {
    let sites = clone(state.sites)
    sites.unshift(site)

    Vue.set(state, 'sites', sites)
  },
  ADD_CONSORTIUM_DATASET (state, dataset) {
    const consortiumDatasets = state.consortiumDatasets
    Vue.set(consortiumDatasets, consortiumDatasets.length, dataset)
  },
  UPDATE_CONSORTIUM_DATASETS (state, datasets) {
    state.consortiumDatasets = datasets
  },
  REMOVE_CONSORTIUM_DATASET (state, dataset) {
    const discoverId = prop('consortiumDatasetId', dataset)
    if (discoverId) {
      const idx = findIndex(propEq('id', discoverId), state.consortiumDatasets)
      Vue.delete(state.consortiumDatasets, idx)
    }
  },
  ADD_CONSORTIUM_DATASET_IMPORTING (state, dataset) {
    const consortiumDatasetsImporting = state.consortiumDatasetsImporting
    Vue.set(consortiumDatasetsImporting, consortiumDatasetsImporting.length, dataset)
  },
  REMOVE_CONSORTIUM_DATASET_IMPORTING (state, dataset) {
    const idx = findIndex(propEq('id', dataset.id), state.consortiumDatasetsImporting)
    Vue.delete(state.consortiumDatasetsImporting, idx)
  },

  SET_DATASETS (state, data) {
    Vue.set(state, 'datasets', data)
  },

  UPDATE_DATASET (state, dataset) {
    const index = getDatasetIndex(dataset, state.datasets)

    Vue.set(state, 'dataset', dataset)

    if (index !== -1) {
      Vue.set(state.datasets, index, dataset)
    }

  },

  REMOVE_DATASET (state, dataset) {
    const index = getDatasetIndex(dataset, state.datasets)

    if (index) {
      Vue.delete(state.datasets, index)
      Vue.set(dataset, {})
    }
  },

  ADD_DATASET (state, dataset) {
    const datasets = state.datasets
    Vue.set(datasets, datasets.length, dataset)
  },

  SET_DATASET_PUBLISHED_DATA (state, data) {
    Vue.set(state, 'datasetPublishedData', data)
  },

  ADD_DATASET_PUBLISHED_DATA (state, data) {
    Vue.set(state.datasetPublishedData, state.datasetPublishedData.length, data)
  },

  UPDATE_DATASET_PUBLISHED_DATA (state, { data, getters }) {
    const sourceDatasetId = propOr(0, 'sourceDatasetId', data)
    const idx = getters.getPublishedDataIndexByIntId(sourceDatasetId)
    Vue.set(state.datasetPublishedData, idx, data)
  },

  DELETE_DATASET_PUBLISHED_DATA (state, { data, getters }) {
    const sourceDatasetId = propOr(0, 'sourceDatasetId', data)
    const idx = getters.getPublishedDataIndexByIntId(sourceDatasetId)
    Vue.delete(state.datasetPublishedData, idx)
  },

  SET_IS_LOADING_DATASET_PUBLISHED_DATA (state, data) {
    Vue.set(state, 'isLoadingDatasetPublishedData', data)
  },

  SET_IS_LOADING_DATASETS (state, data) {
    const isLoading = defaultTo(false, data)
    Vue.set(state, 'isLoadingDatasets', isLoading)
  },

  SET_IS_LOADING_DATASETS_ERROR (state, data) {
    const hasError = defaultTo(false, data)
    Vue.set(state, 'isLoadingDatasetsError', hasError)
  },

  SET_IS_LOADING_DATASET_BANNER (state, data) {
    const isLoading = defaultTo(false, data)
    Vue.set(state, 'isLoadingDatasetBanner', isLoading)
  },

  SET_IS_LOADING_DATASET_DESCRIPTION (state, data) {
    const isLoading = defaultTo(false, data)
    Vue.set(state, 'isLoadingDatasetDescription', isLoading)
  },

  SET_IS_LOADING_CHANGELOG (state, data) {
    const isLoading = defaultTo(false, data)
    Vue.set(state, 'isLoadingChangelog', isLoading)
  },

  SET_IS_LOADING_DATASET_CONTRIBUTORS (state, data) {
    const isLoading = defaultTo(false, data)
    Vue.set(state, 'isLoadingDatasetContributors', isLoading)
  },

  SET_IS_LOADING_DATASET_IGNORE_FILES (state, data) {
    const isLoading = defaultTo(false, data)
    Vue.set(state, 'isLoadingDatasetIgnoreFiles', isLoading)
  },

  SET_RELATIONSHIP_TYPES (state, data) {
    Vue.set(state, 'relationshipTypes', data)
    Vue.set(state, 'relationshipTypesHash', hashFunction('id', data))
  },

  ADD_RELATIONSHIP_TYPE (state, data) {
    state.relationshipTypes.push(data)
  },

  UPDATE_RELATIONSHIP_TYPE (state, relationship) {
    const idx = findIndex(propEq('id', relationship.id), state.relationshipTypes)
    Vue.set(state.relationshipTypes, idx, relationship)
  },

  DELETE_RELATIONSHIP_TYPE (state, relationship) {
    const idx = findIndex(propEq('id', relationship.id), state.relationshipTypes)
    Vue.delete(state.relationshipTypes, idx)
  },

  UPDATE_IS_LOADING_RELATIONSHIP_TYPES (state, data) {
    Vue.set(state, 'isLoadingRelationshipTypes', data)
  },
  UPDATE_ONBOARDING_EVENTS (state, onboardingEvents){
    Vue.set(state, 'onboardingEvents', onboardingEvents)
  },

  SET_GETTING_STARTED_OPEN (state, data) {
    Vue.set(state, 'gettingStartedOpen', data)
  },

  UPDATE_MODEL_TEMPLATES (state, data){
    Vue.set(state, 'modelTemplates', data)
  },

  SET_DATASET_ROLE (state, data) {
    const role = propOr('viewer', 'role', data)
    Vue.set(state, 'datasetRole', role)
  },
  UPDATE_BLIND_REVIEWER_SUBMISSIONS(state, data) {
    const key = merge(state.blindReviewerSubmissions, data)
    Vue.set(state, 'blindReviewerSubmissions', key)
  },

  SET_DATASET_TEMPLATES (state, datasetTemplates) {
    Vue.set(state, 'datasetTemplates', datasetTemplates)
  },

  ADD_DATASET_TEMPLATE (state, datasetTemplate) {
    const datasetTemplates = state.datasetTemplates
    Vue.set(datasetTemplates, datasetTemplates.length, datasetTemplate)
  },

  REMOVE_DATASET_TEMPLATE (state, datasetTemplate) {
    const idx = findIndex(propEq('id', datasetTemplate.id), state.datasetTemplates)
    Vue.delete(state.datasetTemplates, idx)
  },

  UPDATE_DATASET_TEMPLATES (state, datasetTemplate) {
    const idx = findIndex(propEq('id', datasetTemplate.id), state.datasetTemplates)
    Vue.set(state.datasetTemplates, idx, datasetTemplate)
  },

  SET_IS_LOADING_DATASET_TEMPLATES (state, data) {
    const isLoading = defaultTo(false, data)
    Vue.set(state, 'isLoadingDatasetTemplates', isLoading)
  },

  SET_BF_TERMS_OF_SERVICE_VERSION (state, data) {
    Vue.set(state, 'bfTermsOfServiceVersion', data)
  },

  SET_BULK_EDITING_CHANNELS (state, data) {
    Vue.set(state, 'bulkEditingChannels', data)
  },

  SET_DATASET_DESCRIPTION(state, data) {
    Vue.set(state, 'datasetDescription', data)
  },

  SET_CHANGELOG_TEXT(state, data) {
    Vue.set(state, 'changelogText', data)
  },

  SET_DATASET_DESCRIPTION_ETAG(state, etag) {
    Vue.set(state, 'datasetDescriptionEtag', etag)
  },

  SET_DATASET_IGNORE_FILES(state, data) {
    Vue.set(state, 'datasetIgnoreFiles', data)
  },

  SET_DATASET_DOI(state, data) {
    Vue.set(state, 'datasetDoi', data)
  },

  SET_IS_LOADING_DATASET_DOI(state, data) {
    Vue.set(state, 'isLoadingDatasetDoi', data)
  },

  SET_DATASET_FILTERS(state, data) {
    Vue.set(state, 'datasetFilters', data)
  },

  SET_DATASET_CONTRIBUTORS(state, contributors) {
    Vue.set(state, 'datasetContributors', contributors)
  },

  ADD_DATASET_CONTRIBUTOR(state, contributor) {
    state.datasetContributors.push(contributor)
  },

  UPDATE_DATASET_CONTRIBUTOR(state, contributor) {
    const idx = state.datasetContributors.findIndex(item => {
      return item.id === contributor.id
    })

    state.datasetContributors[idx] = contributor
  },

  REMOVE_DATASET_CONTRIBUTOR(state, idx) {
    Vue.delete(state.datasetContributors, idx)
  },

  SET_ORG_CONTRIBUTORS(state, contributors) {
    Vue.set(state, 'orgContributors', contributors)
  },

  ADD_ORG_CONTRIBUTOR(state, contributor) {
    state.orgContributors.push(contributor)
  },

  UPDATE_ORG_CONTRIBUTOR(state, contributor) {
    const idx = state.orgContributors.findIndex(item => {
      return item.id === contributor.id
    })

    state.orgContributors[idx] = contributor
  },

  UPDATE_ORG_DATASET_STATUSES(state, data) {
    Vue.set(state, 'orgDatasetStatuses', data)
  },

  CLEAR_DATASET_FILTERS(state) {
    Vue.set(state, 'datasetFilters', initialFilterState)
  },

  UPDATE_DATA_USE_AGREEMENTS(state, data) {
    state.dataUseAgreements = data
  },

  CREATE_DATA_USE_AGREEMENT(state, data) {
    state.dataUseAgreements.push(data)
  },

  REMOVE_DATA_USE_AGREEMENT(state, id) {
    const dataUseAgreements = state.dataUseAgreements.filter(agreement => agreement.id !== id)
    state.dataUseAgreements = dataUseAgreements
  },

  UPDATE_DATA_USE_AGREEMENT(state, data) {
    const dataUseAgreements = state.dataUseAgreements.map(agreement => {
      return agreement.id === data.id
        ? data
        : agreement
    })
    state.dataUseAgreements = dataUseAgreements
  },

  UPDATE_DEFAULT_DATA_USE_AGREEMENT(state, data) {
    const dataUseAgreements = state.dataUseAgreements.map(agreement => {
      // If the agreement is the one to update, return the new agreement
      if(agreement.id === data.id) {
        return data
      // If the agreement is the current default, make it not default
      } else if (agreement.isDefault){
        return {
          ...agreement,
          isDefault: false
        }
      // Do nothing and return the agreement
      } else {
        return agreement
      }
    })
    state.dataUseAgreements = dataUseAgreements
  },

  UPDATE_SHOULD_SHOW_LINK_ORCID_DIALOG(state, shouldShowLinkOrcidDialog) {
    state.shouldShowLinkOrcidDialog = shouldShowLinkOrcidDialog
  },

  UPDATE_IS_LINK_ORCID_DIALOG_VISIBLE(state, isLinkOrcidDialogVisible) {
    state.isLinkOrcidDialogVisible = isLinkOrcidDialogVisible
  }
}

// actions
export const actions = {
  setActiveOrgSynced:({commit}) => commit('SET_ACTIVE_ORG_SYNC'),
  updateIsLinkOrcidDialogVisible: ({commit}, evt) => commit('UPDATE_IS_LINK_ORCID_DIALOG_VISIBLE', evt),
  updateCognitoUser: ({commit}, evt) => commit('UPDATE_COGNITO_USER', evt),
  updatePageNotFound: ({ commit }, evt) => commit('SET_PAGE_NOT_FOUND', evt),
  updateScientificUnits: ({ commit }, evt) => commit('UPDATE_SCIENTIFIC_UNITS', evt),
  updateSearchModalSearch: ({ commit }, search) => {
    commit('UPDATE_SEARCH_MODAL_SEARCH', search)
  },

  updateSearchModalVisible: ({ commit, state }, isSearchModalVisible) => {
    commit('UPDATE_SEARCH_MODAL_VISIBLE', isSearchModalVisible)

    /*
     * Determine if the primary navigation should be uncollapsed
     * when closing the search dialog. If the menu starts collapsed
     * when the user opens search, do not uncollapsed it when search closes
     */
    if (isSearchModalVisible) {
      const shouldCollapsePrimaryNav = !state.primaryNavCondensed
      commit('UPDATE_SHOULD_COLLAPSE_PRIMARY_NAV', shouldCollapsePrimaryNav)
    }

    if (state.shouldCollapsePrimaryNav) {
      commit('CONDENSE_PRIMARY_NAV', isSearchModalVisible)
    }

  },
  updateOrgMembers: ({ commit }, evt) => commit('UPDATE_ORG_MEMBERS', evt),
  updateOrgDatasetStatuses: ({ commit}, evt) => commit('UPDATE_ORG_DATASET_STATUSES', evt),
  updateActiveOrganization: ({ commit }, evt) => commit('UPDATE_ACTIVE_ORGANIZATION', evt),
  updateOrganizations: ({ commit }, evt) => commit('UPDATE_ORGANIZATIONS', evt),
  updateProfile: ({ commit }, evt) => commit('UPDATE_PROFILE', evt),
  updateUserToken: ({ commit }, evt) => commit('UPDATE_USER_TOKEN', evt),
  clearState: ({ commit }) => {
    commit('CLEAR_STATE')
    commit('viewer/CLEAR_STATE')
    commit('datasetModule/CLEAR_STATE')
  },
  updateCurDataset: ({ commit }, evt) => commit('UPDATE_CUR_DATASET', getDataset(evt)),
  updateUploadDestination: ({ commit }, evt) => commit('UPDATE_UPLOAD_DESTINATION', getUploadDestination(evt)),
  updateUploadStatus: ({ commit }, evt) => commit('UPDATE_UPLOAD_STATUS', evt),
  updateUploadRemainingAdd: ({ commit }, evt) => commit('UPDATE_UPLOAD_REMAINING_ADD', evt),
  updateUploadRemainingRemove: ({ commit }, evt) => commit('UPDATE_UPLOAD_REMAINING_REMOVE', evt),
  uploadCountAdd: ({ commit }, evt) => commit('UPLOAD_COUNT_ADD', evt),
  uploadCountRemove: ({ commit }, evt) => commit('UPLOAD_COUNT_REMOVE', evt),
  togglePrimaryNav: ({ commit }, evt) => commit('TOGGLE_PRIMARY_NAV', evt),
  condensePrimaryNav: ({ commit }, evt) => commit('CONDENSE_PRIMARY_NAV', evt),
  toggleSecondaryNav: ({ commit }, evt) => commit('TOGGLE_SECONDARY_NAV', evt),
  condenseSecondaryNav: ({ commit }, evt) => commit('CONDENSE_SECONDARY_NAV', evt),
  updateHasGravatar: ({ commit }, evt) => commit('UPDATE_HAS_GRAVATAR', evt),
  setDataset: ({commit}, evt) => commit('SET_DATASET', evt),
  setDatasetEtag: ({commit}, evt) => commit('SET_DATASET_ETAG', evt),
  setDatasetBanner: ({commit}, evt) => commit('SET_DATASET_BANNER', evt),
  updateTeams: ({commit}, evt) => commit('UPDATE_TEAMS', evt),
  updatePublishers: ({commit}, evt) => commit('UPDATE_PUBLISHERS', evt),
  setLastRoute: ({commit}, evt) => commit('SET_LAST_ROUTE', evt),
  updateConcepts: ({commit}, evt) => commit('UPDATE_CONCEPTS', evt),
  updateIsLoadingConcepts: ({commit}, evt) => commit('UPDATE_IS_LOADING_CONCEPTS', evt),
  updateEditingInstance: ({commit}, evt) => commit('UPDATE_EDITING_INSTANCE', evt),
  updateExploreFiles: ({commit}, evt) => commit('UPDATE_EXPLORE_FILES', evt),
  updateFilesProxyId: ({commit}, evt) => commit('UPDATE_FILES_PROXY_ID', evt),
  updateSites: ({commit}, evt) => commit('UPDATE_SITES', evt),
  updateSite: ({commit}, evt) => commit('UPDATE_SITE', evt),
  removeSite: ({commit}, evt) => commit('REMOVE_SITE', evt),
  addSite: ({commit}, evt) => commit('ADD_SITE', evt),
  addConsortiumDataset: ({commit}, evt) => commit('ADD_CONSORTIUM_DATASET', evt),
  updateConsortiumDatasets: ({commit}, evt) => commit('UPDATE_CONSORTIUM_DATASETS', evt),
  removeConsortiumDataset: ({commit}, evt) => commit('REMOVE_CONSORTIUM_DATASET', evt),
  addConsortiumDatasetImporting: ({commit}, evt) => commit('ADD_CONSORTIUM_DATASET_IMPORTING', evt),
  removeConsortiumDatasetImporting: ({commit}, evt) => commit('REMOVE_CONSORTIUM_DATASET_IMPORTING', evt),
  setDatasets: ({commit}, evt) => commit('SET_DATASETS', evt),
  updateDataset: ({commit}, evt) => commit('UPDATE_DATASET', evt),
  removeDataset: ({commit}, evt) => commit('REMOVE_DATASET', evt),
  addDataset: ({commit}, evt) => commit('ADD_DATASET', evt),
  setDatasetPublishedData: ({commit}, evt) => commit('SET_DATASET_PUBLISHED_DATA', evt),
  addDatasetPublishedData: ({commit}, evt) => commit('ADD_DATASET_PUBLISHED_DATA', evt),
  updateDatasetPublishedData: ({commit, getters}, data) => commit('UPDATE_DATASET_PUBLISHED_DATA', { data, getters}),
  deleteDatasetPublishedData: ({commit, getters}, data) => commit('DELETE_DATASET_PUBLISHED_DATA', { data, getters}),
  setIsLoadingDatasetPublishedData: ({commit}, evt) => commit('SET_IS_LOADING_DATASET_PUBLISHED_DATA', evt),
  setIsLoadingDatasets: ({commit}, evt) => commit('SET_IS_LOADING_DATASETS', evt),
  setIsLoadingDatasetsError: ({commit}, evt) => commit('SET_IS_LOADING_DATASETS_ERROR', evt),
  setIsLoadingDatasetBanner: ({commit}, evt) => commit('SET_IS_LOADING_DATASET_BANNER', evt),
  setIsLoadingDatasetDescription: ({commit}, evt) => commit('SET_IS_LOADING_DATASET_DESCRIPTION', evt),
  setIsLoadingChangelog: ({commit}, evt) => commit('SET_IS_LOADING_CHANGELOG', evt),
  setIsLoadingDatasetContributors: ({commit}, evt) => commit('SET_IS_LOADING_DATASET_CONTRIBUTORS', evt),
  setIsLoadingDatasetIgnoreFiles: ({commit}, evt) => commit('SET_IS_LOADING_DATASET_IGNORE_FILES', evt),
  setRelationshipTypes: ({commit}, evt) => commit('SET_RELATIONSHIP_TYPES', evt),
  addRelationshipType: ({commit}, evt) => commit('ADD_RELATIONSHIP_TYPE', evt),
  updateRelationshipType: ({commit}, evt) => commit('UPDATE_RELATIONSHIP_TYPE', evt),
  deleteRelationshipType: ({commit}, evt) => commit('DELETE_RELATIONSHIP_TYPE', evt),
  updateIsLoadingRelationshipTypes: ({commit}, evt) => commit('UPDATE_IS_LOADING_RELATIONSHIP_TYPES', evt),
  updateOnboardingEvents: ({commit}, evt) => commit('UPDATE_ONBOARDING_EVENTS', evt),
  setGettingStartedOpen: ({commit}, evt) => commit('SET_GETTING_STARTED_OPEN', evt),
  updateModelTemplates: ({commit}, evt) => commit('UPDATE_MODEL_TEMPLATES', evt),
  setDatasetRole: ({commit}, evt) => commit('SET_DATASET_ROLE', evt),
  setDatasetTemplates: ({commit}, evt) => commit('SET_DATASET_TEMPLATES', evt),
  addDatasetTemplate: ({commit}, evt) => commit('ADD_DATASET_TEMPLATE', evt),
  removeDatasetTemplate: ({commit}, evt) => commit('REMOVE_DATASET_TEMPLATE', evt),
  updateDatasetTemplates: ({commit}, evt) => commit('UPDATE_DATASET_TEMPLATES', evt),
  setIsLoadingDatasetTemplates: ({commit}, evt) => commit('SET_IS_LOADING_DATASET_TEMPLATES', evt),
  updateTotalUploadSize: ({commit}, evt) => commit('UPDATE_TOTAL_UPLOAD_SIZE', evt),
  updateUploadCount: ({commit}, evt) => commit('UPDATE_UPLOAD_COUNT', evt),
  setBfTermsOfServiceVersion: ({commit}, evt) => commit('SET_BF_TERMS_OF_SERVICE_VERSION', evt),
  setBulkEditingChannels: ({ commit }, evt) => commit('SET_BULK_EDITING_CHANNELS', evt),
  setDatasetDescription: ({commit}, evt) => commit('SET_DATASET_DESCRIPTION', evt),
  setChangelogText: ({commit}, evt) => commit('SET_CHANGELOG_TEXT', evt),
  setDatasetDescriptionEtag: ({commit}, evt) => commit('SET_DATASET_DESCRIPTION_ETAG', evt),
  setDatasetIgnoreFiles: ({commit}, evt) => commit('SET_DATASET_IGNORE_FILES', evt),
  setDatasetDoi: ({commit}, evt) => commit('SET_DATASET_DOI', evt),
  setIsLoadingDatasetDoi: ({commit}, evt) => commit('SET_IS_LOADING_DATASET_DOI', evt),
  updateBlindReviewerSubmissions: ({commit}, evt) => commit('UPDATE_BLIND_REVIEWER_SUBMISSIONS', evt),
  updateThirdReviewerSubmissions: ({commit}, evt) => commit('UPDATE_THIRD_REVIEWER_SUBMISSIONS', evt),
  setDatasetFilters: ({commit}, evt) => commit('SET_DATASET_FILTERS', evt),
  setDatasetContributors: ({commit}, evt) => commit('SET_DATASET_CONTRIBUTORS', evt),
  addContributor: ({ commit }, contributor) => {
    commit('ADD_DATASET_CONTRIBUTOR', clone(contributor))
  },
  updateDatasetContributor: ({ commit }, contributor) => {
    commit('UPDATE_DATASET_CONTRIBUTOR', clone(contributor))
    commit('UPDATE_ORG_CONTRIBUTOR', clone(contributor))
  },
  removeContributor: ({ commit, state }, id) => {
    const idx = findIndex(propEq('id', id), state.datasetContributors)

    if (idx >= 0) {
      commit('REMOVE_DATASET_CONTRIBUTOR', idx)
    } else {
      return Promise.reject(id)
    }
  },
  setOrgContributors: ({commit}, evt) => commit('SET_ORG_CONTRIBUTORS', evt),
  addOrgContributor: ({ commit }, contributor) => {
    commit('ADD_ORG_CONTRIBUTOR', clone(contributor))
  },
  clearDatasetFilters: ({commit}) => commit('CLEAR_DATASET_FILTERS'),
  updateDataUseAgreements: ({ commit }, evt) => commit('UPDATE_DATA_USE_AGREEMENTS', evt),
  createDataUseAgreement: ({ commit }, evt) => commit('CREATE_DATA_USE_AGREEMENT', evt),
  removeDataUseAgreement: ({ commit }, evt) => commit('REMOVE_DATA_USE_AGREEMENT', evt),
  updateDataUseAgreement: ({ commit }, evt) => commit('UPDATE_DATA_USE_AGREEMENT', evt),
  updateDefaultDataUseAgreement: ({ commit }, evt) => commit('UPDATE_DEFAULT_DATA_USE_AGREEMENT', evt),
  updateShouldShowLinkOrcidDialog: ({ commit }, evt) => commit('UPDATE_SHOULD_SHOW_LINK_ORCID_DIALOG', evt)
}

// getters
export const getters = {
  isWelcomeOrg: state => {
    const featuresList = pathOr([], ['activeOrganization', 'organization', 'features'], state)
    return contains('sandbox_org_feature', featuresList)
  },
  isOrgSynced: state => state.activeOrgSynced,
  config: state => state.config,
  profile: state => state.profile,
  userToken: state => state.userToken,
  getProfile: state => () => state.profile,
  organizations: state => state.organizations,
  activeOrganization: state => state.activeOrganization,
  getActiveOrganization: state => () => state.activeOrganization,
  orgMembers: state => state.orgMembers,
  getOrgMembers: state => () => state.orgMembers,
  getOrgMember: state => (id) => {
    return defaultTo({}, find(propEq('id', id), state.orgMembers))
  },
  getOrgMemberByIntId: state => (id) => {
    return defaultTo({}, find(propEq('intId', id), state.orgMembers))
  },
  getOrgMembersById: state => (list) => {
    return state.orgMembers.filter(member => list.includes(member.id))
  },
  getOrgMembersByIntId: state => (list) => {
    return state.orgMembers.filter(member => list.includes(member.intId))
  },
  getTeam: state => (id) => {
    return defaultTo({}, find(pathEq(['team', 'id'], id), state.teams))
  },
  getUserToken: state => () => state.userToken,
  uploadCount: state => state.uploadCount,
  uploading: state => state.uploading,
  uploadRemaining: state => state.uploadRemaining,
  getPrimaryNavOpen: state => () => state.primaryNavOpen,
  primaryNavOpen: state => state.primaryNavOpen,
  getSecondaryNavOpen: state => () => state.secondaryNavOpen,
  hasGravatar: state => state.hasGravatar,
  uploadDestination: state => state.uploadDestination,
  dataset: state => state.dataset,
  getDataset: state => () => state.dataset,
  getDatasetById: state => (id) => {
    return find(pathEq(['content', 'id'], id), state.datasets)
  },
  getDatasetByIntId: state => (intId) => {
    return find(pathEq(['content', 'intId'], intId), state.datasets)
  },
  isDatasetOwner: state => state.isDatasetOwner,
  teams: state => state.teams,
  lastRoute: state => state.lastRoute,
  getLastRoute: state => () => state.lastRoute,
  concepts: state => state.concepts,
  isLoadingConcepts: state => state.isLoadingConcepts,
  editingInstance: state => state.editingInstance,
  exploreFiles: state => state.exploreFiles,
  hasFeature: state => (featureName) => {
    const featuresList = pathOr([], ['activeOrganization', 'organization', 'features'], state)
    return contains(featureName, featuresList)
  },
  getModelById: state => (modelId) => {
    return find(propEq('id', modelId), state.concepts)
  },
  getModelByName: state => (modelName) => {
    return find(propEq('name', modelName), state.concepts)
  },
  getModelCount: state => (modelName) => compose(
    propOr(0, 'count'),
    find(propEq('name', modelName))
  )(state.concepts),
  filesProxyId: state => state.filesProxyId,
  getFilesProxyId: state => () => state.filesProxyId,
  getConsortiumDataset: state => (datasetId) => compose(
    defaultTo({}),
    find(propEq('id', datasetId))
  )(state.consortiumDatasets),
  getConsortiumDatasetImporting: state => (datasetId) => compose(
    defaultTo({}),
    find(propEq('id', datasetId))
  )(state.consortiumDatasetsImporting),
  getOrganizationByIntId: state => (id) => compose(
    defaultTo({}),
    find(pathEq(['organization', 'intId'], id))
  )(state.organizations),
  getRelationshipTypes: state => () => state.relationshipTypes,
  getRelationshipTypeByName: state => (name) => {
    return compose(
      defaultTo({}),
      find(propEq('name', name))
    )(state.relationshipTypes)
  },
  totalRecordsCount: () => compose(
    sum,
    pluck('count'),
    defaultTo([])
  )(state.concepts),
  modelsCount: () => compose(
    length,
    defaultTo([])
  )(state.concepts),
  getMostUsedModels: state => (count = 5) => {
    const sortByProp = (a, b) => { return b.count - a.count }
    const filterEmpty = filter(model => model.count > 0)

    return compose(
      take(count),
      sort(sortByProp),
      filterEmpty,
      defaultTo([])
    )(state.concepts)
  },
  getRelationshipTypeDisplayName: state => (name) => {
    return compose(
      propOr('', 'displayName'),
      find(propEq('name', name))
    )(state.relationshipTypes)
  },
  getGettingStartedOpen: state => () => state.gettingStartedOpen,
  modelTemplates: state => () => state.modelTemplates,
  getPermission: state => (role = 'manager') => {
    const roles = {
      owner: 3,
      manager: 2,
      editor: 1,
      viewer: 0
    }
    return roles[state.datasetRole] >= roles[role]
  },
  getDatasetRole: state => () => state.datasetRole,
  getPublishedDataByIntId: state => (id) => {
    return defaultTo({}, find(propEq('sourceDatasetId', id), state.datasetPublishedData))
  },
  getPublishedDataIndexByIntId: state => (id) => {
    return defaultTo({}, findIndex(propEq('sourceDatasetId', id), state.datasetPublishedData))
  },
  datasetOwner: (state, getters) => {
    const ownerId = propOr('', 'owner', state.dataset)

    return getters.getOrgMember(ownerId)
  },
  isUserDatasetOwner: (state) =>  (dataset) => {
    return state.profile.id === dataset.owner
  },
  hasOrcidId: (state) => {
    return pathOr(false, ['profile', 'orcid', 'orcid'], state)
  },
  datasetOwnerHasOrcidId: (state, getters) => {
    const owner = getters.datasetOwner
    return pathOr(false, ['orcid', 'orcid'], owner)
  },
  isUserSuperAdmin: state => {
    return state.profile.isSuperAdmin === true
  },
  isUserPublisher: state => {
    return state.publishers.map(p => p.id).includes(state.profile.id)
  },
  datasetLocked: state => {
    return state.dataset.locked
  },
  publisherTeam: state => state.teams.map(t => t.team).find(t => t.systemTeamType === 'publishers'),
  datasetIntId: (state) => {
    return state.dataset.content
      ? state.dataset.content.intId
      : null
  },
  hasOrcidOnboardingEvent: state => {
    return state.onboardingEvents.includes('AddedOrcid') || false
  },
}

// vuex store instance
export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules: {
    viewer,
    datasetModule,
    publishingModule,
    collectionsModule,
    integrationsModule,
    filesModule,
    repositoryModule
  }
})
